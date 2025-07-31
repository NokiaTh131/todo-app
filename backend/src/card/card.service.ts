import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { List } from '../list/entities/list.entity';
import { Board } from '../board/entities/board.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  private async verifyListOwnership(
    listId: string,
    userId: string,
  ): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board'],
    });

    if (!list) {
      throw new InternalServerErrorException(
        `List with ID ${listId} not found`,
      );
    }

    const board = await this.boardRepository.findOne({
      where: { id: list.board_id, user_id: userId },
    });

    if (!board) {
      throw new UnauthorizedException(
        `Access denied - List does not belong to user`,
      );
    }
  }

  private async verifyCardOwnership(
    cardId: string,
    userId: string,
  ): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['list', 'list.board'],
    });

    if (!card) {
      throw new InternalServerErrorException(
        `Card with ID ${cardId} not found`,
      );
    }

    const board = await this.boardRepository.findOne({
      where: { id: card.list.board_id, user_id: userId },
    });

    if (!board) {
      throw new UnauthorizedException(
        `Access denied - Card does not belong to user`,
      );
    }

    return card;
  }

  async create(
    listId: string,
    createCardDto: CreateCardDto,
    userId: string,
  ): Promise<Card> {
    // Verify user owns the list
    await this.verifyListOwnership(listId, userId);

    // Get the next position if not provided
    let position = createCardDto.position;
    if (!position) {
      const lastCard = await this.cardRepository.findOne({
        where: { list_id: listId },
        order: { position: 'DESC' },
      });
      position = lastCard ? lastCard.position + 1 : 1;
    }

    try {
      // Convert due_date string to Date if provided
      const dueDate = createCardDto.due_date
        ? new Date(createCardDto.due_date)
        : undefined;

      const payload = {
        ...createCardDto,
        list_id: listId,
        position,
        due_date: dueDate,
      };

      const card = this.cardRepository.create(payload);
      return await this.cardRepository.save(card);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create card: ${error.message}`,
      );
    }
  }

  async findByList(listId: string, userId: string): Promise<Card[]> {
    // Verify user owns the list
    await this.verifyListOwnership(listId, userId);

    try {
      return await this.cardRepository.find({
        where: { list_id: listId },
        order: { position: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find cards: ${error.message}`,
      );
    }
  }

  async findOne(id: string, userId: string): Promise<Card> {
    try {
      // Verify ownership first
      await this.verifyCardOwnership(id, userId);
      
      // Then return card without relations
      const card = await this.cardRepository.findOne({
        where: { id },
      });
      
      if (!card) {
        throw new InternalServerErrorException(`Card with ID ${id} not found`);
      }
      
      return card;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find card: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateCardDto: UpdateCardDto,
    userId: string,
  ): Promise<Card> {
    // Verify user owns the card
    await this.verifyCardOwnership(id, userId);

    try {
      // Convert due_date string to Date if provided
      const updateData: any = { ...updateCardDto };
      if (updateCardDto.due_date) {
        updateData.due_date = new Date(updateCardDto.due_date);
      }

      const result = await this.cardRepository.update(id, updateData);
      if (result.affected === 0) {
        throw new Error(`Card with ID ${id} not found`);
      }
      return await this.findOne(id, userId);
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('Access denied')
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update card: ${error.message}`,
      );
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verify user owns the card
    await this.verifyCardOwnership(id, userId);

    try {
      const result = await this.cardRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Card with ID ${id} not found`);
      }
      return { message: 'Card removed successfully' };
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('Access denied')
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove card: ${error.message}`,
      );
    }
  }

  async moveCard(
    cardId: string,
    newListId: string,
    userId: string,
    newPosition?: number,
  ): Promise<Card> {
    // Verify user owns both the card and the target list
    await this.verifyCardOwnership(cardId, userId);
    await this.verifyListOwnership(newListId, userId);

    let position = newPosition;
    if (!position) {
      const lastCard = await this.cardRepository.findOne({
        where: { list_id: newListId },
        order: { position: 'DESC' },
      });
      position = lastCard ? lastCard.position + 1 : 1;
    }

    try {
      const result = await this.cardRepository.update(cardId, {
        list_id: newListId,
        position,
      });

      if (result.affected === 0) {
        throw new Error(`Card with ID ${cardId} not found`);
      }

      return await this.findOne(cardId, userId);
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('Access denied')
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to move card: ${error.message}`,
      );
    }
  }
}
