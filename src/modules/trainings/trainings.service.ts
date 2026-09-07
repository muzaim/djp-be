import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Training } from './entities/training.entity';
import { Position } from '../organizations/entities/position.entity';
import { OrganizationUnit } from '../organizations/entities/organization-unit.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,
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

  private transformTraining(t: Training): any {
    if (!t) return t;
    let enrichedPosition = null;
    if (t.position) {
      const division = this.getDivisionForOrgUnit(t.position.organizationUnit);
      enrichedPosition = {
        id: t.position.id,
        title: t.position.title,
        jobLevel: t.position.jobLevel
          ? {
              id: t.position.jobLevel.id,
              code: t.position.jobLevel.code,
              name: t.position.jobLevel.name,
            }
          : null,
        organizationUnit: t.position.organizationUnit
          ? {
              id: t.position.organizationUnit.id,
              code: t.position.organizationUnit.code,
              name: t.position.organizationUnit.name,
              levelType: t.position.organizationUnit.levelType,
            }
          : null,
        division,
      };
    }

    return {
      id: t.id,
      positionId: t.positionId,
      certification: t.certification,
      isActive: t.isActive,
      position: enrichedPosition,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      deletedAt: t.deletedAt,
    };
  }

  async create(createDto: CreateTrainingDto): Promise<any> {
    const pos = await this.positionRepository.findOneBy({ id: createDto.positionId });
    if (!pos) {
      throw new NotFoundException(`Position with ID "${createDto.positionId}" not found`);
    }

    const item = this.trainingRepository.create(createDto);
    const saved = await this.trainingRepository.save(item);
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

    const qb = this.trainingRepository
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('tr.deletedAt IS NULL');

    if (search) {
      qb.andWhere('tr.certification LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('tr.positionId = :positionId', { positionId });
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

    qb.orderBy('tr.createdAt', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.transformTraining(item)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const item = await this.trainingRepository.findOne({
      where: { id },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
    });
    if (!item) {
      throw new NotFoundException(`Training / Certification with ID "${id}" not found`);
    }
    return this.transformTraining(item);
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    const items = await this.trainingRepository.find({
      where: { positionId },
      relations: [
        'position',
        'position.organizationUnit',
        'position.organizationUnit.parent',
        'position.jobLevel',
      ],
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.transformTraining(item));
  }

  async update(id: string, updateDto: UpdateTrainingDto): Promise<any> {
    const item = await this.trainingRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Training / Certification with ID "${id}" not found`);
    }

    if (updateDto.positionId) {
      const pos = await this.positionRepository.findOneBy({ id: updateDto.positionId });
      if (!pos) {
        throw new NotFoundException(`Position with ID "${updateDto.positionId}" not found`);
      }
    }

    Object.assign(item, updateDto);
    await this.trainingRepository.save(item);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.trainingRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Training / Certification with ID "${id}" not found`);
    }
    await this.trainingRepository.softRemove(item);
  }

  async exportToExcel(
    res: Response,
    paginationDto: PaginationDto = new PaginationDto(),
    divisionId?: string,
    departmentId?: string,
    positionId?: string,
  ): Promise<void> {
    const search = paginationDto.search || '';

    const qb = this.trainingRepository
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.position', 'position')
      .leftJoinAndSelect('position.organizationUnit', 'orgUnit')
      .leftJoinAndSelect('orgUnit.parent', 'parentUnit')
      .leftJoinAndSelect('parentUnit.parent', 'grandparentUnit')
      .leftJoinAndSelect('position.jobLevel', 'jobLevel')
      .where('tr.deletedAt IS NULL');

    if (search) {
      qb.andWhere('tr.certification LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (positionId) {
      qb.andWhere('tr.positionId = :positionId', { positionId });
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

    qb.orderBy('tr.createdAt', 'ASC');

    const rawItems = await qb.getMany();
    const items = rawItems.map((item) => this.transformTraining(item));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Training Sertifikasi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Divisi', key: 'division', width: 32 },
      { header: 'Fungsi', key: 'position', width: 32 },
      { header: 'Sertifikasi / Pelatihan', key: 'certification', width: 45 },
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
        certification: item.certification,
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
      `attachment; filename=Master_Training_Sertifikasi_${timestamp}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
