import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.transformProfile(user),
    };
  }

  transformProfile(user: User) {
    const orgUnit = user.position?.organizationUnit || null;
    const divisionName = this.findDivisionName(orgUnit);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      position: user.position
        ? {
            id: user.position.id,
            title: user.position.title,
            jobLevel: user.position.jobLevel ? user.position.jobLevel.name : null,
            organizationUnit: orgUnit ? orgUnit.name : null,
            division: divisionName,
          }
        : null,
      roles: user.userRoles ? user.userRoles.map((ur) => ur.role?.code).filter(Boolean) : [],
    };
  }

  private findDivisionName(unit: any): string | null {
    let curr = unit;
    while (curr) {
      if (curr.levelType === 'DIVISION') {
        return curr.name;
      }
      curr = curr.parent;
    }
    return null;
  }
}
