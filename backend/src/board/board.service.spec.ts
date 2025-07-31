import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const mockBoard = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Board',
  description: 'Test Description',
  background_color: '#ffffff',
  user_id: '987f6543-e21a-43b2-b123-987654321000',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRepository = {
  create: jest.fn().mockReturnValue(mockBoard),
  save: jest.fn().mockResolvedValue(mockBoard),
  find: jest.fn().mockResolvedValue([mockBoard]),
  findOne: jest.fn().mockResolvedValue(mockBoard),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('BoardService', () => {
  let service: BoardService;
  let repository: Repository<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    repository = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a board successfully', async () => {
      const createBoardDto: CreateBoardDto = {
        name: 'Test Board',
        description: 'Test Description',
        background_color: '#ffffff',
      };
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.create(userId, createBoardDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createBoardDto,
        user_id: userId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockBoard);
      expect(result).toEqual(mockBoard);
    });

    it('should handle creation error', async () => {
      const createBoardDto: CreateBoardDto = {
        name: 'Test Board',
        description: 'Test Description',
        background_color: '#ffffff',
      };
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(userId, createBoardDto)).rejects.toThrow(
        'Failed to create board: Database error',
      );
    });
  });

  describe('findBelongsToUser', () => {
    it('should return boards for a user', async () => {
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.findBelongsToUser(userId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(result).toEqual([mockBoard]);
    });

    it('should handle find error', async () => {
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findBelongsToUser(userId)).rejects.toThrow(
        'Failed to find boards: Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a board by id', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.findOne(boardId, userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: boardId, user_id: userId },
      });
      expect(result).toEqual(mockBoard);
    });

    it('should throw error if board not found', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(boardId, userId)).rejects.toThrow(
        'Board with ID 123e4567-e89b-12d3-a456-426614174000 not found or access denied',
      );
    });
  });

  describe('update', () => {
    it('should update a board successfully', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const updateBoardDto: UpdateBoardDto = {
        name: 'Updated Board',
      };

      const result = await service.update(boardId, updateBoardDto, userId);

      expect(repository.update).toHaveBeenCalledWith(
        { id: boardId, user_id: userId },
        updateBoardDto
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: boardId, user_id: userId },
      });
      expect(result).toEqual(mockBoard);
    });

    it('should throw error if board not found for update', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const updateBoardDto: UpdateBoardDto = {
        name: 'Updated Board',
      };

      mockRepository.update.mockResolvedValueOnce({ affected: 0 });

      await expect(service.update(boardId, updateBoardDto, userId)).rejects.toThrow(
        'Board with ID 123e4567-e89b-12d3-a456-426614174000 not found or access denied',
      );
    });
  });

  describe('remove', () => {
    it('should remove a board successfully', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.remove(boardId, userId);

      expect(repository.delete).toHaveBeenCalledWith({ id: boardId, user_id: userId });
      expect(result).toEqual({ message: 'Board removed successfully' });
    });

    it('should return not found message if board not found for deletion', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.delete.mockResolvedValueOnce({ affected: 0 });

      const result = await service.remove(boardId, userId);

      expect(result).toEqual({ message: 'Board not found or access denied' });
    });
  });
});
