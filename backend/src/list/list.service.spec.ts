import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListService } from './list.service';
import { List } from './entities/list.entity';
import { BoardService } from '../board/board.service';
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

const mockBoard = {
  id: '987f6543-e21a-43b2-b123-987654321000',
  user_id: 'test-user-id',
};

const mockRepository = {
  create: jest.fn().mockReturnValue(mockList),
  save: jest.fn().mockResolvedValue(mockList),
  find: jest.fn().mockResolvedValue([mockList]),
  findOne: jest.fn().mockResolvedValue(mockList),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockBoardService = {
  findOne: jest.fn().mockResolvedValue(mockBoard),
};

describe('ListService', () => {
  let service: ListService;
  let repository: Repository<List>;
  let boardService: BoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getRepositoryToken(List),
          useValue: mockRepository,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    repository = module.get<Repository<List>>(getRepositoryToken(List));
    boardService = module.get<BoardService>(BoardService);
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
      const userId = 'test-user-id';

      const result = await service.create(boardId, createListDto, userId);

      expect(boardService.findOne).toHaveBeenCalledWith(boardId, userId);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe('findByBoard', () => {
    it('should return all lists for a board', async () => {
      const boardId = '987f6543-e21a-43b2-b123-987654321000';
      const userId = 'test-user-id';

      const result = await service.findByBoard(boardId, userId);

      expect(boardService.findOne).toHaveBeenCalledWith(boardId, userId);
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockList]);
    });
  });

  describe('findOne', () => {
    it('should return a list by id', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'test-user-id';

      mockRepository.findOne.mockResolvedValueOnce({
        ...mockList,
        board_id: '987f6543-e21a-43b2-b123-987654321000',
      });

      const result = await service.findOne(listId, userId);

      expect(repository.findOne).toHaveBeenCalled();
      expect(boardService.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a list successfully', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const updateListDto: UpdateListDto = {
        name: 'Updated List',
      };
      const userId = 'test-user-id';

      mockRepository.findOne.mockResolvedValueOnce({
        ...mockList,
        board_id: '987f6543-e21a-43b2-b123-987654321000',
      });

      const result = await service.update(listId, updateListDto, userId);

      expect(repository.findOne).toHaveBeenCalled();
      expect(boardService.findOne).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a list successfully', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'test-user-id';

      mockRepository.findOne.mockResolvedValueOnce({
        ...mockList,
        board_id: '987f6543-e21a-43b2-b123-987654321000',
      });

      const result = await service.remove(listId, userId);

      expect(repository.findOne).toHaveBeenCalled();
      expect(boardService.findOne).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'List removed successfully' });
    });
  });
});