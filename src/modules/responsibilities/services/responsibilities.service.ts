import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Responsibility } from '../entities/responsibility.entity';
import { Activity } from '../entities/activity.entity';
import { Position } from '../../organizations/entities/position.entity';
import { OrganizationUnit } from '../../organizations/entities/organization-unit.entity';
import { CreateResponsibilityDto } from '../dto/create-responsibility.dto';
import { UpdateResponsibilityDto } from '../dto/update-responsibility.dto';
import { PaginationDto, PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class ResponsibilitiesService {
  constructor(
    @InjectRepository(Responsibility)
    private readonly responsibilityRepository: Repository<Responsibility>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  private getDivisionForOrgUnit(unit: OrganizationUnit | null | undefined): any {
    if (!unit) return null;
    let curr: OrganizationUnit | null = unit;
    while (curr) {
      if (curr.levelType === 'DIVISION') {
        return {
          id: curr.id,
          code: curr.code,
          name: curr.name,
        };
      }
      curr = curr.parent || null;
    }
    return null;
  }

  private transformResponsibility(resp: Responsibility): any {
    if (!resp) return resp;
    let enrichedPosition = null;
    if (resp.position) {
      const division = this.getDivisionForOrgUnit(resp.position.organizationUnit);
      enrichedPosition = {
        id: resp.position.id,
        title: resp.position.title,
        jobLevel: resp.position.jobLevel
          ? {
              id: resp.position.jobLevel.id,
              code: resp.position.jobLevel.code,
              name: resp.position.jobLevel.name,
            }
          : null,
        organizationUnit: resp.position.organizationUnit
          ? {
              id: resp.position.organizationUnit.id,
              code: resp.position.organizationUnit.code,
              name: resp.position.organizationUnit.name,
              levelType: resp.position.organizationUnit.levelType,
            }
          : null,
        division,
      };
    }

    return {
      id: resp.id,
      positionId: resp.positionId,
      code: resp.code,
      name: resp.name,
      isActive: resp.isActive,
      position: enrichedPosition,
      activities: resp.activities || [],
      createdAt: resp.createdAt,
      updatedAt: resp.updatedAt,
      deletedAt: resp.deletedAt,
    };
  }

  async create(createDto: CreateResponsibilityDto): Promise<any> {
    if (createDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
      }
    }

    const { activities, ...respData } = createDto;
    const responsibility = this.responsibilityRepository.create(respData);

    if (activities && activities.length > 0) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create(act),
      );
    }

    const saved = await this.responsibilityRepository.save(responsibility);
    return this.findOne(saved.id);
  }

  async findAll(
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<PaginatedResult<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const search = paginationDto.search || '';

    const qb = this.responsibilityRepository
      .createQueryBuilder('resp')
      .leftJoinAndSelect('resp.activities', 'activities')
      .leftJoinAndSelect('resp.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('resp.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(resp.name LIKE :search OR resp.code LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('resp.positionId = :positionId', { positionId });
    }

    if (departmentId) {
      qb.andWhere('position.organizationUnitId = :departmentId', {
        departmentId,
      });
    }

    if (divisionId) {
      qb.andWhere(
        '(orgUnit.id = :divisionId OR parentUnit.id = :divisionId OR grandparentUnit.id = :divisionId)',
        { divisionId },
      );
    }

    qb.orderBy('resp.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.transformResponsibility(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async exportToExcel(
    res: Response,
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<void> {
    const search = paginationDto.search || '';

    const qb = this.responsibilityRepository
      .createQueryBuilder('resp')
      .leftJoinAndSelect('resp.activities', 'activities')
      .leftJoinAndSelect('resp.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('resp.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(resp.name LIKE :search OR resp.code LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('resp.positionId = :positionId', { positionId });
    }

    if (departmentId) {
      qb.andWhere('position.organizationUnitId = :departmentId', {
        departmentId,
      });
    }

    if (divisionId) {
      qb.andWhere(
        '(orgUnit.id = :divisionId OR parentUnit.id = :divisionId OR grandparentUnit.id = :divisionId)',
        { divisionId },
      );
    }

    qb.orderBy('resp.createdAt', 'ASC');

    const rawItems = await qb.getMany();
    const items = rawItems.map((item) => this.transformResponsibility(item));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Tanggung Jawab');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Kode TJU', key: 'code', width: 16 },
      { header: 'Divisi', key: 'division', width: 32 },
      { header: 'Fungsi', key: 'position', width: 32 },
      { header: 'Nama Tanggung Jawab', key: 'name', width: 42 },
      { header: 'Aktivitas', key: 'activities', width: 45 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F497D' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    // Add Data Rows (Flat per Activity)
    let rowNo = 1;
    items.forEach((item) => {
      if (item.activities && item.activities.length > 0) {
        item.activities.forEach((act: any) => {
          const row = worksheet.addRow({
            no: rowNo++,
            code: item.code || '-',
            division: item.position?.division?.name || '-',
            position: item.position?.title || '-',
            name: item.name,
            activities: act.name,
          });

          row.alignment = { vertical: 'middle' };
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'D9D9D9' } },
              left: { style: 'thin', color: { argb: 'D9D9D9' } },
              bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
              right: { style: 'thin', color: { argb: 'D9D9D9' } },
            };
          });
        });
      } else {
        const row = worksheet.addRow({
          no: rowNo++,
          code: item.code || '-',
          division: item.position?.division?.name || '-',
          position: item.position?.title || '-',
          name: item.name,
          activities: '-',
        });

        row.alignment = { vertical: 'middle' };
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'D9D9D9' } },
            left: { style: 'thin', color: { argb: 'D9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
            right: { style: 'thin', color: { argb: 'D9D9D9' } },
          };
        });
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Master_Tanggung_Jawab_${timestamp}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async findOne(id: string): Promise<any> {
    const item = await this.responsibilityRepository.findOne({
      where: { id },
      relations: [
        'activities',
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }
    return this.transformResponsibility(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.responsibilityRepository.find({
      where: { positionId },
      relations: [
        'activities',
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformResponsibility(item));
  }

  async findActivitiesByResponsibilityId(
    responsibilityId: string,
  ): Promise<Activity[]> {
    await this.findOne(responsibilityId);
    return this.activityRepository.find({
      where: { responsibilityId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateResponsibilityDto,
  ): Promise<any> {
    const responsibility = await this.responsibilityRepository.findOneBy({ id });
    if (!responsibility) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    const { activities, ...respData } = updateDto;
    Object.assign(responsibility, respData);

    if (activities) {
      responsibility.activities = activities.map((act) =>
        this.activityRepository.create({ ...act, responsibilityId: id }),
      );
    }

    await this.responsibilityRepository.save(responsibility);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const responsibility = await this.responsibilityRepository.findOneBy({ id });
    if (!responsibility) {
      throw new NotFoundException(`Responsibility with ID "${id}" not found`);
    }
    await this.responsibilityRepository.softRemove(responsibility);
  }
}
