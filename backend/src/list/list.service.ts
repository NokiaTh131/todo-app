import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';
import { BaseService } from '../common/base.service';
import { AuthorizationService } from '../common/authorization.service';
import { PositionService } from '../common/position.service';

@Injectable()
export class ListService extends BaseService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    private authorizationService: AuthorizationService,
    private positionService: PositionService,
  ) {
    super();
  }

  async create(
    boardId: string,
    createListDto: CreateListDto,
    userId: string,
  ): Promise<List> {
    await this.authorizationService.verifyBoardOwnership(boardId, userId);

    return this.handleDatabaseOperation(
      async () => {
        let position = createListDto.position;
        if (!position) {
          position = await this.positionService.getNextPosition(
            this.listRepository,
            { board_id: boardId },
          );
        }

        const payload = {
          ...createListDto,
          board_id: boardId,
          position,
        };

        const list = this.listRepository.create(payload);
        return await this.listRepository.save(list);
      },
      'Failed to create list',
    );
  }

  async findByBoard(boardId: string, userId: string): Promise<List[]> {
    await this.authorizationService.verifyBoardOwnership(boardId, userId);

    return this.handleDatabaseOperation(
      async () => {
        return await this.listRepository.find({
          where: { board_id: boardId },
          order: { position: 'ASC' },
          relations: ['cards'],
        });
      },
      'Failed to find lists',
    );
  }

  async findOne(id: string, userId: string): Promise<List> {
    return this.handleDatabaseOperation(
      async () => {
        const list = await this.listRepository.findOne({
          where: { id },
          relations: ['cards', 'board'],
        });
        
        if (!list) {
          throw new UnauthorizedException('access denied');
        }
        
        await this.authorizationService.verifyBoardOwnership(list.board_id, userId);
        
        return list;
      },
      'Failed to find list',
    );
  }

  async update(
    id: string,
    updateListDto: UpdateListDto,
    userId: string,
  ): Promise<List> {
    await this.findOne(id, userId);

    return this.handleDatabaseOperation(
      async () => {
        const result = await this.listRepository.update(id, updateListDto);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`List with ID ${id} not found`);
        }
        return await this.findOne(id, userId);
      },
      'Failed to update list',
    );
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.findOne(id, userId);

    return this.handleDatabaseOperation(
      async () => {
        const result = await this.listRepository.delete(id);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`List with ID ${id} not found`);
        }
        return { message: 'List removed successfully' };
      },
      'Failed to remove list',
    );
  }
}
