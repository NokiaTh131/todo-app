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
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @UseGuards(JwtAuthGuard)
  @Post('list/:listId')
  create(
    @Param('listId') listId: string,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardService.create(listId, createCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list/:listId')
  findByList(@Param('listId') listId: string) {
    return this.cardService.findByList(listId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/move')
  moveCard(
    @Param('id') cardId: string,
    @Body() moveData: { newListId: string; newPosition?: number },
  ) {
    return this.cardService.moveCard(
      cardId,
      moveData.newListId,
      moveData.newPosition,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }
}
