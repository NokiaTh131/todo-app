import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsOptional } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  list_id?: string;
}
