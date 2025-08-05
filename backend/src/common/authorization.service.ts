import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/entities/board.entity';
import { List } from '../list/entities/list.entity';
import { Card } from '../card/entities/card.entity';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async verifyBoardOwnership(boardId: string, userId: string): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId, user_id: userId },
    });

    if (!board) {
      throw new UnauthorizedException('Access denied - Board not found or unauthorized');
    }
  }

  async verifyListOwnership(listId: string, userId: string): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board'],
    });

    if (!list) {
      throw new InternalServerErrorException(`List with ID ${listId} not found`);
    }

    const board = await this.boardRepository.findOne({
      where: { id: list.board_id, user_id: userId },
    });

    if (!board) {
      throw new UnauthorizedException('Access denied - List does not belong to user');
    }
  }

  async verifyCardOwnership(cardId: string, userId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board'],
    });

    if (!card) {
      throw new InternalServerErrorException(`Card with ID ${cardId} not found`);
    }

    const board = await this.boardRepository.findOne({
      where: { id: card.list.board_id, user_id: userId },
    });

    if (!board) {
      throw new UnauthorizedException('Access denied - Card does not belong to user');
    }

    return card;
  }
}