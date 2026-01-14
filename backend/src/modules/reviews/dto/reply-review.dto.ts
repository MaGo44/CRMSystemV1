import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty({
    example: 'Gracias por tu comentario',
    description: 'Respuesta a la reseña',
    required: true,
  })
  @IsString()
  reply: string;
}
