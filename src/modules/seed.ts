import { AppDataSource } from '../database/data-source';
import { JobLevel } from './organizations/entities/job-level.entity';
import { OrganizationUnit } from './organizations/entities/organization-unit.entity';
import { Position } from './organizations/entities/position.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function resetAndSeedClean() {
  await AppDataSource.initialize();
  console.log('Database connected. Clearing all data for clean slate...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // 1. Reset Database completely
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query('TRUNCATE TABLE sys_user_roles');
    await queryRunner.query('TRUNCATE TABLE mst_users');
    await queryRunner.query('TRUNCATE TABLE mst_positions');
    await queryRunner.query('TRUNCATE TABLE mst_organization_units');
    await queryRunner.query('TRUNCATE TABLE mst_job_levels');
    await queryRunner.query('TRUNCATE TABLE sys_roles');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Database reset clean. Inserting 3 requested divisions...');

    const jobLevelRepo = AppDataSource.getRepository(JobLevel);
    const orgRepo = AppDataSource.getRepository(OrganizationUnit);
    const posRepo = AppDataSource.getRepository(Position);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    // 2. Insert Job Levels
    const lvlDir = await jobLevelRepo.save(jobLevelRepo.create({ code: 'DIR', name: 'Direktur', rankWeight: 10 }));
    const lvlKadiv = await jobLevelRepo.save(jobLevelRepo.create({ code: 'KADIV', name: 'Kepala Divisi', rankWeight: 20 }));
    const lvlKabag = await jobLevelRepo.save(jobLevelRepo.create({ code: 'KABAG', name: 'Kepala Bagian', rankWeight: 30 }));
    const lvlStaff = await jobLevelRepo.save(jobLevelRepo.create({ code: 'STAFF', name: 'Staff / Fungsi', rankWeight: 40 }));

    // 3. Insert Company Root
    const orgCompany = await orgRepo.save(orgRepo.create({
      code: 'SMF',
      name: 'PT Sarana Multigriya Finansial (Persero)',
      levelType: 'COMPANY',
    }));

    // 4. Insert Directorates
    // A. Direktorat Utama
    const orgDirut = await orgRepo.save(orgRepo.create({
      code: 'DIRUT',
      name: 'Direktorat Utama',
      levelType: 'DIRECTORATE',
      parent: orgCompany,
    }));
    const posDirut = await posRepo.save(posRepo.create({
      title: 'Direktur Utama',
      organizationUnit: orgDirut,
      jobLevel: lvlDir,
    }));

    // B. Direktur Keuangan dan Manajemen Risiko
    const orgDirKeu = await orgRepo.save(orgRepo.create({
      code: 'DIR_KEU_MR',
      name: 'Direktur Keuangan dan Manajemen Risiko',
      levelType: 'DIRECTORATE',
      parent: orgCompany,
    }));
    const posDirKeu = await posRepo.save(posRepo.create({
      title: 'Direktur Keuangan dan Manajemen Risiko',
      organizationUnit: orgDirKeu,
      jobLevel: lvlDir,
      parentPosition: posDirut,
    }));


    // =========================================================================
    // CONTOH 1: Divisi Strategi dan Pengembangan Korporasi (Direktorat Utama)
    // =========================================================================
    const orgDivSPK = await orgRepo.save(orgRepo.create({
      code: 'DIV_SPK',
      name: 'Divisi Strategi dan Pengembangan Korporasi',
      levelType: 'DIVISION',
      parent: orgDirut,
    }));
    const posKadivSPK = await posRepo.save(posRepo.create({
      title: 'Kepala Divisi Strategi dan Pengembangan Korporasi',
      organizationUnit: orgDivSPK,
      jobLevel: lvlKadiv,
      parentPosition: posDirut,
    }));

    // Bagian 1: Perencanaan Strategis dan Enviromental, Sosial dan Governance ESG
    const orgSPK_Bag1 = await orgRepo.save(orgRepo.create({
      code: 'SPK_BAG1',
      name: 'Perencanaan Strategis dan Enviromental, Sosial dan Governance ESG',
      levelType: 'DEPARTMENT',
      parent: orgDivSPK,
    }));
    const posKabagSPK_1 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian Perencanaan Strategis dan ESG',
      organizationUnit: orgSPK_Bag1,
      jobLevel: lvlKabag,
      parentPosition: posKadivSPK,
    }));
    // Turunan Bagian 1
    await posRepo.save(posRepo.create({ title: 'Perencanaan Strategis', organizationUnit: orgSPK_Bag1, jobLevel: lvlStaff, parentPosition: posKabagSPK_1 }));
    await posRepo.save(posRepo.create({ title: 'ESG dan Evaluasi Kinerja dan Anak Usaha', organizationUnit: orgSPK_Bag1, jobLevel: lvlStaff, parentPosition: posKabagSPK_1 }));

    // Bagian 2: Manajemen Proyek dan Hubungan Internasional
    const orgSPK_Bag2 = await orgRepo.save(orgRepo.create({
      code: 'SPK_BAG2',
      name: 'Manajemen Proyek dan Hubungan Internasional',
      levelType: 'DEPARTMENT',
      parent: orgDivSPK,
    }));
    const posKabagSPK_2 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian Manajemen Proyek dan Hubungan Internasional',
      organizationUnit: orgSPK_Bag2,
      jobLevel: lvlKabag,
      parentPosition: posKadivSPK,
    }));
    // Turunan Bagian 2
    await posRepo.save(posRepo.create({ title: 'Manajemen Proyek', organizationUnit: orgSPK_Bag2, jobLevel: lvlStaff, parentPosition: posKabagSPK_2 }));
    await posRepo.save(posRepo.create({ title: 'Hubungan Internasional', organizationUnit: orgSPK_Bag2, jobLevel: lvlStaff, parentPosition: posKabagSPK_2 }));


    // =========================================================================
    // CONTOH 2: Divisi Sekretariat Perusahaan (Direktorat Utama)
    // =========================================================================
    const orgDivSekper = await orgRepo.save(orgRepo.create({
      code: 'SEKRETARIAT_PERUSAHAAN',
      name: 'Sekretariat Perusahaan',
      levelType: 'DIVISION',
      parent: orgDirut,
    }));
    const posKadivSekper = await posRepo.save(posRepo.create({
      title: 'Kepala Sekretariat Perusahaan',
      organizationUnit: orgDivSekper,
      jobLevel: lvlKadiv,
      parentPosition: posDirut,
    }));

    // Bagian 1: Komunikasi Perusahaan dan Hub Pemangku Kepentingan
    const orgSekper_Bag1 = await orgRepo.save(orgRepo.create({
      code: 'SEKPER_BAG1',
      name: 'Komunikasi Perusahaan dan Hub Pemangku Kepentingan',
      levelType: 'DEPARTMENT',
      parent: orgDivSekper,
    }));
    const posKabagSekper_1 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian Komunikasi Perusahaan dan Hub Pemangku Kepentingan',
      organizationUnit: orgSekper_Bag1,
      jobLevel: lvlKabag,
      parentPosition: posKadivSekper,
    }));
    // Turunan Bagian 1
    await posRepo.save(posRepo.create({ title: 'Hubungan Stakeholder dan Pelaporan', organizationUnit: orgSekper_Bag1, jobLevel: lvlStaff, parentPosition: posKabagSekper_1 }));
    await posRepo.save(posRepo.create({ title: 'Manajemen Brand dan Aset Digital', organizationUnit: orgSekper_Bag1, jobLevel: lvlStaff, parentPosition: posKabagSekper_1 }));
    await posRepo.save(posRepo.create({ title: 'Komunikasi Korporasi', organizationUnit: orgSekper_Bag1, jobLevel: lvlStaff, parentPosition: posKabagSekper_1 }));

    // Bagian 2: TJSL dan Pengembangan Komunitas
    const orgSekper_Bag2 = await orgRepo.save(orgRepo.create({
      code: 'SEKPER_BAG2',
      name: 'TJSL dan Pengembangan Komunitas',
      levelType: 'DEPARTMENT',
      parent: orgDivSekper,
    }));
    const posKabagSekper_2 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian TJSL dan Pengembangan Komunitas',
      organizationUnit: orgSekper_Bag2,
      jobLevel: lvlKabag,
      parentPosition: posKadivSekper,
    }));
    // Turunan Bagian 2
    await posRepo.save(posRepo.create({ title: 'Pengembangan Komunitas', organizationUnit: orgSekper_Bag2, jobLevel: lvlStaff, parentPosition: posKabagSekper_2 }));
    await posRepo.save(posRepo.create({ title: 'TPPK dan Homestay', organizationUnit: orgSekper_Bag2, jobLevel: lvlStaff, parentPosition: posKabagSekper_2 }));
    await posRepo.save(posRepo.create({ title: 'Manajemen Stakeholder Internal', organizationUnit: orgSekper_Bag2, jobLevel: lvlStaff, parentPosition: posKabagSekper_2 }));

    // Non Bagian (Langsung under Kadiv Sekretariat Perusahaan)
    await posRepo.save(posRepo.create({ title: 'EBA Ritel', organizationUnit: orgDivSekper, jobLevel: lvlStaff, parentPosition: posKadivSekper }));
    await posRepo.save(posRepo.create({ title: 'Executive Assistant', organizationUnit: orgDivSekper, jobLevel: lvlStaff, parentPosition: posKadivSekper }));
    await posRepo.save(posRepo.create({ title: 'Sekretaris Direksi', organizationUnit: orgDivSekper, jobLevel: lvlStaff, parentPosition: posKadivSekper }));
    await posRepo.save(posRepo.create({ title: 'Protokoler, Pengelolaan Arsip dan Pelaporan', organizationUnit: orgDivSekper, jobLevel: lvlStaff, parentPosition: posKadivSekper }));


    // =========================================================================
    // CONTOH 3: Divisi Teknologi Informasi (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivTI = await orgRepo.save(orgRepo.create({
      code: 'DIV_TI',
      name: 'Divisi Teknologi Informasi',
      levelType: 'DIVISION',
      parent: orgDirKeu,
    }));
    const posKadivTI = await posRepo.save(posRepo.create({
      title: 'Kepala Divisi Teknologi Informasi',
      organizationUnit: orgDivTI,
      jobLevel: lvlKadiv,
      parentPosition: posDirKeu,
    }));

    // Bagian 1: Perencanaan dan Pengembangan
    const orgTI_Bag1 = await orgRepo.save(orgRepo.create({
      code: 'TI_BAG1',
      name: 'Perencanaan dan Pengembangan',
      levelType: 'DEPARTMENT',
      parent: orgDivTI,
    }));
    const posKabagTI_1 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian Perencanaan dan Pengembangan',
      organizationUnit: orgTI_Bag1,
      jobLevel: lvlKabag,
      parentPosition: posKadivTI,
    }));
    // Turunan Bagian 1
    await posRepo.save(posRepo.create({ title: 'Perencanaan dan Koordinator Proyek', organizationUnit: orgTI_Bag1, jobLevel: lvlStaff, parentPosition: posKabagTI_1 }));
    await posRepo.save(posRepo.create({ title: 'Manager Proyek dan Jaminan Kualitas', organizationUnit: orgTI_Bag1, jobLevel: lvlStaff, parentPosition: posKabagTI_1 }));
    await posRepo.save(posRepo.create({ title: 'Analis TI', organizationUnit: orgTI_Bag1, jobLevel: lvlStaff, parentPosition: posKabagTI_1 }));
    
    // Position for Syafri
    const posSyafri = await posRepo.save(posRepo.create({
      title: 'Pengembang Sistem Aplikasi',
      organizationUnit: orgTI_Bag1,
      jobLevel: lvlStaff,
      parentPosition: posKabagTI_1,
    }));

    // Bagian 2: Infrastruktur dan Keamanan
    const orgTI_Bag2 = await orgRepo.save(orgRepo.create({
      code: 'TI_BAG2',
      name: 'Infrastruktur dan Keamanan',
      levelType: 'DEPARTMENT',
      parent: orgDivTI,
    }));
    const posKabagTI_2 = await posRepo.save(posRepo.create({
      title: 'Kepala Bagian Infrastruktur dan Keamanan',
      organizationUnit: orgTI_Bag2,
      jobLevel: lvlKabag,
      parentPosition: posKadivTI,
    }));
    // Turunan Bagian 2
    await posRepo.save(posRepo.create({ title: 'Infrastruktur Pusat Data', organizationUnit: orgTI_Bag2, jobLevel: lvlStaff, parentPosition: posKabagTI_2 }));
    await posRepo.save(posRepo.create({ title: 'Administrator Basis Data dan Pengembangan Operasional', organizationUnit: orgTI_Bag2, jobLevel: lvlStaff, parentPosition: posKabagTI_2 }));
    await posRepo.save(posRepo.create({ title: 'Jaringan dan Operasional', organizationUnit: orgTI_Bag2, jobLevel: lvlStaff, parentPosition: posKabagTI_2 }));
    await posRepo.save(posRepo.create({ title: 'Administrator Keamanan', organizationUnit: orgTI_Bag2, jobLevel: lvlStaff, parentPosition: posKabagTI_2 }));

    // Non Bagian (Langsung under Kadiv TI)
    await posRepo.save(posRepo.create({ title: 'Strategi dan Arsitektur TI', organizationUnit: orgDivTI, jobLevel: lvlStaff, parentPosition: posKadivTI }));


    // =========================================================================
    // ROLES & USER SYAFRI
    // =========================================================================
    const roleStaff = await roleRepo.save(roleRepo.create({ code: 'STAFF', name: 'Staff / Fungsi', description: 'Role dasar untuk staff' }));
    await roleRepo.save(roleRepo.create({ code: 'KABAG', name: 'Kepala Bagian', description: 'Role Kepala Bagian' }));
    await roleRepo.save(roleRepo.create({ code: 'KADIV', name: 'Kepala Divisi', description: 'Role Kepala Divisi' }));

    const hashedPassword = await bcrypt.hash('12345', 10);
    const userSyafri = await userRepo.save(userRepo.create({
      email: 'syafri@smf.co.id',
      name: 'Syafri Surya',
      password: hashedPassword,
      position: posSyafri,
      isActive: true,
    }));

    await userRoleRepo.save(userRoleRepo.create({ user: userSyafri, role: roleStaff }));

    console.log('✅ 3 Specific Divisions seeded perfectly into DB!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetAndSeedClean();
