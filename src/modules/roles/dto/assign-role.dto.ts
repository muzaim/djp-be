import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'uuid-user', description: 'ID User' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'uuid-role', description: 'ID Role' })
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;
}
