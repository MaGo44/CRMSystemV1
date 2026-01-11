import {
  Controller,
  Post,
  Get,
  Patch,
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
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { StatusReviewDto } from './dto/status-review.dto';
import { CreateReviewResponse } from './types/review.types';
import { SafeUser, RequestWithUser } from 'src/auth/types/user-auth.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RoleCategory } from 'src/auth/types/user-roles.enum';
import { CurrentUser } from 'src/auth/decorators/user-auth.decorator';
import { RoleType } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':companyId/create-review')
  @Public()
  @ApiOperation({
    summary: 'Crear la reseñas',
    description: 'Crea una reseña vinculada a un cliente existente o uno nuevo',
  })
  @ApiBody({
    type: CreateReviewDto,
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID de la empresa para la cual se obtienen las reseñas',
    type: String,
    example: 'e5803103-1875-41a5-9c3d-cc3cbc8d92a5',
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
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string
  ): Promise<CreateReviewResponse> {
    return this.reviewsService.createReview(companyId, createReviewDto, req);
  }

  @ApiBearerAuth('access-token')
  @Get('companies/:companyId/reviews')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleType(RoleCategory.COMPANY_USER)
  @ApiOperation({
    summary: 'Obtener lista de reseñas con filtros',
    description: 'Obtiene una lista paginada de reseñas aplicando filtros opcionales',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID de la empresa para la cual se obtienen las reseñas',
    type: String,
    example: 'e5803103-1875-41a5-9c3d-cc3cbc8d92a5',
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
    name: 'keyword',
    required: false,
    description: 'Buscar por palabra clave en comentarios',
    type: String,
    example: 'Excelente',
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
    description: 'Lista de reseñas obtenida',
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
    @CurrentUser() user: SafeUser,
    @Param('companyId') companyId: string,
    @Query() query: ReviewQueryDto
  ) {
    return this.reviewsService.findAllByCompany(companyId, query, user.id);
  }

  @ApiBearerAuth('access-token')
  @Patch(':reviewId/reply')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleType(RoleCategory.COMPANY_USER)
  @ApiOperation({
    summary: 'Responder a una reseña',
    description: 'Permite a un usuario autorizado responder a una reseña específica',
  })
  @ApiBody({
    type: ReplyReviewDto,
  })
  @ApiParam({
    name: 'reviewId',
    description: 'ID de la reseña a la que se responde',
    type: String,
    example: 'aa6562c7-ecec-44ec-8ed5-30cc9c91baf1',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta registrada exitosamente',
    schema: {
      type: 'object',
      example: {
        id: 'aa6562c7-ecec-44ec-8ed5-30cc9c91baf1',
        rating: 5,
        comment: 'Muy buen servicio',
        status: 'RESPONDED',
        reply: 'Gracias por tu comentario',
        repliedAt: '2024-01-10T18:45:00.000Z',
        repliedBy: {
          id: '11c4eb62-ee6e-4b3a-b694-568113bc1ed0',
          name: 'Juan Parra',
          email: 'admin@empresa.com',
        },
        createdAt: '2024-01-10T18:45:00.000Z',
        updatedAt: '2024-01-10T18:45:00.000Z',
        customer: {
          id: '239abddb-a05e-4c79-9653-597b112c36b1',
          name: 'Sarah Molina',
          email: 'sarah@gmail.com',
        },
        company: {
          id: 'e1d61440-4ff5-4f77-8456-84c7c76d1c0e',
          name: 'Empresa S.A.',
        },
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
    description: 'Reseña no pertenece a la empresa',
  })
  async replyToReview(
    @Param('reviewId') reviewId: string,
    @Body() replyReviewDto: ReplyReviewDto,
    @CurrentUser() user: SafeUser
  ) {
    return this.reviewsService.replyToReview(user.id, reviewId, replyReviewDto);
  }

  @ApiBearerAuth('access-token')
  @Patch(':reviewId/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RoleType(RoleCategory.COMPANY_USER)
  @ApiOperation({
    summary: 'Cambiar el estado de una reseña',
    description: 'Permite a un usuario autorizado cambiar el estado de una reseña específica',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'ID de la reseña cuyo estado se va a cambiar',
    type: String,
    example: 'aa6562c7-ecec-44ec-8ed5-30cc9c91baf1',
  })
  @ApiBody({
    type: StatusReviewDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la reseña actualizado exitosamente',
    type: StatusReviewDto,
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
    description: 'Reseña no encontrada',
  })
  async changeReviewStatus(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: StatusReviewDto
  ) {
    return this.reviewsService.changeReviewStatus(user.id, reviewId, dto);
  }
}
