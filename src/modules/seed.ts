import { AppDataSource } from '../database/data-source';
import { JobLevel } from './organizations/entities/job-level.entity';
import { OrganizationUnit } from './organizations/entities/organization-unit.entity';
import { Position } from './organizations/entities/position.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Starting seed...');

  try {
    // 1. Setup Job Levels
    const jobLevelRepo = AppDataSource.getRepository(JobLevel);
    
    let lvlDirector = await jobLevelRepo.findOneBy({ code: 'DIR' });
    if (!lvlDirector) {
      lvlDirector = jobLevelRepo.create({ code: 'DIR', name: 'Direktur', rankWeight: 10 });
      await jobLevelRepo.save(lvlDirector);
    }

    let lvlDivHead = await jobLevelRepo.findOneBy({ code: 'KADIV' });
    if (!lvlDivHead) {
      lvlDivHead = jobLevelRepo.create({ code: 'KADIV', name: 'Kepala Divisi', rankWeight: 20 });
      await jobLevelRepo.save(lvlDivHead);
    }

    let lvlDeptHead = await jobLevelRepo.findOneBy({ code: 'KABAG' });
    if (!lvlDeptHead) {
      lvlDeptHead = jobLevelRepo.create({ code: 'KABAG', name: 'Kepala Bagian', rankWeight: 30 });
      await jobLevelRepo.save(lvlDeptHead);
    }

    let lvlStaff = await jobLevelRepo.findOneBy({ code: 'STAFF' });
    if (!lvlStaff) {
      lvlStaff = jobLevelRepo.create({ code: 'STAFF', name: 'Staff', rankWeight: 40 });
      await jobLevelRepo.save(lvlStaff);
    }

    // 2. Setup Organization Units
    const orgRepo = AppDataSource.getRepository(OrganizationUnit);
    
    let orgCompany = await orgRepo.findOneBy({ code: 'SMF' });
    if (!orgCompany) {
      orgCompany = orgRepo.create({ code: 'SMF', name: 'PT Sarana Multigriya Finansial (Persero)', levelType: 'COMPANY' });
      await orgRepo.save(orgCompany);
    }

    let orgDirKeu = await orgRepo.findOneBy({ code: 'DIR-KEU-MR' });
    if (!orgDirKeu) {
      orgDirKeu = orgRepo.create({ code: 'DIR-KEU-MR', name: 'Direktorat Keuangan & Manajemen Risiko', levelType: 'DIRECTORATE', parent: orgCompany });
      await orgRepo.save(orgDirKeu);
    }

    let orgDivTI = await orgRepo.findOneBy({ code: 'DIV-TI' });
    if (!orgDivTI) {
      orgDivTI = orgRepo.create({ code: 'DIV-TI', name: 'Divisi Teknologi Informasi', levelType: 'DIVISION', parent: orgDirKeu });
      await orgRepo.save(orgDivTI);
    }

    let orgDeptPerencanaan = await orgRepo.findOneBy({ code: 'DEPT-PERENCANAAN-TI' });
    if (!orgDeptPerencanaan) {
      orgDeptPerencanaan = orgRepo.create({ code: 'DEPT-PERENCANAAN-TI', name: 'Perencanaan & Pengembangan', levelType: 'DEPARTMENT', parent: orgDivTI });
      await orgRepo.save(orgDeptPerencanaan);
    }

    // 3. Setup Positions
    const posRepo = AppDataSource.getRepository(Position);
    
    let posDirut = await posRepo.findOne({ where: { title: 'Direktur Utama' } });
    if (!posDirut) {
      posDirut = posRepo.create({ title: 'Direktur Utama', organizationUnit: orgCompany, jobLevel: lvlDirector });
      await posRepo.save(posDirut);
    }

    let posDirKeu = await posRepo.findOne({ where: { title: 'Direktur Keuangan & Manajemen Risiko' } });
    if (!posDirKeu) {
      posDirKeu = posRepo.create({ title: 'Direktur Keuangan & Manajemen Risiko', organizationUnit: orgDirKeu, jobLevel: lvlDirector, parentPosition: posDirut });
      await posRepo.save(posDirKeu);
    }

    let posKadivTI = await posRepo.findOne({ where: { title: 'Kepala Divisi Teknologi Informasi' } });
    if (!posKadivTI) {
      posKadivTI = posRepo.create({ title: 'Kepala Divisi Teknologi Informasi', organizationUnit: orgDivTI, jobLevel: lvlDivHead, parentPosition: posDirKeu });
      await posRepo.save(posKadivTI);
    }

    let posKabagPerencanaan = await posRepo.findOne({ where: { title: 'Kepala Bagian Perencanaan & Pengembangan' } });
    if (!posKabagPerencanaan) {
      posKabagPerencanaan = posRepo.create({ title: 'Kepala Bagian Perencanaan & Pengembangan', organizationUnit: orgDeptPerencanaan, jobLevel: lvlDeptHead, parentPosition: posKadivTI });
      await posRepo.save(posKabagPerencanaan);
    }

    let posStaffAppDev = await posRepo.findOne({ where: { title: 'Staff Pengembangan Sistem Aplikasi' } });
    if (!posStaffAppDev) {
      posStaffAppDev = posRepo.create({ title: 'Staff Pengembangan Sistem Aplikasi', organizationUnit: orgDeptPerencanaan, jobLevel: lvlStaff, parentPosition: posKabagPerencanaan });
      await posRepo.save(posStaffAppDev);
    }

    // 4. Setup Roles
    const roleRepo = AppDataSource.getRepository(Role);
    let roleStaff = await roleRepo.findOneBy({ code: 'STAFF' });
    if (!roleStaff) {
      roleStaff = roleRepo.create({ code: 'STAFF', name: 'Staff Umum', description: 'Role dasar untuk semua staff' });
      await roleRepo.save(roleStaff);
    }

    // 5. Setup User "Syafri"
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRole);
    
    let syafri = await userRepo.findOneBy({ email: 'syafri@smf.co.id' });
    if (!syafri) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      syafri = userRepo.create({
        email: 'syafri@smf.co.id',
        name: 'Syafri Surya',
        password: hashedPassword,
        position: posStaffAppDev,
        isActive: true,
      });
      await userRepo.save(syafri);

      // Assign role to Syafri
      const userRole = userRoleRepo.create({ user: syafri, role: roleStaff });
      await userRoleRepo.save(userRole);
      
      console.log('User Syafri successfully created with password 12345');
    } else {
      console.log('User Syafri already exists.');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
