import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetProfileResDto } from './dto/getprofile-res.dto';
import { AuthenticatedRequest } from '../common/interfaces/request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<GetProfileResDto> {
    const user_profile = await this.userService.findByEmail(req.user.email);
    return {
      id: user_profile.id,
      email: user_profile.email,
      username: user_profile.username,
    };
  }
}
