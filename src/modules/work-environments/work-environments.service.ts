import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { WorkEnvironment } from './entities/work-environment.entity';
import { Position } from '../organizations/entities/position.entity';
import { OrganizationUnit } from '../organizations/entities/organization-unit.entity';
import { CreateWorkEnvironmentDto } from './dto/create-work-environment.dto';
import { UpdateWorkEnvironmentDto } from './dto/update-work-environment.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class WorkEnvironmentsService {
  constructor(
    @InjectRepository(WorkEnvironment)
    private readonly workEnvironmentRepository: Repository<WorkEnvironment>,
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

  private transformWorkEnvironment(we: WorkEnvironment): any {
    if (!we) return we;
    let enrichedPosition = null;
    if (we.position) {
      const division = this.getDivisionForOrgUnit(we.position.organizationUnit);
      enrichedPosition = {
        id: we.position.id,
        title: we.position.title,
        jobLevel: we.position.jobLevel
          ? {
              id: we.position.jobLevel.id,
              code: we.position.jobLevel.code,
              name: we.position.jobLevel.name,
            }
          : null,
        organizationUnit: we.position.organizationUnit
          ? {
              id: we.position.organizationUnit.id,
              code: we.position.organizationUnit.code,
              name: we.position.organizationUnit.name,
              levelType: we.position.organizationUnit.levelType,
            }
          : null,
        division,
      };
    }

    return {
      id: we.id,
      positionId: we.positionId,
      code: we.code,
      name: we.name,
      scale: we.scale,
      isActive: we.isActive,
      position: enrichedPosition,
      createdAt: we.createdAt,
      updatedAt: we.updatedAt,
      deletedAt: we.deletedAt,
    };
  }

  async create(createDto: CreateWorkEnvironmentDto): Promise<any> {
    const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
    if (!pos) {
      throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
    }

    const item = this.workEnvironmentRepository.create(createDto);
    const saved = await this.workEnvironmentRepository.save(item);
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

    const qb = this.workEnvironmentRepository
      .createQueryBuilder('we')
      .leftJoinAndSelect('we.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('we.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(we.name LIKE :search OR we.scale LIKE :search OR we.code LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('we.positionId = :positionId', { positionId });
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

    qb.orderBy('we.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.transformWorkEnvironment(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const item = await this.workEnvironmentRepository.findOne({
      where: { id },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Work Environment with ID "${id}" not found`);
    }
    return this.transformWorkEnvironment(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.workEnvironmentRepository.find({
      where: { positionId },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformWorkEnvironment(item));
  }

  async update(id: string, updateDto: UpdateWorkEnvironmentDto): Promise<any> {
    const item = await this.workEnvironmentRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Work Environment with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    Object.assign(item, updateDto);
    await this.workEnvironmentRepository.save(item);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.workEnvironmentRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Work Environment with ID "${id}" not found`);
    }
    await this.workEnvironmentRepository.softRemove(item);
  }

  async exportToExcel(
    res: Response,
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<void> {
    const search = paginationDto.search || '';

    const qb = this.workEnvironmentRepository
      .createQueryBuilder('we')
      .leftJoinAndSelect('we.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('we.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(we.name LIKE :search OR we.scale LIKE :search OR we.code LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('we.positionId = :positionId', { positionId });
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

    qb.orderBy('we.createdAt', 'ASC');

    const rawItems = await qb.getMany();
    const items = rawItems.map((item) => this.transformWorkEnvironment(item));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Lingkungan Kerja');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Kode', key: 'code', width: 16 },
      { header: 'Divisi', key: 'division', width: 32 },
      { header: 'Fungsi', key: 'position', width: 32 },
      { header: 'Nama Lingkungan Kerja', key: 'name', width: 42 },
      { header: 'Skala', key: 'scale', width: 30 },
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

    items.forEach((item, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        code: item.code || '-',
        division: item.position?.division?.name || '-',
        position: item.position?.title || '-',
        name: item.name,
        scale: item.scale,
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

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Master_Lingkungan_Kerja_${timestamp}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
