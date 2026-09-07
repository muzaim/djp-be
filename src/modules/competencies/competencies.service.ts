import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Competency } from './entities/competency.entity';
import { Position } from '../organizations/entities/position.entity';
import { OrganizationUnit } from '../organizations/entities/organization-unit.entity';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class CompetenciesService {
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
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

  private transformCompetency(comp: Competency): any {
    if (!comp) return comp;
    let enrichedPosition = null;
    if (comp.position) {
      const division = this.getDivisionForOrgUnit(comp.position.organizationUnit);
      enrichedPosition = {
        id: comp.position.id,
        title: comp.position.title,
        jobLevel: comp.position.jobLevel
          ? {
              id: comp.position.jobLevel.id,
              code: comp.position.jobLevel.code,
              name: comp.position.jobLevel.name,
            }
          : null,
        organizationUnit: comp.position.organizationUnit
          ? {
              id: comp.position.organizationUnit.id,
              code: comp.position.organizationUnit.code,
              name: comp.position.organizationUnit.name,
              levelType: comp.position.organizationUnit.levelType,
            }
          : null,
        division,
      };
    }

    return {
      id: comp.id,
      positionId: comp.positionId,
      degreeLevel: comp.degreeLevel,
      major: comp.major,
      isActive: comp.isActive,
      position: enrichedPosition,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
      deletedAt: comp.deletedAt,
    };
  }

  async create(createDto: CreateCompetencyDto): Promise<any> {
    const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
    if (!pos) {
      throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
    }

    const item = this.competencyRepository.create(createDto);
    const saved = await this.competencyRepository.save(item);
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

    const qb = this.competencyRepository
      .createQueryBuilder('comp')
      .leftJoinAndSelect('comp.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('comp.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(comp.degreeLevel LIKE :search OR comp.major LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('comp.positionId = :positionId', { positionId });
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

    qb.orderBy('comp.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.transformCompetency(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const item = await this.competencyRepository.findOne({
      where: { id },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Competency with ID "${id}" not found`);
    }
    return this.transformCompetency(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.competencyRepository.find({
      where: { positionId },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformCompetency(item));
  }

  async update(id: string, updateDto: UpdateCompetencyDto): Promise<any> {
    const item = await this.competencyRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Competency with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    Object.assign(item, updateDto);
    await this.competencyRepository.save(item);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.competencyRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Competency with ID "${id}" not found`);
    }
    await this.competencyRepository.softRemove(item);
  }

  async exportToExcel(
    res: Response,
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<void> {
    const search = paginationDto.search || '';

    const qb = this.competencyRepository
      .createQueryBuilder('comp')
      .leftJoinAndSelect('comp.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('comp.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(comp.degreeLevel LIKE :search OR comp.major LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('comp.positionId = :positionId', { positionId });
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

    qb.orderBy('comp.createdAt', 'ASC');

    const rawItems = await qb.getMany();
    const items = rawItems.map((item) => this.transformCompetency(item));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Kompetensi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Divisi', key: 'division', width: 32 },
      { header: 'Fungsi', key: 'position', width: 32 },
      { header: 'Tingkat Pendidikan', key: 'degreeLevel', width: 22 },
      { header: 'Jurusan', key: 'major', width: 42 },
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
        degreeLevel: item.degreeLevel,
        major: item.major,
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
      `attachment; filename=Master_Kompetensi_${timestamp}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
