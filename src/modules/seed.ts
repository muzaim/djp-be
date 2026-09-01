import { AppDataSource } from '../database/data-source';
import { JobLevel } from './organizations/entities/job-level.entity';
import { OrganizationUnit } from './organizations/entities/organization-unit.entity';
import { Position } from './organizations/entities/position.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const slugify = (text: string) => text.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');

async function resetAndSeed() {
  await AppDataSource.initialize();
  console.log('Database connected. Clearing old org data...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Disable foreign key checks to truncate/clean tables safely
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query('TRUNCATE TABLE sys_user_roles');
    await queryRunner.query('TRUNCATE TABLE mst_users');
    await queryRunner.query('TRUNCATE TABLE mst_positions');
    await queryRunner.query('TRUNCATE TABLE mst_organization_units');
    await queryRunner.query('TRUNCATE TABLE mst_job_levels');
    await queryRunner.query('TRUNCATE TABLE sys_roles');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Tables cleared. Starting fresh seeding based on SK Direksi 2025...');

    const jobLevelRepo = AppDataSource.getRepository(JobLevel);
    const orgRepo = AppDataSource.getRepository(OrganizationUnit);
    const posRepo = AppDataSource.getRepository(Position);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    // 1. Create Job Levels
    const levels = [
      { code: 'DIR', name: 'Direktur', weight: 10 },
      { code: 'DEPUTY_DIR', name: 'Deputi Direktur', weight: 15 },
      { code: 'KADIV', name: 'Kepala Divisi', weight: 20 },
      { code: 'KABAG', name: 'Kepala Bagian', weight: 30 },
      { code: 'STAFF', name: 'Staff', weight: 40 },
    ];
    for (const l of levels) {
      await jobLevelRepo.save(jobLevelRepo.create({ code: l.code, name: l.name, rankWeight: l.weight }));
    }
    const allJobLevels = await jobLevelRepo.find();
    const getLevel = (code: string) => allJobLevels.find(j => j.code === code)!;

    // 2. Create Top Level Company & Directorates (4 Directorates / Top Leaders per Page 7)
    // Root Company
    const orgCompany = await orgRepo.save(orgRepo.create({ code: 'SMF', name: 'PT Sarana Multigriya Finansial (Persero)', levelType: 'COMPANY' }));

    // Direktur Utama
    const orgDirut = await orgRepo.save(orgRepo.create({ code: 'DIRUT', name: 'Direktorat Utama', levelType: 'DIRECTORATE', parent: orgCompany }));
    const posDirut = await posRepo.save(posRepo.create({ title: 'Direktur Utama', organizationUnit: orgDirut, jobLevel: getLevel('DIR') }));

    // Direktur Bisnis
    const orgDirBisnis = await orgRepo.save(orgRepo.create({ code: 'DIR_BISNIS', name: 'Direktorat Bisnis', levelType: 'DIRECTORATE', parent: orgCompany }));
    const posDirBisnis = await posRepo.save(posRepo.create({ title: 'Direktur Bisnis', organizationUnit: orgDirBisnis, jobLevel: getLevel('DIR'), parentPosition: posDirut }));

    // Deputi Direktur Pembiayaan dan Syariah (Under Direktur Bisnis)
    const orgDeputiPembiayaan = await orgRepo.save(orgRepo.create({ code: 'DEPUTI_PEMBIAYAAN_SYARIAH', name: 'Deputi Direktur Pembiayaan dan Syariah', levelType: 'DIRECTORATE', parent: orgDirBisnis }));
    const posDeputiPembiayaan = await posRepo.save(posRepo.create({ title: 'Deputi Direktur Pembiayaan dan Syariah', organizationUnit: orgDeputiPembiayaan, jobLevel: getLevel('DEPUTY_DIR'), parentPosition: posDirBisnis }));

    // Direktur Keuangan dan Manajemen Risiko
    const orgDirKeu = await orgRepo.save(orgRepo.create({ code: 'DIR_KEU_MR', name: 'Direktorat Keuangan dan Manajemen Risiko', levelType: 'DIRECTORATE', parent: orgCompany }));
    const posDirKeu = await posRepo.save(posRepo.create({ title: 'Direktur Keuangan dan Manajemen Risiko', organizationUnit: orgDirKeu, jobLevel: getLevel('DIR'), parentPosition: posDirut }));

    // Helper to add Division, Department, and Staff
    async function addDivisionTree(
      divCode: string, 
      divName: string, 
      parentOrg: OrganizationUnit, 
      parentPos: Position,
      departments: {
        deptCode: string;
        deptName: string;
        kabagTitle: string;
        staffTitles?: string[];
      }[] = [],
      directStaffTitles: string[] = [] // For divisions like SDM without Bagian
    ) {
      const divOrg = await orgRepo.save(orgRepo.create({ code: divCode, name: divName, levelType: 'DIVISION', parent: parentOrg }));
      const kadivTitle = `Kepala ${divName}`;
      const divPos = await posRepo.save(posRepo.create({ title: kadivTitle, organizationUnit: divOrg, jobLevel: getLevel('KADIV'), parentPosition: parentPos }));

      // Add direct staff under Kadiv if any (e.g. Divisi SDM)
      for (const staffTitle of directStaffTitles) {
        await posRepo.save(posRepo.create({ title: staffTitle, organizationUnit: divOrg, jobLevel: getLevel('STAFF'), parentPosition: divPos }));
      }

      // Add Departments
      for (const dept of departments) {
        const deptOrg = await orgRepo.save(orgRepo.create({ code: dept.deptCode, name: dept.deptName, levelType: 'DEPARTMENT', parent: divOrg }));
        const deptPos = await posRepo.save(posRepo.create({ title: dept.kabagTitle, organizationUnit: deptOrg, jobLevel: getLevel('KABAG'), parentPosition: divPos }));

        if (dept.staffTitles) {
          for (const staffTitle of dept.staffTitles) {
            await posRepo.save(posRepo.create({ title: staffTitle, organizationUnit: deptOrg, jobLevel: getLevel('STAFF'), parentPosition: deptPos }));
          }
        }
      }
      return divPos;
    }

    // ==========================================
    // A. UNDER DIREKTORAT UTAMA
    // ==========================================
    // 1. Satuan Pengawasan Intern
    await addDivisionTree('SPI', 'Satuan Pengawasan Intern', orgDirut, posDirut, [
      { deptCode: 'SPI_AUDITOR', deptName: 'Auditor', kabagTitle: 'Kepala Bagian Auditor', staffTitles: ['Auditor Staff'] },
      { deptCode: 'SPI_QA', deptName: 'Quality Assurance & Improvement Management', kabagTitle: 'Kepala Bagian Quality Assurance & Improvement Management', staffTitles: ['QA Staff'] },
    ]);

    // 2. Sekretariat Perusahaan
    await addDivisionTree('SEKPER', 'Sekretariat Perusahaan', orgDirut, posDirut, [
      { deptCode: 'SEKPER_KOMUNIKASI', deptName: 'Komunikasi Perusahaan dan Hub Pemangku Kepentingan', kabagTitle: 'Kepala Bagian Komunikasi Perusahaan & Hub Stakeholder', staffTitles: ['Hub Stakeholder & Pelaporan Specialist', 'Manajemen Brand & Aset Digital Specialist', 'Komunikasi Korporasi Specialist'] },
      { deptCode: 'SEKPER_TJSL', deptName: 'TJSL & Pengembangan Komunitas', kabagTitle: 'Kepala Bagian TJSL & Pengembangan Komunitas', staffTitles: ['Pengembangan Komunitas Specialist', 'TPRK & Homestay Specialist', 'Manajemen Stakeholder Internal Specialist'] },
      { deptCode: 'SEKPER_EBA', deptName: 'EBA Ritel & Layanan Direksi', kabagTitle: 'Kepala Bagian EBA Ritel & Layanan Direksi', staffTitles: ['EBA Ritel Specialist', 'Executive Assistant', 'Sekretaris Direksi', 'Protokoler & Pengelolaan Arsip'] },
    ]);

    // 3. Divisi Strategi dan Pengembangan Korporasi
    await addDivisionTree('DIV_SPK', 'Divisi Strategi dan Pengembangan Korporasi', orgDirut, posDirut, [
      { deptCode: 'SPK_PERENCANAAN', deptName: 'Perencanaan Strategis dan ESG', kabagTitle: 'Kepala Bagian Perencanaan Strategis & ESG', staffTitles: ['Perencanaan Strategis Specialist', 'ESG & Evaluasi Kinerja Specialist'] },
      { deptCode: 'SPK_PMO', deptName: 'Manajemen Proyek dan Hubungan Internasional', kabagTitle: 'Kepala Bagian PMO & Hubungan Internasional', staffTitles: ['Manajemen Proyek PMO Specialist', 'Hubungan Internasional Specialist'] },
    ]);

    // 4. Divisi Riset Ekonomi
    await addDivisionTree('DIV_RE', 'Divisi Riset Ekonomi', orgDirut, posDirut, [
      { deptCode: 'RE_ANALIS', deptName: 'Analis Riset Ekonomi', kabagTitle: 'Kepala Bagian Analis Riset Ekonomi', staffTitles: ['Analis Ekonomi Macro Specialist', 'Analis Pembiayaan Perumahan'] },
    ]);


    // ==========================================
    // B. UNDER DIREKTUR BISNIS
    // ==========================================
    // 1. Divisi Structured Product, Program Khusus dan Hukum
    await addDivisionTree('DIV_SPPKH', 'Divisi Structured Product, Program Khusus dan Hukum', orgDirBisnis, posDirBisnis, [
      { deptCode: 'SPPKH_STRUCTURED', deptName: 'Structured Product & Program Khusus', kabagTitle: 'Kepala Bagian Structured Product & Program Khusus', staffTitles: ['Project Finance Specialist'] },
      { deptCode: 'SPPKH_HUKUM', deptName: 'Hukum', kabagTitle: 'Kepala Bagian Hukum', staffTitles: ['Hukum Bisnis Specialist', 'Hukum Korporasi Specialist'] },
    ]);

    // 2. Divisi Tresuri dan Hubungan Investor
    await addDivisionTree('DIV_TRESURI', 'Divisi Tresuri dan Hubungan Investor', orgDirBisnis, posDirBisnis, [
      { deptCode: 'TRESURI_PENDANAAN', deptName: 'Manajemen Pendanaan dan Hubungan Investor', kabagTitle: 'Kepala Bagian Manajemen Pendanaan & Investor Relation', staffTitles: ['Manajemen Pendanaan Specialist', 'Hubungan Investor Specialist'] },
      { deptCode: 'TRESURI_LIKUIDITAS', deptName: 'Manajemen Kas dan Likuiditas', kabagTitle: 'Kepala Bagian Manajemen Kas & Likuiditas', staffTitles: ['Manajemen Kas & Likuiditas Staff'] },
    ]);

    // 3. Divisi Manajemen Kredit
    await addDivisionTree('DIV_MK', 'Divisi Manajemen Kredit', orgDirBisnis, posDirBisnis, [
      { deptCode: 'MK_OPS', deptName: 'Operasional Kredit', kabagTitle: 'Kepala Bagian Operasional Kredit', staffTitles: ['Admin Kredit Specialist', 'Admin Non Kredit Specialist'] },
      { deptCode: 'MK_PRODUK', deptName: 'Pengembangan Produk', kabagTitle: 'Kepala Bagian Pengembangan Produk', staffTitles: ['Pengembangan Produk Specialist', 'Pelatihan & Pendampingan Specialist', 'Project Officer'] },
    ]);


    // ==========================================
    // C. UNDER DEPUTI DIREKTUR PEMBIAYAAN DAN SYARIAH
    // ==========================================
    // 1. Divisi Pembiayaan
    await addDivisionTree('DIV_PEMBIAYAAN', 'Divisi Pembiayaan', orgDeputiPembiayaan, posDeputiPembiayaan, [
      { deptCode: 'PEMBIAYAAN_GRUP_1', deptName: 'Pembiayaan Grup I', kabagTitle: 'Kepala Bagian Pembiayaan Grup I', staffTitles: ['Business Manager I'] },
      { deptCode: 'PEMBIAYAAN_GRUP_2', deptName: 'Pembiayaan Grup II', kabagTitle: 'Kepala Bagian Pembiayaan Grup II', staffTitles: ['Business Manager II'] },
    ]);

    // 2. Unit Usaha Syariah
    await addDivisionTree('UUS', 'Unit Usaha Syariah', orgDeputiPembiayaan, posDeputiPembiayaan, [
      { deptCode: 'UUS_PEMBIAYAAN', deptName: 'Pembiayaan Syariah', kabagTitle: 'Kepala Bagian Pembiayaan Syariah', staffTitles: ['Business Manager Syariah'] },
    ]);


    // ==========================================
    // D. UNDER DIREKTUR KEUANGAN DAN MANAJEMEN RISIKO
    // ==========================================
    // 1. Divisi Keuangan dan Penyelesaian Transaksi
    await addDivisionTree('DIV_KEUANGAN', 'Divisi Keuangan dan Penyelesaian Transaksi', orgDirKeu, posDirKeu, [
      { deptCode: 'KEU_ANGGARAN', deptName: 'Anggaran & Penyelesaian Transaksi', kabagTitle: 'Kepala Bagian Anggaran & Penyelesaian Transaksi', staffTitles: ['Anggaran & Manajemen Keuangan Specialist', 'Pengendalian Anggaran Specialist', 'Penyelesaian Transaksi Bisnis & Operasional Specialist'] },
      { deptCode: 'KEU_AKUNTANSI', deptName: 'Akuntansi & Pelaporan', kabagTitle: 'Kepala Bagian Akuntansi & Pelaporan', staffTitles: ['Kebijakan Akuntansi Specialist', 'Perpajakan Specialist', 'Pelaporan Keuangan Specialist', 'Pengelolaan Data Keuangan Specialist'] },
    ]);

    // 2. Divisi Manajemen Risiko dan Kepatuhan
    await addDivisionTree('DIV_MRK', 'Divisi Manajemen Risiko dan Kepatuhan', orgDirKeu, posDirKeu, [
      { deptCode: 'MRK_RISIKO', deptName: 'Manajemen Risiko', kabagTitle: 'Kepala Bagian Manajemen Risiko', staffTitles: ['Enterprise Risk Management Specialist', 'Manajemen Risiko Operasional Specialist', 'Manajemen Risiko Bisnis Specialist', 'GCG & Kebijakan Internal Specialist'] },
      { deptCode: 'MRK_KEPATUHAN', deptName: 'Kepatuhan', kabagTitle: 'Kepala Bagian Kepatuhan', staffTitles: ['Compliance Specialist', 'APU PPT Specialist'] },
    ]);

    // 3. Divisi Sumber Daya Manusia (TIDAK Memiliki Kepala Bagian per Lampiran 12 - Langsung ke Kadiv)
    await addDivisionTree('DIV_SDM', 'Divisi Sumber Daya Manusia', orgDirKeu, posDirKeu, [], [
      'Human Capital Strategic Specialist',
      'Learning and Talent Development Specialist',
      'Human Capital Business Partner Specialist',
      'Layanan SDM Specialist',
      'Kompensasi dan Manfaat Specialist',
      'Karyawan Penugasan Specialist'
    ]);

    // 4. Divisi Teknologi Informasi
    await addDivisionTree('DIV_TI', 'Divisi Teknologi Informasi', orgDirKeu, posDirKeu, [
      { 
        deptCode: 'TI_PERENCANAAN', 
        deptName: 'Perencanaan & Pengembangan', 
        kabagTitle: 'Kepala Bagian Perencanaan & Pengembangan', 
        staffTitles: [
          'Perencanaan dan Koordinator Proyek Specialist', 
          'Manager Proyek & Jaminan Kualitas Specialist', 
          'Analis TI Specialist', 
          'Staff Pengembangan Sistem Aplikasi'
        ] 
      },
      { 
        deptCode: 'TI_INFRASTRUKTUR', 
        deptName: 'Infrastruktur dan Keamanan', 
        kabagTitle: 'Kepala Bagian Infrastruktur dan Keamanan', 
        staffTitles: [
          'Infrastruktur & Pusat Data Specialist', 
          'Administrator Basis Data & DevOps Specialist', 
          'Jaringan & Operasional Specialist', 
          'Administrator Keamanan Specialist'
        ] 
      },
      { 
        deptCode: 'TI_STRATEGI', 
        deptName: 'Strategi & Arsitektur TI', 
        kabagTitle: 'Kepala Bagian Strategi & Arsitektur TI', 
        staffTitles: ['IT Architect Specialist'] 
      },
    ]);

    // 5. Divisi Pengadaan dan Manajemen Aset
    await addDivisionTree('DIV_PMA', 'Divisi Pengadaan dan Manajemen Aset', orgDirKeu, posDirKeu, [
      { deptCode: 'PMA_PENGADAAN', deptName: 'Pengadaan', kabagTitle: 'Kepala Bagian Pengadaan', staffTitles: ['Management Vendor Specialist', 'Perencanaan Pengadaan Specialist'] },
      { deptCode: 'PMA_ASET', deptName: 'Manajemen Aset', kabagTitle: 'Kepala Bagian Manajemen Aset', staffTitles: ['Pengelolaan Gedung Specialist', 'Manajemen Fasilitas Specialist'] },
    ]);


    // ==========================================
    // E. ROLES & DUMMY USER (SYAFRI)
    // ==========================================
    console.log('Creating Roles & Dummy User Syafri...');
    
    const roleStaff = await roleRepo.save(roleRepo.create({ code: 'STAFF', name: 'Staff Umum', description: 'Role dasar untuk semua staff' }));
    await roleRepo.save(roleRepo.create({ code: 'KABAG', name: 'Kepala Bagian', description: 'Role Kepala Bagian / Approver Step 1' }));
    await roleRepo.save(roleRepo.create({ code: 'KADIV', name: 'Kepala Divisi', description: 'Role Kepala Divisi / Approver Step 2' }));
    await roleRepo.save(roleRepo.create({ code: 'ADMIN_SDM', name: 'Admin SDM', description: 'Role Administrator SDM' }));

    // Find position of Syafri
    const posSyafri = await posRepo.findOne({ where: { title: 'Staff Pengembangan Sistem Aplikasi' } });
    if (!posSyafri) {
      throw new Error('Position Staff Pengembangan Sistem Aplikasi not found!');
    }

    const hashedPassword = await bcrypt.hash('12345', 10);
    const userSyafri = await userRepo.save(userRepo.create({
      email: 'syafri@smf.co.id',
      name: 'Syafri Surya',
      password: hashedPassword,
      position: posSyafri,
      isActive: true,
    }));

    await userRoleRepo.save(userRoleRepo.create({ user: userSyafri, role: roleStaff }));

    console.log('🎉 Reset and Seeding completed 100% successfully according to SK Direksi 2025!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetAndSeed();
