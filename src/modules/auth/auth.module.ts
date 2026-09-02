import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appMode =
          configService.get<string>('APP_MODE') ||
          configService.get<string>('NODE_ENV') ||
          'development';

        const customExpiry = configService.get<string>('JWT_EXPIRATION_TIME');
        // Dev: 24h (24 jam), Prod: 30m (30 menit)
        const defaultExpiry = appMode === 'production' ? '30m' : '48h';

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: customExpiry || defaultExpiry,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
