import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @UseGuards(JwtAuthGuard)
  @Post('list/:listId')
  create(
    @Param('listId') listId: string,
    @Body() createCardDto: CreateCardDto,
    @Request() req: any,
  ) {
    return this.cardService.create(listId, createCardDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list/:listId')
  findByList(@Param('listId') listId: string, @Request() req: any) {
    return this.cardService.findByList(listId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.cardService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Request() req: any,
  ) {
    return this.cardService.update(id, updateCardDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cardService.remove(id, req.user.userId);
  }
}
