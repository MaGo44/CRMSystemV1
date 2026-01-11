import { ReviewStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StatusReviewDto {
  @ApiProperty({
    example: ReviewStatus.REJECTED,
    description: 'Cambio de estado de la reseña',
    required: true,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
