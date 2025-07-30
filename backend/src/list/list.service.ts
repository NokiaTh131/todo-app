import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
  ) {}

  async create(boardId: string, createListDto: CreateListDto): Promise<List> {
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

  async findByBoard(boardId: string): Promise<List[]> {
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

  async findOne(id: string): Promise<List> {
    try {
      const list = await this.listRepository.findOne({
        where: { id },
        relations: ['cards'],
      });
      if (!list) {
        throw new Error(`List with ID ${id} not found`);
      }
      return list;
    } catch (error) {
      throw new Error(`Failed to find list: ${error.message}`);
    }
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<List> {
    try {
      const result = await this.listRepository.update(id, updateListDto);
      if (result.affected === 0) {
        throw new Error(`List with ID ${id} not found`);
      }
      return await this.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update list: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.listRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`List with ID ${id} not found`);
      }
      return { message: 'List removed successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to remove list: ${error.message}`);
    }
  }
}
