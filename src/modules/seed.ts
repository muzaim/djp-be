import { AppDataSource } from '../database/data-source';
import { JobLevel } from './organizations/entities/job-level.entity';
import { OrganizationUnit } from './organizations/entities/organization-unit.entity';
import { Position } from './organizations/entities/position.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const ORG_TREE = [
  {
    name: 'Direktur Utama',
    orgName: 'Direktorat Utama',
    orgType: 'DIRECTORATE',
    jobCode: 'DIR',
    children: [
      {
        name: 'Kepala Satuan Pengawasan Intern',
        orgName: 'Satuan Pengawasan Intern',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Auditor',
            orgName: 'Auditor',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Quality Assurance & Improvement Management',
            orgName: 'Quality Assurance & Improvement Management',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Sekretariat Perusahaan',
        orgName: 'Sekretariat Perusahaan',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Komunikasi Perusahaan dan Hub Pemangku Kepentingan',
            orgName: 'Komunikasi Perusahaan dan Hub Pemangku Kepentingan',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian TJSL & Pengembangan Komunitas',
            orgName: 'TJSL & Pengembangan Komunitas',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian EBA Ritel',
            orgName: 'EBA Ritel',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Strategi & Pengembangan Korporasi',
        orgName: 'Divisi Strategi & Pengembangan Korporasi',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Perencanaan Strategis dan ESG',
            orgName: 'Perencanaan Strategis dan ESG',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Manajemen Proyek dan Hubungan Internasional',
            orgName: 'Manajemen Proyek dan Hubungan Internasional',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Riset Ekonomi',
        orgName: 'Divisi Riset Ekonomi',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Analis',
            orgName: 'Analis',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: 'Direktur Bisnis',
    orgName: 'Direktorat Bisnis',
    orgType: 'DIRECTORATE',
    jobCode: 'DIR',
    children: [
      {
        name: 'Kepala Divisi Structured Product, Program Khusus dan Hukum',
        orgName: 'Divisi Structured Product, Program Khusus dan Hukum',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Structured Product & Program Khusus',
            orgName: 'Structured Product & Program Khusus',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Hukum',
            orgName: 'Hukum',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Pembiayaan',
        orgName: 'Divisi Pembiayaan',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Pembiayaan Grup I',
            orgName: 'Pembiayaan Grup I',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Pembiayaan Grup II',
            orgName: 'Pembiayaan Grup II',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Unit Usaha Syariah',
        orgName: 'Unit Usaha Syariah',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Pembiayaan Syariah',
            orgName: 'Pembiayaan Syariah',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Tresuri dan Hubungan Investor',
        orgName: 'Divisi Tresuri dan Hubungan Investor',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Manajemen Pendanaan dan Hubungan Investor',
            orgName: 'Manajemen Pendanaan dan Hubungan Investor',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Manajemen Kas dan Likuiditas',
            orgName: 'Manajemen Kas dan Likuiditas',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Manajemen Kredit',
        orgName: 'Divisi Manajemen Kredit',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Operasional Kredit',
            orgName: 'Operasional Kredit',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Pengembangan Produk',
            orgName: 'Pengembangan Produk',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: 'Direktur Keuangan & Manajemen Risiko',
    orgName: 'Direktorat Keuangan & Manajemen Risiko',
    orgType: 'DIRECTORATE',
    jobCode: 'DIR',
    children: [
      {
        name: 'Kepala Divisi Keuangan dan Penyelesaian Transaksi',
        orgName: 'Divisi Keuangan dan Penyelesaian Transaksi',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Anggaran & Penyelesaian Transaksi',
            orgName: 'Anggaran & Penyelesaian Transaksi',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Akuntansi & Pelaporan',
            orgName: 'Akuntansi & Pelaporan',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Manajemen Risiko dan Kepatuhan',
        orgName: 'Divisi Manajemen Risiko dan Kepatuhan',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Manajemen Risiko',
            orgName: 'Manajemen Risiko',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Kepatuhan',
            orgName: 'Kepatuhan',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Sumber Daya Manusia',
        orgName: 'Divisi Sumber Daya Manusia',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Human Capital Strategic',
            orgName: 'Human Capital Strategic',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Layanan SDM',
            orgName: 'Layanan SDM',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Teknologi Informasi',
        orgName: 'Divisi Teknologi Informasi',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Perencanaan & Pengembangan',
            orgName: 'Perencanaan & Pengembangan TI',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [
              {
                name: 'Staff Pengembangan Sistem Aplikasi',
                orgName: 'Pengembangan Sistem Aplikasi',
                orgType: 'SECTION',
                jobCode: 'STAFF',
                children: [],
              },
            ],
          },
          {
            name: 'Kepala Bagian Infrastruktur dan Keamanan',
            orgName: 'Infrastruktur dan Keamanan TI',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Strategi & Arsitektur TI',
            orgName: 'Strategi & Arsitektur TI',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
      {
        name: 'Kepala Divisi Pengadaan dan Manajemen Aset',
        orgName: 'Divisi Pengadaan dan Manajemen Aset',
        orgType: 'DIVISION',
        jobCode: 'KADIV',
        children: [
          {
            name: 'Kepala Bagian Pengadaan',
            orgName: 'Pengadaan',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
          {
            name: 'Kepala Bagian Manajemen Aset',
            orgName: 'Manajemen Aset',
            orgType: 'DEPARTMENT',
            jobCode: 'KABAG',
            children: [],
          },
        ],
      },
    ],
  },
];

// Helper to convert string to code slug
const slugify = (text: string) =>
  text
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Starting massive organization seed...');

  try {
    const jobLevelRepo = AppDataSource.getRepository(JobLevel);
    const orgRepo = AppDataSource.getRepository(OrganizationUnit);
    const posRepo = AppDataSource.getRepository(Position);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    // 1. Ensure Job Levels exist
    const levels = [
      { code: 'DIR', name: 'Direktur', weight: 10 },
      { code: 'KADIV', name: 'Kepala Divisi', weight: 20 },
      { code: 'KABAG', name: 'Kepala Bagian', weight: 30 },
      { code: 'STAFF', name: 'Staff', weight: 40 },
    ];

    for (const lvl of levels) {
      let jl = await jobLevelRepo.findOneBy({ code: lvl.code });
      if (!jl) {
        jl = jobLevelRepo.create({
          code: lvl.code,
          name: lvl.name,
          rankWeight: lvl.weight,
        });
        await jobLevelRepo.save(jl);
      }
    }
    const allJobLevels = await jobLevelRepo.find();

    // 2. Company Root
    let orgCompany = await orgRepo.findOneBy({ code: 'SMF' });
    if (!orgCompany) {
      orgCompany = orgRepo.create({
        code: 'SMF',
        name: 'PT Sarana Multigriya Finansial (Persero)',
        levelType: 'COMPANY',
      });
      await orgRepo.save(orgCompany);
    }

    let posDirut = await posRepo.findOne({
      where: { title: 'Direktur Utama' },
    });
    if (!posDirut) {
      posDirut = posRepo.create({
        title: 'Direktur Utama',
        organizationUnit: orgCompany,
        jobLevel: allJobLevels.find((j) => j.code === 'DIR'),
      });
      await posRepo.save(posDirut);
    }

    // 3. Recursive Builder Function
    async function buildOrgTree(
      nodes: any[],
      parentOrg: OrganizationUnit,
      parentPos: Position,
    ) {
      for (const node of nodes) {
        // Find or create Org Unit
        const code = slugify(node.orgName).substring(0, 50); // limit code length
        let org = await orgRepo.findOneBy({ code: code });
        if (!org) {
          org = orgRepo.create({
            code: code,
            name: node.orgName,
            levelType: node.orgType,
            parent: parentOrg,
          });
          await orgRepo.save(org);
        }

        // Find or create Position
        let pos = await posRepo.findOne({ where: { title: node.name } });
        if (!pos) {
          pos = posRepo.create({
            title: node.name,
            organizationUnit: org,
            jobLevel: allJobLevels.find((j) => j.code === node.jobCode),
            parentPosition: parentPos, // Direct reporting line
          });
          await posRepo.save(pos);
        }

        // Recursively build children
        if (node.children && node.children.length > 0) {
          await buildOrgTree(node.children, org, pos);
        }
      }
    }

    // Process the entire tree starting under the Company Root
    for (const dir of ORG_TREE) {
      // Special case: Direktur Utama is already handled at the root,
      // but its children should report to posDirut.
      if (dir.name === 'Direktur Utama') {
        await buildOrgTree(dir.children, orgCompany, posDirut);
      } else {
        // Find or create Directorate Org Unit
        const code = slugify(dir.orgName).substring(0, 50);
        let orgDir = await orgRepo.findOneBy({ code: code });
        if (!orgDir) {
          orgDir = orgRepo.create({
            code: code,
            name: dir.orgName,
            levelType: dir.orgType,
            parent: orgCompany,
          });
          await orgRepo.save(orgDir);
        }

        // Find or create Directorate Position
        let posDir = await posRepo.findOne({ where: { title: dir.name } });
        if (!posDir) {
          posDir = posRepo.create({
            title: dir.name,
            organizationUnit: orgDir,
            jobLevel: allJobLevels.find((j) => j.code === dir.jobCode),
            parentPosition: posDirut,
          });
          await posRepo.save(posDir);
        }

        // Process divisions under this directorate
        if (dir.children && dir.children.length > 0) {
          await buildOrgTree(dir.children, orgDir, posDir);
        }
      }
    }

    // 4. Setup Roles
    let roleStaff = await roleRepo.findOneBy({ code: 'STAFF' });
    if (!roleStaff) {
      roleStaff = roleRepo.create({
        code: 'STAFF',
        name: 'Staff Umum',
        description: 'Role dasar untuk semua staff',
      });
      await roleRepo.save(roleStaff);
    }

    let roleKabag = await roleRepo.findOneBy({ code: 'KABAG' });
    if (!roleKabag) {
      roleKabag = roleRepo.create({
        code: 'KABAG',
        name: 'Kepala Bagian',
        description: 'Role Kepala Bagian',
      });
      await roleRepo.save(roleKabag);
    }

    // 5. Setup User "Syafri"
    const targetPos = await posRepo.findOne({
      where: { title: 'Staff Pengembangan Sistem Aplikasi' },
    });
    if (!targetPos) {
      throw new Error(
        'Target position for Syafri not found! Something went wrong in tree building.',
      );
    }

    let syafri = await userRepo.findOneBy({ email: 'syafri@smf.co.id' });
    if (!syafri) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      syafri = userRepo.create({
        email: 'syafri@smf.co.id',
        name: 'Syafri Surya',
        password: hashedPassword,
        position: targetPos,
        isActive: true,
      });
      await userRepo.save(syafri);

      // Assign role to Syafri
      const userRole = userRoleRepo.create({ user: syafri, role: roleStaff });
      await userRoleRepo.save(userRole);

      console.log('User Syafri successfully created with password 12345');
    } else {
      console.log('User Syafri already exists. Ensuring position is correct.');
      syafri.position = targetPos;
      await userRepo.save(syafri);
    }

    console.log(
      'Massive Seeding of Entire PT SMF Organizational Structure completed successfully!',
    );
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
