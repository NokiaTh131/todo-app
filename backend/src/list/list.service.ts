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
import { BoardService } from '../board/board.service';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    private boardService: BoardService,
  ) {}

  async create(
    boardId: string,
    createListDto: CreateListDto,
    userId: string,
  ): Promise<List> {
    try {
      await this.boardService.findOne(boardId, userId);
    } catch (error) {
      throw new UnauthorizedException('access denied');
    }

    // Get the next position if not provided
    let position = createListDto.position;
    if (!position) {
      const lastList = await this.listRepository.findOne({
        where: { board_id: boardId },
        order: { position: 'DESC' },
      });
      position = lastList ? lastList.position + 1 : 1;
    }

    try {
      const payload = {
        ...createListDto,
        board_id: boardId,
        position,
      };

      const list = this.listRepository.create(payload);
      return await this.listRepository.save(list);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create list: ${error.message}`,
      );
    }
  }

  async findByBoard(boardId: string, userId: string): Promise<List[]> {
    // Verify user owns the board
    try {
      await this.boardService.findOne(boardId, userId);
    } catch (error) {
      throw new UnauthorizedException('access denied');
    }
    try {
      return await this.listRepository.find({
        where: { board_id: boardId },
        order: { position: 'ASC' },
        relations: ['cards'],
      });
    } catch (error) {
      throw new Error(`Failed to find lists: ${error.message}`);
    }
  }

  async findOne(id: string, userId: string): Promise<List> {
    try {
      const list = await this.listRepository.findOne({
        where: { id },
        relations: ['cards', 'board'],
      });
      if (!list) {
        throw new Error(`List with ID ${id} not found`);
      }

      try {
        await this.boardService.findOne(list.board_id, userId);
      } catch (error) {
        throw new UnauthorizedException('access denied');
      } // Verify user owns the board

      return list;
    } catch (error) {
      throw new UnauthorizedException(`Failed to find list: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateListDto: UpdateListDto,
    userId: string,
  ): Promise<List> {
    // First verify the list exists and user owns the board
    try {
      await this.findOne(id, userId);
    } catch (error) {
      throw new UnauthorizedException('access denied');
    }

    try {
      const result = await this.listRepository.update(id, updateListDto);
      if (result.affected === 0) {
        throw new Error(`List with ID ${id} not found`);
      }
      return await this.findOne(id, userId);
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('access denied')
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update list: ${error.message}`,
      );
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // First verify the list exists and user owns the board
    try {
      await this.findOne(id, userId);
    } catch (error) {
      throw new UnauthorizedException('access denied');
    }

    try {
      const result = await this.listRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`List with ID ${id} not found`);
      }
      return { message: 'List removed successfully' };
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('access denied')
      ) {
        throw error;
      }
      throw new Error(`Failed to remove list: ${error.message}`);
    }
  }
}
