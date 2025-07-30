import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListService } from './list.service';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

const mockList = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test List',
  position: 1,
  board_id: '987f6543-e21a-43b2-b123-987654321000',
  created_at: new Date(),
  cards: [],
};

const mockRepository = {
  create: jest.fn().mockReturnValue(mockList),
  save: jest.fn().mockResolvedValue(mockList),
  find: jest.fn().mockResolvedValue([mockList]),
  findOne: jest.fn().mockResolvedValue(mockList),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('ListService', () => {
  let service: ListService;
  let repository: Repository<List>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getRepositoryToken(List),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    repository = module.get<Repository<List>>(getRepositoryToken(List));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a list with auto-position', async () => {
      const createListDto: CreateListDto = {
        name: 'Test List',
      };
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.create(boardId, createListDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { board_id: boardId },
        order: { position: 'DESC' },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createListDto,
        board_id: boardId,
        position: 2,
      });
      expect(repository.save).toHaveBeenCalledWith(mockList);
      expect(result).toEqual(mockList);
    });

    it('should create a list with specific position', async () => {
      const createListDto: CreateListDto = {
        name: 'Test List',
        position: 2,
      };
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.create(boardId, createListDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createListDto,
        board_id: boardId,
        position: 2,
      });
      expect(result).toEqual(mockList);
    });

    it('should handle creation error', async () => {
      const createListDto: CreateListDto = {
        name: 'Test List',
      };
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(boardId, createListDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByBoard', () => {
    it('should return lists for a board', async () => {
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.findByBoard(boardId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { board_id: boardId },
        order: { position: 'ASC' },
        relations: ['cards'],
      });
      expect(result).toEqual([mockList]);
    });

    it('should handle find error', async () => {
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findByBoard(boardId)).rejects.toThrow(
        'Failed to find lists: Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a list by id', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await service.findOne(listId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: listId },
        relations: ['cards'],
      });
      expect(result).toEqual(mockList);
    });

    it('should throw error if list not found', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(listId)).rejects.toThrow(
        'List with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a list successfully', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const updateListDto: UpdateListDto = {
        name: 'Updated List',
      };

      const result = await service.update(listId, updateListDto);

      expect(repository.update).toHaveBeenCalledWith(listId, updateListDto);
      expect(result).toEqual(mockList);
    });

    it('should throw error if list not found for update', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const updateListDto: UpdateListDto = {
        name: 'Updated List',
      };

      mockRepository.update.mockResolvedValueOnce({ affected: 0 });

      await expect(service.update(listId, updateListDto)).rejects.toThrow(
        'List with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a list successfully', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await service.remove(listId);

      expect(repository.delete).toHaveBeenCalledWith(listId);
      expect(result).toEqual({ message: 'List removed successfully' });
    });

    it('should throw error if list not found for deletion', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.delete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.remove(listId)).rejects.toThrow(
        'List with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });
});
