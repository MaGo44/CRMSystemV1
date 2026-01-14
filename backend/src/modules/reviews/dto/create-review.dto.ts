import { IsInt, IsString, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Calificacion numerica del producto o servicio',
    required: true,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Muy buen servicio',
    description: 'Opinion sobre el producto o servicio',
    required: true,
  })
  @IsString()
  comment: string;

  @ApiProperty({
    example: 'Sarah Molina',
    description: 'Nombre del cliente',
    required: true,
  })
  @IsString()
  customerName: string;

  @ApiProperty({
    example: 'sarah@gmail.com',
    description: 'Email del cliente',
    required: true,
  })
  @IsEmail()
  customerEmail: string;
}
