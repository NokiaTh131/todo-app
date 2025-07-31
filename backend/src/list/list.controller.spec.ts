import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockList = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test List',
  position: 1,
  board_id: '987f6543-e21a-43b2-b123-987654321000',
  created_at: new Date(),
  cards: [],
};

const mockListService = {
  create: jest.fn().mockResolvedValue(mockList),
  findByBoard: jest.fn().mockResolvedValue([mockList]),
  findOne: jest.fn().mockResolvedValue(mockList),
  update: jest.fn().mockResolvedValue(mockList),
  remove: jest.fn().mockResolvedValue({ message: 'List removed successfully' }),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ListController', () => {
  let controller: ListController;
  let service: ListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        {
          provide: ListService,
          useValue: mockListService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ListController>(ListController);
    service = module.get<ListService>(ListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a list', async () => {
      const createListDto: CreateListDto = {
        name: 'Test List',
        position: 1,
      };
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      const req = { user: { userId: 'test-user-id' } };
      const result = await controller.create(boardId, createListDto, req);

      expect(service.create).toHaveBeenCalledWith(boardId, createListDto, 'test-user-id');
      expect(result).toEqual(mockList);
    });
  });

  describe('findByBoard', () => {
    it('should return all lists for a board', async () => {
      const boardId = '987f6543-e21a-43b2-b123-987654321000';

      const req = { user: { userId: 'test-user-id' } };
      const result = await controller.findByBoard(boardId, req);

      expect(service.findByBoard).toHaveBeenCalledWith(boardId, 'test-user-id');
      expect(result).toEqual([mockList]);
    });
  });

  describe('findOne', () => {
    it('should return a list by id', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      const req = { user: { userId: 'test-user-id' } };
      const result = await controller.findOne(listId, req);

      expect(service.findOne).toHaveBeenCalledWith(listId, 'test-user-id');
      expect(result).toEqual(mockList);
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';
      const updateListDto: UpdateListDto = {
        name: 'Updated List',
      };

      const req = { user: { userId: 'test-user-id' } };

      const result = await controller.update(listId, updateListDto, req);

      expect(service.update).toHaveBeenCalledWith(listId, updateListDto, 'test-user-id');
      expect(result).toEqual(mockList);
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      const listId = '123e4567-e89b-12d3-a456-426614174000';

      const req = { user: { userId: 'test-user-id' } };
      const result = await controller.remove(listId, req);

      expect(service.remove).toHaveBeenCalledWith(listId, 'test-user-id');
      expect(result).toEqual({ message: 'List removed successfully' });
    });
  });
});
