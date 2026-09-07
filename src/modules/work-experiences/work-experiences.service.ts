import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { WorkExperience } from './entities/work-experience.entity';
import { Position } from '../organizations/entities/position.entity';
import { OrganizationUnit } from '../organizations/entities/organization-unit.entity';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class WorkExperiencesService {
  constructor(
    @InjectRepository(WorkExperience)
    private readonly workExperienceRepository: Repository<WorkExperience>,
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

  private transformWorkExperience(we: WorkExperience): any {
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
      experienceDuration: we.experienceDuration,
      field: we.field,
      isActive: we.isActive,
      position: enrichedPosition,
      createdAt: we.createdAt,
      updatedAt: we.updatedAt,
      deletedAt: we.deletedAt,
    };
  }

  async create(createDto: CreateWorkExperienceDto): Promise<any> {
    const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
    if (!pos) {
      throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
    }

    const item = this.workExperienceRepository.create(createDto);
    const saved = await this.workExperienceRepository.save(item);
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

    const qb = this.workExperienceRepository
      .createQueryBuilder('we')
      .leftJoinAndSelect('we.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('we.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(we.field LIKE :search OR we.experienceDuration LIKE :search)', {
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
      items: items.map((item) => this.transformWorkExperience(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const item = await this.workExperienceRepository.findOne({
      where: { id },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Work Experience with ID "${id}" not found`);
    }
    return this.transformWorkExperience(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.workExperienceRepository.find({
      where: { positionId },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformWorkExperience(item));
  }

  async update(id: string, updateDto: UpdateWorkExperienceDto): Promise<any> {
    const item = await this.workExperienceRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Work Experience with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    Object.assign(item, updateDto);
    await this.workExperienceRepository.save(item);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.workExperienceRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Work Experience with ID "${id}" not found`);
    }
    await this.workExperienceRepository.softRemove(item);
  }

  async exportToExcel(
    res: Response,
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<void> {
    const search = paginationDto.search || '';

    const qb = this.workExperienceRepository
      .createQueryBuilder('we')
      .leftJoinAndSelect('we.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('we.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(we.field LIKE :search OR we.experienceDuration LIKE :search)', {
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
    const items = rawItems.map((item) => this.transformWorkExperience(item));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Pengalaman Kerja');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Divisi', key: 'division', width: 32 },
      { header: 'Fungsi', key: 'position', width: 32 },
      { header: 'Bidang', key: 'field', width: 42 },
      { header: 'Lama Pengalaman', key: 'experienceDuration', width: 30 },
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
        division: item.position?.division?.name || '-',
        position: item.position?.title || '-',
        field: item.field,
        experienceDuration: item.experienceDuration,
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
      `attachment; filename=Master_Pengalaman_Kerja_${timestamp}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
