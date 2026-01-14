import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCompanyDto {
  @ApiProperty({
    example: 'Empresa S.A.',
    description: 'Nombre de la empresa',
    required: true,
  })
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'Email del usuario administrador',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario administrador (mínimo 6 caracteres)',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Juan Parra',
    description: 'Nombre del usuario administrador',
    required: true,
  })
  @IsString()
  @MinLength(2)
  name: string;
}
