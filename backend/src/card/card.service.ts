import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async create(listId: string, createCardDto: CreateCardDto): Promise<Card> {
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
        `Failed to create list: ${error.message}`,
      );
    }
  }

  async findByList(listId: string): Promise<Card[]> {
    try {
      return await this.cardRepository.find({
        where: { list_id: listId },
        order: { position: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Failed to find cards: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Card> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id },
      });
      if (!card) {
        throw new Error(`Card with ID ${id} not found`);
      }
      return card;
    } catch (error) {
      throw new Error(`Failed to find card: ${error.message}`);
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
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
      return await this.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update card: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.cardRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Card with ID ${id} not found`);
      }
      return { message: 'Card removed successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to remove card: ${error.message}`);
    }
  }

  async moveCard(
    cardId: string,
    newListId: string,
    newPosition?: number,
  ): Promise<Card> {
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

      return await this.findOne(cardId);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to move card: ${error.message}`,
      );
    }
  }
}
