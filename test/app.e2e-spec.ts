import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/modules/users/entities/user.entity';
import { OrganizationUnit } from './../src/modules/organizations/entities/organization-unit.entity';
import { JobLevel } from './../src/modules/organizations/entities/job-level.entity';
import { Position } from './../src/modules/organizations/entities/position.entity';
import { Role } from './../src/modules/roles/entities/role.entity';
import { UserRole } from './../src/modules/roles/entities/user-role.entity';
import { AuditLog } from './../src/modules/audit-logs/entities/audit-log.entity';
import { ActivityOutput } from './../src/modules/activity-outputs/entities/activity-output.entity';
import { Responsibility } from './../src/modules/responsibilities/entities/responsibility.entity';
import { Activity } from './../src/modules/responsibilities/entities/activity.entity';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn().mockResolvedValue(null),
    findOneBy: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(OrganizationUnit))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(JobLevel))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(Position))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(Role))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(UserRole))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(AuditLog))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(ActivityOutput))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(Responsibility))
      .useValue(mockRepo)
      .overrideProvider(getRepositoryToken(Activity))
      .useValue(mockRepo)
      .overrideProvider(DataSource)
      .useValue({
        initialize: jest.fn().mockResolvedValue(null),
        destroy: jest.fn().mockResolvedValue(null),
        manager: {
          transaction: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('Request completed successfully');
        expect(res.body.data).toBe('Hello World!');
      });
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.data.status).toBe('OK');
        expect(res.body.data.message).toBe('System is healthy and running');
        expect(res.body.data).toHaveProperty('timestamp');
      });
  });
});
