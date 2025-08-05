import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { BaseService } from '../common/base.service';
import { AuthorizationService } from '../common/authorization.service';
import { PositionService } from '../common/position.service';

@Injectable()
export class CardService extends BaseService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private authorizationService: AuthorizationService,
    private positionService: PositionService,
  ) {
    super();
  }

  private prepareCardData(cardDto: CreateCardDto | UpdateCardDto): any {
    const data: any = { ...cardDto };
    if (cardDto.due_date) {
      data.due_date = this.positionService.convertDateIfProvided(cardDto.due_date);
    }
    return data;
  }

  async create(
    listId: string,
    createCardDto: CreateCardDto,
    userId: string,
  ): Promise<Card> {
    await this.authorizationService.verifyListOwnership(listId, userId);

    return this.handleDatabaseOperation<Card>(
      async (): Promise<Card> => {
        let position = createCardDto.position;
        if (!position) {
          position = await this.positionService.getNextPosition(
            this.cardRepository,
            { list_id: listId },
          );
        }

        const payload = {
          ...this.prepareCardData(createCardDto),
          list_id: listId,
          position,
        };

        const card = this.cardRepository.create(payload);
        return (await this.cardRepository.save(card)) as unknown as Card;
      },
      'Failed to create card',
    );
  }

  async findByList(listId: string, userId: string): Promise<Card[]> {
    await this.authorizationService.verifyListOwnership(listId, userId);

    return this.handleDatabaseOperation<Card[]>(
      async (): Promise<Card[]> => {
        return await this.cardRepository.find({
          where: { list_id: listId },
          order: { position: 'ASC' } as any,
        });
      },
      'Failed to find cards',
    );
  }

  async findOne(id: string, userId: string): Promise<Card> {
    return this.handleDatabaseOperation<Card>(
      async (): Promise<Card> => {
        await this.authorizationService.verifyCardOwnership(id, userId);

        const card = await this.cardRepository.findOne({
          where: { id },
        });

        return this.handleEntityNotFound(card, 'Card', id);
      },
      'Failed to find card',
    );
  }

  async update(
    id: string,
    updateCardDto: UpdateCardDto,
    userId: string,
  ): Promise<Card> {
    await this.authorizationService.verifyCardOwnership(id, userId);
    
    if (updateCardDto.list_id) {
      await this.authorizationService.verifyListOwnership(updateCardDto.list_id, userId);
      
      if (!updateCardDto.position) {
        updateCardDto.position = await this.positionService.getNextPosition(
          this.cardRepository,
          { list_id: updateCardDto.list_id },
        );
      }
    }

    return this.handleDatabaseOperation<Card>(
      async (): Promise<Card> => {
        const updateData = this.prepareCardData(updateCardDto);
        
        const result = await this.cardRepository.update(id, updateData);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`Card with ID ${id} not found`);
        }
        return await this.findOne(id, userId);
      },
      'Failed to update card',
    );
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.authorizationService.verifyCardOwnership(id, userId);

    return this.handleDatabaseOperation<{ message: string }>(
      async (): Promise<{ message: string }> => {
        const result = await this.cardRepository.delete(id);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`Card with ID ${id} not found`);
        }
        return { message: 'Card removed successfully' };
      },
      'Failed to remove card',
    );
  }
}