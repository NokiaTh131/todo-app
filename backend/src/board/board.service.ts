import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      throw new InternalServerErrorException(
        `Failed to create board: ${error.message}`,
      );
    }
  }

  async findBelongsToUser(userId: string): Promise<Board[]> {
    try {
      const boards = await this.boardRepository.find({
        where: { user_id: userId },
      });
      return boards;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find boards: ${error.message}`,
      );
    }
  }

  async findOne(boardId: string, userId: string): Promise<Board> {
    try {
      const board = await this.boardRepository.findOne({
        where: { id: boardId, user_id: userId },
      });
      if (!board) {
        throw new InternalServerErrorException(
          `Board with ID ${boardId} not found or access denied`,
        );
      }
      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find board: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string,
  ): Promise<Board> {
    try {
      const result = await this.boardRepository.update(
        { id, user_id: userId },
        updateBoardDto,
      );
      if (result.affected === 0) {
        throw new InternalServerErrorException(
          `Board with ID ${id} not found or access denied`,
        );
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
        `Failed to update board: ${error.message}`,
      );
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    try {
      const result = await this.boardRepository.delete({ id, user_id: userId });
      if (result.affected === 0) {
        throw new InternalServerErrorException(
          `Board with ID ${id} not found or access denied`,
        );
      }
      return { message: 'Board removed successfully' };
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('access denied')
      ) {
        return { message: 'Board not found or access denied' };
      }
      throw new InternalServerErrorException(
        `Failed to remove board: ${error.message}`,
      );
    }
  }
}
