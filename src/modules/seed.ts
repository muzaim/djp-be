import { AppDataSource } from '../database/data-source';
import { OrganizationUnit } from './organizations/entities/organization-unit.entity';
import { JobLevel } from './organizations/entities/job-level.entity';
import { Position } from './organizations/entities/position.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function resetAndSeedAll() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();

    console.log('🧹 Truncating tables for a clean reset...');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.query('TRUNCATE TABLE sys_user_roles');
    await AppDataSource.query('TRUNCATE TABLE sys_roles');
    await AppDataSource.query('TRUNCATE TABLE mst_users');
    await AppDataSource.query('TRUNCATE TABLE mst_positions');
    await AppDataSource.query('TRUNCATE TABLE mst_job_levels');
    await AppDataSource.query('TRUNCATE TABLE mst_organization_units');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🌱 Seeding Master Data...');

    const orgRepo = AppDataSource.getRepository(OrganizationUnit);
    const lvlRepo = AppDataSource.getRepository(JobLevel);
    const posRepo = AppDataSource.getRepository(Position);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    // 1. Root Company
    const smfCompany = await orgRepo.save(
      orgRepo.create({
        code: 'SMF',
        name: 'PT Sarana Multigriya Finansial (Persero)',
        levelType: 'COMPANY',
      }),
    );

    // 2. Job Levels
    const lvlDirektur = await lvlRepo.save(
      lvlRepo.create({
        code: 'DIREKTUR',
        name: 'Direktur / C-Level',
        rankWeight: 10,
      }),
    );
    const lvlKadiv = await lvlRepo.save(
      lvlRepo.create({
        code: 'KADIV',
        name: 'Kepala Divisi',
        rankWeight: 20,
      }),
    );
    const lvlKabag = await lvlRepo.save(
      lvlRepo.create({
        code: 'KABAG',
        name: 'Kepala Bagian',
        rankWeight: 30,
      }),
    );
    const lvlStaff = await lvlRepo.save(
      lvlRepo.create({
        code: 'STAFF',
        name: 'Staff / Fungsi',
        rankWeight: 40,
      }),
    );

    // 3. Directorates
    const orgDirUtama = await orgRepo.save(
      orgRepo.create({
        code: 'DIRUT',
        name: 'Direktorat Utama',
        levelType: 'DIRECTORATE',
        parent: smfCompany,
      }),
    );
    const posDirUtama = await posRepo.save(
      posRepo.create({
        title: 'Direktur Utama',
        organizationUnit: orgDirUtama,
        jobLevel: lvlDirektur,
      }),
    );

    const orgDirSyariah = await orgRepo.save(
      orgRepo.create({
        code: 'DIR_SYARIAH',
        name: 'Deputi Direktur Pembiayaan dan Syariah',
        levelType: 'DIRECTORATE',
        parent: smfCompany,
      }),
    );
    const posDirSyariah = await posRepo.save(
      posRepo.create({
        title: 'Deputi Direktur Pembiayaan dan Syariah',
        organizationUnit: orgDirSyariah,
        jobLevel: lvlDirektur,
      }),
    );

    const orgDirBisnis = await orgRepo.save(
      orgRepo.create({
        code: 'DIR_BISNIS',
        name: 'Direktur Bisnis',
        levelType: 'DIRECTORATE',
        parent: smfCompany,
      }),
    );
    const posDirBisnis = await posRepo.save(
      posRepo.create({
        title: 'Direktur Bisnis',
        organizationUnit: orgDirBisnis,
        jobLevel: lvlDirektur,
      }),
    );

    const orgDirKeu = await orgRepo.save(
      orgRepo.create({
        code: 'DIR_KEU_RISIKO',
        name: 'Direktur Keuangan dan Manajemen Risiko',
        levelType: 'DIRECTORATE',
        parent: smfCompany,
      }),
    );
    const posDirKeu = await posRepo.save(
      posRepo.create({
        title: 'Direktur Keuangan dan Manajemen Risiko',
        organizationUnit: orgDirKeu,
        jobLevel: lvlDirektur,
      }),
    );

    // =========================================================================
    // 1. DIVISI STRATEGI DAN PENGEMBANGAN KORPORASI (Direktorat Utama)
    // =========================================================================
    const orgDivSPK = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_SPK',
        name: 'Divisi Strategi dan Pengembangan Korporasi',
        levelType: 'DIVISION',
        parent: orgDirUtama,
      }),
    );
    const posKadivSPK = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Strategi dan Pengembangan Korporasi',
        organizationUnit: orgDivSPK,
        jobLevel: lvlKadiv,
        parentPosition: posDirUtama,
      }),
    );

    // Bagian 1: Perencanaan Strategis dan ESG
    const orgSPK_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'SPK_BAG1',
        name: 'Perencanaan Strategis dan Environmental, Social and Governance (ESG)',
        levelType: 'DEPARTMENT',
        parent: orgDivSPK,
      }),
    );
    const posKabagSPK_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Perencanaan Strategis dan ESG',
        organizationUnit: orgSPK_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivSPK,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Perencanaan Strategis',
        organizationUnit: orgSPK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPK_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'ESG dan Evaluasi Kinerja dan Anak Usaha',
        organizationUnit: orgSPK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPK_1,
      }),
    );

    // Bagian 2: Manajemen Proyek dan Hubungan Internasional
    const orgSPK_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'SPK_BAG2',
        name: 'Manajemen Proyek dan Hubungan Internasional',
        levelType: 'DEPARTMENT',
        parent: orgDivSPK,
      }),
    );
    const posKabagSPK_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Manajemen Proyek dan Hubungan Internasional',
        organizationUnit: orgSPK_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivSPK,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Proyek',
        organizationUnit: orgSPK_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPK_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Hubungan Internasional',
        organizationUnit: orgSPK_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPK_2,
      }),
    );

    // =========================================================================
    // 2. DIVISI SEKRETARIAT PERUSAHAAN (Direktorat Utama)
    // =========================================================================
    const orgDivSekper = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_SEKPER',
        name: 'Sekretariat Perusahaan',
        levelType: 'DIVISION',
        parent: orgDirUtama,
      }),
    );
    const posKadivSekper = await posRepo.save(
      posRepo.create({
        title: 'Kepala Sekretariat Perusahaan',
        organizationUnit: orgDivSekper,
        jobLevel: lvlKadiv,
        parentPosition: posDirUtama,
      }),
    );

    // Bagian 1: Komunikasi Perusahaan dan Hubungan Pemangku Kepentingan
    const orgSekper_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'SEKPER_BAG1',
        name: 'Komunikasi Perusahaan dan Hubungan Pemangku Kepentingan',
        levelType: 'DEPARTMENT',
        parent: orgDivSekper,
      }),
    );
    const posKabagSekper_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Komunikasi Perusahaan dan Hubungan Pemangku Kepentingan',
        organizationUnit: orgSekper_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Hubungan Stakeholder dan Pelaporan',
        organizationUnit: orgSekper_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Brand dan Aset Digital',
        organizationUnit: orgSekper_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Komunikasi Korporasi',
        organizationUnit: orgSekper_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_1,
      }),
    );

    // Bagian 2: TJSL dan Pengembangan Komunitas
    const orgSekper_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'SEKPER_BAG2',
        name: 'TJSL dan Pengembangan Komunitas',
        levelType: 'DEPARTMENT',
        parent: orgDivSekper,
      }),
    );
    const posKabagSekper_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian TJSL dan Pengembangan Komunitas',
        organizationUnit: orgSekper_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengembangan Komunitas',
        organizationUnit: orgSekper_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'TPPK dan Homestay',
        organizationUnit: orgSekper_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Stakeholder Internal',
        organizationUnit: orgSekper_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSekper_2,
      }),
    );

    // Non Bagian Sekretariat Perusahaan
    await posRepo.save(
      posRepo.create({
        title: 'EBA Ritel',
        organizationUnit: orgDivSekper,
        jobLevel: lvlStaff,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Executive Assistant',
        organizationUnit: orgDivSekper,
        jobLevel: lvlStaff,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Sekretaris Direksi',
        organizationUnit: orgDivSekper,
        jobLevel: lvlStaff,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Protokoler',
        organizationUnit: orgDivSekper,
        jobLevel: lvlStaff,
        parentPosition: posKadivSekper,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengelolaan Arsip dan Pelaporan',
        organizationUnit: orgDivSekper,
        jobLevel: lvlStaff,
        parentPosition: posKadivSekper,
      }),
    );

    // =========================================================================
    // 3. DIVISI TEKNOLOGI INFORMASI (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivTI = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_TI',
        name: 'Divisi Teknologi Informasi',
        levelType: 'DIVISION',
        parent: orgDirKeu,
      }),
    );
    const posKadivTI = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Teknologi Informasi',
        organizationUnit: orgDivTI,
        jobLevel: lvlKadiv,
        parentPosition: posDirKeu,
      }),
    );

    // Bagian 1: Perencanaan dan Pengembangan
    const orgTI_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'TI_BAG1',
        name: 'Perencanaan dan Pengembangan',
        levelType: 'DEPARTMENT',
        parent: orgDivTI,
      }),
    );
    const posKabagTI_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Perencanaan dan Pengembangan',
        organizationUnit: orgTI_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivTI,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Perencanaan dan Koordinator Proyek',
        organizationUnit: orgTI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajer Proyek dan Jaminan Kualitas',
        organizationUnit: orgTI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Analis TI',
        organizationUnit: orgTI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_1,
      }),
    );

    // Position for Syafri
    const posSyafri = await posRepo.save(
      posRepo.create({
        title: 'Pengembang Sistem Aplikasi',
        organizationUnit: orgTI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_1,
      }),
    );

    // Bagian 2: Infrastruktur dan Keamanan
    const orgTI_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'TI_BAG2',
        name: 'Infrastruktur dan Keamanan',
        levelType: 'DEPARTMENT',
        parent: orgDivTI,
      }),
    );
    const posKabagTI_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Infrastruktur dan Keamanan',
        organizationUnit: orgTI_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivTI,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Infrastruktur Pusat Data',
        organizationUnit: orgTI_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Administrator Basis Data dan Pengembangan Operasional',
        organizationUnit: orgTI_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Jaringan dan Operasional',
        organizationUnit: orgTI_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Administrator Keamanan',
        organizationUnit: orgTI_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagTI_2,
      }),
    );

    // Non Bagian TI
    await posRepo.save(
      posRepo.create({
        title: 'Strategi dan Arsitektur TI',
        organizationUnit: orgDivTI,
        jobLevel: lvlStaff,
        parentPosition: posKadivTI,
      }),
    );

    // =========================================================================
    // 4. DIVISI SATUAN PENGAWASAN INTERNAL (Direktorat Utama)
    // =========================================================================
    const orgDivSPI = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_SPI',
        name: 'Divisi Satuan Pengawasan Internal',
        levelType: 'DIVISION',
        parent: orgDirUtama,
      }),
    );
    const posKadivSPI = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Satuan Pengawasan Internal',
        organizationUnit: orgDivSPI,
        jobLevel: lvlKadiv,
        parentPosition: posDirUtama,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Auditor',
        organizationUnit: orgDivSPI,
        jobLevel: lvlStaff,
        parentPosition: posKadivSPI,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Quality Assurance dan Improvement Management',
        organizationUnit: orgDivSPI,
        jobLevel: lvlStaff,
        parentPosition: posKadivSPI,
      }),
    );

    // =========================================================================
    // 5. DIVISI RISET EKONOMI (Direktorat Utama)
    // =========================================================================
    const orgDivRE = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_RE',
        name: 'Divisi Riset Ekonomi',
        levelType: 'DIVISION',
        parent: orgDirUtama,
      }),
    );
    const posKadivRE = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Riset Ekonomi',
        organizationUnit: orgDivRE,
        jobLevel: lvlKadiv,
        parentPosition: posDirUtama,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Analis',
        organizationUnit: orgDivRE,
        jobLevel: lvlStaff,
        parentPosition: posKadivRE,
      }),
    );

    // =========================================================================
    // 6. DIVISI PEMBIAYAAN (Deputi Direktur Pembiayaan dan Syariah)
    // =========================================================================
    const orgDivPemb = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_PEMBIAYAAN',
        name: 'Divisi Pembiayaan',
        levelType: 'DIVISION',
        parent: orgDirSyariah,
      }),
    );
    const posKadivPemb = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Pembiayaan',
        organizationUnit: orgDivPemb,
        jobLevel: lvlKadiv,
        parentPosition: posDirSyariah,
      }),
    );

    // Bagian 1: Pembiayaan Group 1
    const orgPemb_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'PEMB_BAG1',
        name: 'Pembiayaan Group 1',
        levelType: 'DEPARTMENT',
        parent: orgDivPemb,
      }),
    );
    const posKabagPemb_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Pembiayaan Group 1',
        organizationUnit: orgPemb_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivPemb,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Business Manager Pembiayaan Group 1',
        organizationUnit: orgPemb_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagPemb_1,
      }),
    );

    // Bagian 2: Pembiayaan Group 2
    const orgPemb_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'PEMB_BAG2',
        name: 'Pembiayaan Group 2',
        levelType: 'DEPARTMENT',
        parent: orgDivPemb,
      }),
    );
    const posKabagPemb_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Pembiayaan Group 2',
        organizationUnit: orgPemb_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivPemb,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Business Manager Pembiayaan Group 2',
        organizationUnit: orgPemb_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagPemb_2,
      }),
    );

    // =========================================================================
    // 7. DIVISI UNIT USAHA SYARIAH (Deputi Direktur Pembiayaan dan Syariah)
    // =========================================================================
    const orgDivUUS = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_UUS',
        name: 'Unit Usaha Syariah',
        levelType: 'DIVISION',
        parent: orgDirSyariah,
      }),
    );
    const posKadivUUS = await posRepo.save(
      posRepo.create({
        title: 'Kepala Unit Usaha Syariah',
        organizationUnit: orgDivUUS,
        jobLevel: lvlKadiv,
        parentPosition: posDirSyariah,
      }),
    );

    // Bagian 1: Bagian Pembiayaan Syariah
    const orgUUS_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'UUS_BAG1',
        name: 'Bagian Pembiayaan Syariah',
        levelType: 'DEPARTMENT',
        parent: orgDivUUS,
      }),
    );
    const posKabagUUS_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Pembiayaan Syariah',
        organizationUnit: orgUUS_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivUUS,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Business Manager Pembiayaan Syariah',
        organizationUnit: orgUUS_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagUUS_1,
      }),
    );

    // =========================================================================
    // 8. DIVISI STRUCTURED PRODUCT, PROGRAM KHUSUS DAN HUKUM (Direktur Bisnis)
    // =========================================================================
    const orgDivSPKH = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_SPKH',
        name: 'Divisi Structured Product, Program Khusus dan Hukum',
        levelType: 'DIVISION',
        parent: orgDirBisnis,
      }),
    );
    const posKadivSPKH = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Structured Product, Program Khusus dan Hukum',
        organizationUnit: orgDivSPKH,
        jobLevel: lvlKadiv,
        parentPosition: posDirBisnis,
      }),
    );

    // Bagian 1: Structured Product dan Program Khusus
    const orgSPKH_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'SPKH_BAG1',
        name: 'Structured Product dan Program Khusus',
        levelType: 'DEPARTMENT',
        parent: orgDivSPKH,
      }),
    );
    const posKabagSPKH_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Structured Product dan Program Khusus',
        organizationUnit: orgSPKH_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivSPKH,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Project Finance Specialist',
        organizationUnit: orgSPKH_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPKH_1,
      }),
    );

    // Bagian 2: Hukum
    const orgSPKH_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'SPKH_BAG2',
        name: 'Hukum',
        levelType: 'DEPARTMENT',
        parent: orgDivSPKH,
      }),
    );
    const posKabagSPKH_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Hukum',
        organizationUnit: orgSPKH_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivSPKH,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Hukum Bisnis',
        organizationUnit: orgSPKH_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPKH_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Hukum Korporasi',
        organizationUnit: orgSPKH_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagSPKH_2,
      }),
    );

    // =========================================================================
    // 9. DIVISI TRESURI DAN HUBUNGAN INVESTOR (Direktur Bisnis)
    // =========================================================================
    const orgDivTHI = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_THI',
        name: 'Divisi Tresuri dan Hubungan Investor',
        levelType: 'DIVISION',
        parent: orgDirBisnis,
      }),
    );
    const posKadivTHI = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Tresuri dan Hubungan Investor',
        organizationUnit: orgDivTHI,
        jobLevel: lvlKadiv,
        parentPosition: posDirBisnis,
      }),
    );

    // Bagian 1: Manajemen Pendanaan dan Hubungan Investor
    const orgTHI_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'THI_BAG1',
        name: 'Manajemen Pendanaan dan Hubungan Investor',
        levelType: 'DEPARTMENT',
        parent: orgDivTHI,
      }),
    );
    const posKabagTHI_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Manajemen Pendanaan dan Hubungan Investor',
        organizationUnit: orgTHI_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivTHI,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Pendanaan',
        organizationUnit: orgTHI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTHI_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Hubungan Investor',
        organizationUnit: orgTHI_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagTHI_1,
      }),
    );

    // Bagian 2: Manajemen Kas dan Likuiditas
    const orgTHI_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'THI_BAG2',
        name: 'Manajemen Kas dan Likuiditas',
        levelType: 'DEPARTMENT',
        parent: orgDivTHI,
      }),
    );
    const posKabagTHI_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Manajemen Kas dan Likuiditas',
        organizationUnit: orgTHI_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivTHI,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Kas dan Likuiditas',
        organizationUnit: orgTHI_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagTHI_2,
      }),
    );

    // =========================================================================
    // 10. DIVISI MANAJEMEN KREDIT (Direktur Bisnis)
    // =========================================================================
    const orgDivMK = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_MK',
        name: 'Divisi Manajemen Kredit',
        levelType: 'DIVISION',
        parent: orgDirBisnis,
      }),
    );
    const posKadivMK = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Manajemen Kredit',
        organizationUnit: orgDivMK,
        jobLevel: lvlKadiv,
        parentPosition: posDirBisnis,
      }),
    );

    // Bagian 1: Operasional Kredit
    const orgMK_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'MK_BAG1',
        name: 'Operasional Kredit',
        levelType: 'DEPARTMENT',
        parent: orgDivMK,
      }),
    );
    const posKabagMK_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Operasional Kredit',
        organizationUnit: orgMK_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivMK,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Admin Kredit',
        organizationUnit: orgMK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMK_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Admin Non Kredit',
        organizationUnit: orgMK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMK_1,
      }),
    );

    // Bagian 2: Pengembangan Produk
    const orgMK_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'MK_BAG2',
        name: 'Pengembangan Produk',
        levelType: 'DEPARTMENT',
        parent: orgDivMK,
      }),
    );
    const posKabagMK_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Pengembangan Produk',
        organizationUnit: orgMK_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivMK,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengembangan Produk',
        organizationUnit: orgMK_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagMK_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pelatihan dan Pendampingan',
        organizationUnit: orgMK_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagMK_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Project Officer',
        organizationUnit: orgMK_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagMK_2,
      }),
    );

    // =========================================================================
    // 11. DIVISI MANAJEMEN RISIKO DAN KEPATUHAN (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivMRK = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_MRK',
        name: 'Divisi Manajemen Risiko dan Kepatuhan',
        levelType: 'DIVISION',
        parent: orgDirKeu,
      }),
    );
    const posKadivMRK = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Manajemen Risiko dan Kepatuhan',
        organizationUnit: orgDivMRK,
        jobLevel: lvlKadiv,
        parentPosition: posDirKeu,
      }),
    );

    // Bagian 1: Manajemen Risiko
    const orgMRK_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'MRK_BAG1',
        name: 'Manajemen Risiko',
        levelType: 'DEPARTMENT',
        parent: orgDivMRK,
      }),
    );
    const posKabagMRK_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Manajemen Risiko',
        organizationUnit: orgMRK_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivMRK,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Enterprise Risk',
        organizationUnit: orgMRK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMRK_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Risiko Operasional',
        organizationUnit: orgMRK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMRK_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Risiko Bisnis',
        organizationUnit: orgMRK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMRK_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'GCG dan Kebijakan Internal',
        organizationUnit: orgMRK_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMRK_1,
      }),
    );

    // Non Bagian Manajemen Risiko dan Kepatuhan
    await posRepo.save(
      posRepo.create({
        title: 'Kepatuhan',
        organizationUnit: orgDivMRK,
        jobLevel: lvlStaff,
        parentPosition: posKadivMRK,
      }),
    );

    // =========================================================================
    // 12. DIVISI KEUANGAN DAN PENYELESAIAN TRANSAKSI (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivKPT = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_KPT',
        name: 'Divisi Keuangan dan Penyelesaian Transaksi',
        levelType: 'DIVISION',
        parent: orgDirKeu,
      }),
    );
    const posKadivKPT = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Keuangan dan Penyelesaian Transaksi',
        organizationUnit: orgDivKPT,
        jobLevel: lvlKadiv,
        parentPosition: posDirKeu,
      }),
    );

    // Bagian 1: Anggaran dan Penyelesaian Transaksi
    const orgKPT_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'KPT_BAG1',
        name: 'Anggaran dan Penyelesaian Transaksi',
        levelType: 'DEPARTMENT',
        parent: orgDivKPT,
      }),
    );
    const posKabagKPT_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Anggaran dan Penyelesaian Transaksi',
        organizationUnit: orgKPT_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivKPT,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Anggaran dan Manajemen Keuangan',
        organizationUnit: orgKPT_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengendalian Anggaran',
        organizationUnit: orgKPT_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Penyelesaian Transaksi Bisnis dan Operasional',
        organizationUnit: orgKPT_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_1,
      }),
    );

    // Bagian 2: Akuntansi dan Pelaporan
    const orgKPT_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'KPT_BAG2',
        name: 'Akuntansi dan Pelaporan',
        levelType: 'DEPARTMENT',
        parent: orgDivKPT,
      }),
    );
    const posKabagKPT_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Akuntansi dan Pelaporan',
        organizationUnit: orgKPT_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivKPT,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Kebijakan Akuntansi',
        organizationUnit: orgKPT_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Perpajakan',
        organizationUnit: orgKPT_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pelaporan',
        organizationUnit: orgKPT_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengelolaan Data Keuangan',
        organizationUnit: orgKPT_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagKPT_2,
      }),
    );

    // =========================================================================
    // 13. DIVISI SDM (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivSDM = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_SDM',
        name: 'Divisi SDM',
        levelType: 'DIVISION',
        parent: orgDirKeu,
      }),
    );
    const posKadivSDM = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi SDM',
        organizationUnit: orgDivSDM,
        jobLevel: lvlKadiv,
        parentPosition: posDirKeu,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Human Capital Strategic',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Learning and Talent Development',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Human Capital Business Partner',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Layanan SDM',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Kompensasi dan Manfaat',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Karyawan Penugasan',
        organizationUnit: orgDivSDM,
        jobLevel: lvlStaff,
        parentPosition: posKadivSDM,
      }),
    );

    // =========================================================================
    // 14. DIVISI MANAJEMEN ASET (Direktur Keuangan dan Manajemen Risiko)
    // =========================================================================
    const orgDivMA = await orgRepo.save(
      orgRepo.create({
        code: 'DIV_MA',
        name: 'Divisi Manajemen Aset',
        levelType: 'DIVISION',
        parent: orgDirKeu,
      }),
    );
    const posKadivMA = await posRepo.save(
      posRepo.create({
        title: 'Kepala Divisi Manajemen Aset',
        organizationUnit: orgDivMA,
        jobLevel: lvlKadiv,
        parentPosition: posDirKeu,
      }),
    );

    // Bagian 1: Pengadaan
    const orgMA_Bag1 = await orgRepo.save(
      orgRepo.create({
        code: 'MA_BAG1',
        name: 'Pengadaan',
        levelType: 'DEPARTMENT',
        parent: orgDivMA,
      }),
    );
    const posKabagMA_1 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Pengadaan',
        organizationUnit: orgMA_Bag1,
        jobLevel: lvlKabag,
        parentPosition: posKadivMA,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengadaan',
        organizationUnit: orgMA_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMA_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Vendor',
        organizationUnit: orgMA_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMA_1,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Perencanaan Pengadaan',
        organizationUnit: orgMA_Bag1,
        jobLevel: lvlStaff,
        parentPosition: posKabagMA_1,
      }),
    );

    // Bagian 2: Manajemen Aset
    const orgMA_Bag2 = await orgRepo.save(
      orgRepo.create({
        code: 'MA_BAG2',
        name: 'Manajemen Aset',
        levelType: 'DEPARTMENT',
        parent: orgDivMA,
      }),
    );
    const posKabagMA_2 = await posRepo.save(
      posRepo.create({
        title: 'Kepala Bagian Manajemen Aset',
        organizationUnit: orgMA_Bag2,
        jobLevel: lvlKabag,
        parentPosition: posKadivMA,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Pengelolaan Gedung',
        organizationUnit: orgMA_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagMA_2,
      }),
    );
    await posRepo.save(
      posRepo.create({
        title: 'Manajemen Fasilitas',
        organizationUnit: orgMA_Bag2,
        jobLevel: lvlStaff,
        parentPosition: posKabagMA_2,
      }),
    );

    // =========================================================================
    // ROLES & USER SYAFRI
    // =========================================================================
    const roleStaff = await roleRepo.save(
      roleRepo.create({
        code: 'STAFF',
        name: 'Staff / Fungsi',
        description: 'Role dasar untuk staff',
      }),
    );
    await roleRepo.save(
      roleRepo.create({
        code: 'KABAG',
        name: 'Kepala Bagian',
        description: 'Role Kepala Bagian',
      }),
    );
    await roleRepo.save(
      roleRepo.create({
        code: 'KADIV',
        name: 'Kepala Divisi',
        description: 'Role Kepala Divisi',
      }),
    );

    const hashedPassword = await bcrypt.hash('12345', 10);
    const userSyafri = await userRepo.save(
      userRepo.create({
        email: 'syafri@smf.co.id',
        name: 'Syafri Surya',
        password: hashedPassword,
        position: posSyafri,
        isActive: true,
      }),
    );

    await userRoleRepo.save(
      userRoleRepo.create({ user: userSyafri, role: roleStaff }),
    );

    console.log('✅ All 14 Divisions seeded 100% perfectly into database!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetAndSeedAll();
