import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewResponse, CreateReviewResponse, ReviewListResponse } from './types/review.types';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { RequestWithUser } from 'src/auth/types/user-auth.types';
import { StatusReviewDto } from './dto/status-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    companyId: string,
    dto: CreateReviewDto,
    req: RequestWithUser
  ): Promise<CreateReviewResponse> {
    let customerId: string | undefined;

    if (dto.customerEmail) {
      const customer = await this.prisma.customer.upsert({
        where: {
          email: dto.customerEmail,
        },
        update: {
          name: dto.customerName,
        },
        create: {
          email: dto.customerEmail,
          name: dto.customerName,
        },
      });

      customerId = customer.id;
    }
    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        status: 'PENDING',
        companyId,
        customerId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
      include: {
        customer: true,
        company: true,
      },
    });

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
      customer: review.customer
        ? {
            id: review.customer.id,
            name: review.customer.name,
            email: review.customer.email,
          }
        : undefined,
      company: {
        id: review.company.id,
        name: review.company.name,
      },
    };
  }

  async findAllByCompany(
    companyId: string,
    query: ReviewQueryDto,
    userId: string
  ): Promise<ReviewListResponse> {
    const where: any = {
      companyId,
      ...(query.rating && { rating: query.rating }),
      ...(query.status && { status: query.status }),
      ...(query.startDate && {
        createdAt: { gte: new Date(query.startDate) },
      }),
      ...(query.endDate && {
        createdAt: { lte: new Date(query.endDate) },
      }),
    };

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    if (query.keyword) {
      where.comment = { contains: query.keyword, mode: 'insensitive' };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          customer: true,
          company: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip || 0,
        take: query.take || 20,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        reply: r.reply,
        repliedAt: r.repliedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        customer: r.customer
          ? {
              id: r.customer.id,
              name: r.customer.name,
              email: r.customer.email,
            }
          : undefined,
        company: {
          id: r.company.id,
          name: r.company.name,
        },
      })),
      total,
      page: Math.floor((query.skip || 0) / (query.take || 20)) + 1,
      totalPages: Math.ceil(total / (query.take || 20)),
    };
  }

  async replyToReview(
    userId: string,
    reviewId: string,
    dto: ReplyReviewDto
  ): Promise<ReviewResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        customer: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    if (review.companyId !== user.companyId) {
      throw new UnauthorizedException(
        'No tienes permiso para responder a reseñas de otras empresas'
      );
    }

    if (review.reply) {
      throw new BadRequestException('Esta reseña ya tiene una respuesta');
    }

    if (review.status === 'REJECTED' || review.status === 'ARCHIVED') {
      throw new BadRequestException(
        `No se puede responder a una reseña con estado ${review.status}`
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reply: dto.reply,
        repliedById: user.id,
        repliedAt: new Date(),
        status: 'RESPONDED',
      },
      include: {
        customer: true,
        company: true,
        repliedBy: true,
      },
    });

    return {
      id: updatedReview.id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      status: updatedReview.status,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      company: updatedReview.company
        ? {
            id: updatedReview.company.id,
            name: updatedReview.company.name,
          }
        : undefined,
      customer: updatedReview.customer
        ? {
            id: updatedReview.customer.id,
            name: updatedReview.customer.name,
            email: updatedReview.customer.email,
          }
        : undefined,
      reply: updatedReview.reply,
      repliedAt: updatedReview.repliedAt,
      repliedBy: updatedReview.repliedBy
        ? {
            id: updatedReview.repliedBy.id,
            name: updatedReview.repliedBy.name,
            email: updatedReview.repliedBy.email,
          }
        : undefined,
    };
  }

  async changeReviewStatus(
    userId: string,
    reviewId: string,
    data: StatusReviewDto
  ): Promise<ReviewResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        customer: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    if (review.companyId !== user.companyId) {
      throw new UnauthorizedException(
        'No tienes permiso para responder a reseñas de otras empresas'
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: data.status,
      },
      include: {
        customer: true,
        company: true,
        repliedBy: true,
      },
    });

    return {
      id: updatedReview.id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      status: updatedReview.status,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      company: updatedReview.company
        ? {
            id: updatedReview.company.id,
            name: updatedReview.company.name,
          }
        : undefined,
      customer: updatedReview.customer
        ? {
            id: updatedReview.customer.id,
            name: updatedReview.customer.name,
            email: updatedReview.customer.email,
          }
        : undefined,
      reply: updatedReview.reply,
      repliedAt: updatedReview.repliedAt,
      repliedBy: updatedReview.repliedBy
        ? {
            id: updatedReview.repliedBy.id,
            name: updatedReview.repliedBy.name,
            email: updatedReview.repliedBy.email,
          }
        : undefined,
    };
  }
}
