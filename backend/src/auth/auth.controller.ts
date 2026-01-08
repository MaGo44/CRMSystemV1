import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
    description: 'Autentica un usuario y devuelve un JWT token',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: 'uuid',
          email: 'admin@empresa.com',
          name: 'Administrador',
          companyId: 'uuid',
          role: 'COMPANY_ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nueva empresa',
    description: 'Crea una nueva empresa y un usuario administrador asociado',
  })
  @ApiBody({
    type: RegisterCompanyDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa registrada exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: 'uuid',
          email: 'admin@empresa.com',
          name: 'Administrador',
          companyId: 'uuid',
          role: 'COMPANY_ADMIN',
        },
        company: {
          id: 'uuid',
          name: 'Mi Empresa',
          slug: 'mi-empresa',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya registrado',
  })
  async register(@Body() registerDto: RegisterCompanyDto) {
    return this.authService.registerCompany({
      companyName: registerDto.companyName,
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
    });
  }
}
