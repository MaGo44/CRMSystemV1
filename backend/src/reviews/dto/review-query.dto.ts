import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString, IsDateString, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESPONDED = 'RESPONDED',
}

export enum SortBy {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ReviewQueryDto {
  @ApiProperty({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rating?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    required: false,
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'RESPONDED', 'REJECTED', 'ARCHIVED'],
  })
  @ApiProperty({ enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: SortBy, default: SortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
