import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(JwtAuthGuard)
  @Post('board/:boardId')
  create(
    @Param('boardId') boardId: string,
    @Body() createListDto: CreateListDto,
    @Request() req: any,
  ) {
    return this.listService.create(boardId, createListDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('board/:boardId')
  findByBoard(@Param('boardId') boardId: string, @Request() req: any) {
    return this.listService.findByBoard(boardId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.listService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto, @Request() req: any) {
    return this.listService.update(id, updateListDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.listService.remove(id, req.user.userId);
  }
}
