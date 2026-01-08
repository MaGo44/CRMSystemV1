import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  // DefaultValuePipe,
  // ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
// import { ReplyReviewDto } from './dto/reply-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { CreateReviewResponse } from './types/review.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { Role } from 'src/auth/types/role.enum';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':companyId/create-review')
  @ApiOperation({
    summary: 'Crear la reseñas',
    description: 'Crea una reseñas vinculada a un cliente existente o uno nuevo',
  })
  @ApiBody({
    type: CreateReviewDto,
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID de la empresa para la cual se obtienen las reseñas',
    type: String,
    example: 'e1d61440-4ff5-4f77-8456-84c7c76d1c0e',
  })
  @ApiResponse({
    status: 201,
    description: 'Reseñas creada',
    schema: {
      type: 'object',
      example: {
        data: {
          rating: 5,
          comment: 'Muy buen servicio',
          status: 'PENDING',
          companyId: '',
          customerId: '',
          ipAddress: '',
          userAgent: '',
          customer: {
            id: 'customer-12345',
            name: 'Sarah Molina',
            email: 'sarah@gmail.com',
          },
          company: {
            id: 'e1d61440-4ff5-4f77-8456-84c7c76d1c0e',
            name: 'Empresa S.A.',
          },
        },
      },
    },
  })
  async create(
    @Body() CreateReviewDto: CreateReviewDto,
    @Req() req: Request,
    @Param('companyId') companyId: string
  ): Promise<CreateReviewResponse> {
    return this.reviewsService.createReview(companyId, CreateReviewDto, req);
  }

  @ApiBearerAuth()
  @Get('companies/:companyId/reviews')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.)
  @ApiOperation({
    summary: 'Obtener lista de reseñas con filtros',
    description: 'Obtiene una lista paginada de resenas aplicando filtros opcionales',
  })
  @ApiBody({
    type: ReviewQueryDto,
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID de la empresa para la cual se obtienen las reseñas',
    type: String,
    example: 'company-12345',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página para la paginación',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de items por página',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado de la reseña',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESPONDED', 'ARCHIVED'],
    example: 'PENDING',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    description: 'Filtrar por calificación',
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el cual ordenar',
    enum: ['createdAt', 'rating', 'updatedAt'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de resenas obtenida',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'review-12345' },
              rating: { type: 'number', example: 5 },
              comment: { type: 'string', example: 'Excelente servicio' },
              status: { type: 'string', example: 'PENDING' },
              createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              updatedAt: { type: 'string', example: '2024-01-02T00:00:00.000Z' },
              company: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'company-12345' },
                  name: { type: 'string', example: 'Mi Empresa' },
                },
              },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'customer-12345' },
                  name: { type: 'string', example: 'Juan Perez' },
                  email: { type: 'string', example: 'juan@gmail.com' },
                },
              },
              reply: { type: 'string', example: 'Gracias por tu reseña!', nullable: true },
              repliedAt: { type: 'string', example: '2024-01-03T00:00:00.000Z' },
              repliedBy: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string', example: 'user-12345' },
                  name: { type: 'string', example: 'Support user' },
                  email: { type: 'string', example: 'user@gmail.com' },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tiene permisos para acceder a este recurso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa no encontrada',
  })
  async findAll(
    @Body() ReviewQueryDto: ReviewQueryDto,
    @Param('companyId') companyId: string,
    @Query() query: ReviewQueryDto
  ) {
    return this.reviewsService.findAllByCompany(companyId, query);
  }
}
