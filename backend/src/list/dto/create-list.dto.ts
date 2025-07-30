import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  position?: number;
}
