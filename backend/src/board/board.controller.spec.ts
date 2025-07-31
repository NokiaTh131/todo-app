import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockBoard = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Board',
  description: 'Test Description',
  background_color: '#ffffff',
  user_id: '987f6543-e21a-43b2-b123-987654321000',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockBoardService = {
  create: jest.fn().mockResolvedValue(mockBoard),
  findBelongsToUser: jest.fn().mockResolvedValue([mockBoard]),
  findOne: jest.fn().mockResolvedValue(mockBoard),
  update: jest.fn().mockResolvedValue(mockBoard),
  remove: jest.fn().mockResolvedValue({ message: 'Board removed successfully' }),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('BoardController', () => {
  let controller: BoardController;
  let service: BoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<BoardController>(BoardController);
    service = module.get<BoardService>(BoardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto: CreateBoardDto = {
        name: 'Test Board',
        description: 'Test Description',
        background_color: '#ffffff',
      };
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const req = { user: { userId: userId } };

      const result = await controller.create(createBoardDto, req);

      expect(service.create).toHaveBeenCalledWith(userId, createBoardDto);
      expect(result).toEqual(mockBoard);
    });
  });

  describe('findBelongsToUser', () => {
    it('should return all boards for a user', async () => {
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const req = { user: { userId: userId } };

      const result = await controller.findBelongsToUser(req);

      expect(service.findBelongsToUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockBoard]);
    });
  });

  describe('findOne', () => {
    it('should return a board by id', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const req = { user: { userId: userId } };

      const result = await controller.findOne(boardId, req);

      expect(service.findOne).toHaveBeenCalledWith(boardId, userId);
      expect(result).toEqual(mockBoard);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const req = { user: { userId: userId } };
      const updateBoardDto: UpdateBoardDto = {
        name: 'Updated Board',
      };

      const result = await controller.update(boardId, updateBoardDto, req);

      expect(service.update).toHaveBeenCalledWith(boardId, updateBoardDto, userId);
      expect(result).toEqual(mockBoard);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      const boardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '987f6543-e21a-43b2-b123-987654321000';
      const req = { user: { userId: userId } };

      const result = await controller.remove(boardId, req);

      expect(service.remove).toHaveBeenCalledWith(boardId, userId);
      expect(result).toEqual({ message: 'Board removed successfully' });
    });
  });
});
