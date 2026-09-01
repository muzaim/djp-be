import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'passwordBaru123', description: 'Password baru user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password minimal 5 karakter' })
  newPassword!: string;

  @ApiPropertyOptional({ example: 'passwordBaru123', description: 'Konfirmasi password baru (re-type)' })
  @IsOptional()
  @IsString()
  retypePassword?: string;

  @ApiPropertyOptional({ example: 'passwordBaru123', description: 'Alias konfirmasi password baru (confirmPassword)' })
  @IsOptional()
  @IsString()
  confirmPassword?: string;

  @ApiPropertyOptional({ example: 'passwordBaru123', description: 'Alias konfirmasi password baru (retypeNewPassword)' })
  @IsOptional()
  @IsString()
  retypeNewPassword?: string;

  @ApiPropertyOptional({ example: 'passwordBaru123', description: 'Alias konfirmasi password baru (confirmNewPassword)' })
  @IsOptional()
  @IsString()
  confirmNewPassword?: string;
}
