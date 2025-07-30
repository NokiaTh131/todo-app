import { IsEmail, IsString } from 'class-validator';

export class GetProfileResDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;
}
