import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(userId: string, createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const payload = {
        ...createBoardDto,
        user_id: userId,
      };
      const board = this.boardRepository.create(payload);
      return await this.boardRepository.save(board);
    } catch (error) {
      throw new Error(`Failed to create board: ${error.message}`);
    }
  }

  async findBelongsToUser(userId: string): Promise<Board[]> {
    try {
      const boards = await this.boardRepository.find({
        where: { user_id: userId },
      });
      return boards;
    } catch (error) {
      throw new Error(`Failed to find boards: ${error.message}`);
    }
  }

  async findOne(boardId: string): Promise<Board> {
    try {
      const board = await this.boardRepository.findOne({
        where: { id: boardId },
      });
      if (!board) {
        throw new Error(`Board with ID ${boardId} not found`);
      }
      return board;
    } catch (error) {
      throw new Error(`Failed to find board: ${error.message}`);
    }
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    try {
      const result = await this.boardRepository.update(id, updateBoardDto);
      if (result.affected === 0) {
        throw new Error(`Board with ID ${id} not found`);
      }
      return await this.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to update board: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.boardRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Board with ID ${id} not found`);
      }
      return { message: 'Board removed successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        return { message: 'Board not found' };
      }
      throw new Error(`Failed to remove board: ${error.message}`);
    }
  }
}
