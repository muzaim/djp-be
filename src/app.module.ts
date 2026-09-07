import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ActivityOutputsModule } from './modules/activity-outputs/activity-outputs.module';
import { ResponsibilitiesModule } from './modules/responsibilities/responsibilities.module';
import { WorkEnvironmentsModule } from './modules/work-environments/work-environments.module';
import { WorkExperiencesModule } from './modules/work-experiences/work-experiences.module';
import { CompetenciesModule } from './modules/competencies/competencies.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    AuditLogsModule,
    ActivityOutputsModule,
    ResponsibilitiesModule,
    WorkEnvironmentsModule,
    WorkExperiencesModule,
    CompetenciesModule,
    TrainingsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
