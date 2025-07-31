import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';
import { List } from '../list/entities/list.entity';
import { Board } from '../board/entities/board.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

const mockCard = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Card',
  description: 'Test Description',
  position: 1,
  due_date: new Date(),
  cover_color: '#ffffff',
  list_id: '987f6543-e21a-43b2-b123-987654321000',
  created_at: new Date(),
  updated_at: new Date(),
  list: {
    id: '987f6543-e21a-43b2-b123-987654321000',
    board_id: 'board-id-123',
  },
};

const mockList = {
  id: '987f6543-e21a-43b2-b123-987654321000',
  board_id: 'board-id-123',
};

const mockBoard = {
  id: 'board-id-123',
  user_id: 'test-user-id',
};

const mockCardRepository = {
  create: jest.fn().mockReturnValue(mockCard),
  save: jest.fn().mockResolvedValue(mockCard),
  find: jest.fn().mockResolvedValue([mockCard]),
  findOne: jest.fn().mockResolvedValue(mockCard),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockListRepository = {
  findOne: jest.fn().mockResolvedValue(mockList),
};

const mockBoardRepository = {
  findOne: jest.fn().mockResolvedValue(mockBoard),
};

describe('CardService', () => {
  let service: CardService;
  let cardRepository: Repository<Card>;
  let listRepository: Repository<List>;
  let boardRepository: Repository<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(List),
          useValue: mockListRepository,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    listRepository = module.get<Repository<List>>(getRepositoryToken(List));
    boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a card successfully', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        description: 'Test Description',
      };
      const listId = '987f6543-e21a-43b2-b123-987654321000';
      const userId = 'test-user-id';

      const result = await service.create(listId, createCardDto, userId);

      expect(listRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(cardRepository.create).toHaveBeenCalled();
      expect(cardRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCard);
    });
  });

  describe('findByList', () => {
    it('should return cards for a list', async () => {
      const listId = '987f6543-e21a-43b2-b123-987654321000';
      const userId = 'test-user-id';

      const result = await service.findByList(listId, userId);

      expect(listRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual([mockCard]);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'test-user-id';

      const result = await service.findOne(cardId, userId);

      expect(cardRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockCard);
    });
  });

  describe('update', () => {
    it('should update a card successfully', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
      };
      const userId = 'test-user-id';

      const result = await service.update(cardId, updateCardDto, userId);

      expect(cardRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(cardRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockCard);
    });
  });

  describe('remove', () => {
    it('should remove a card successfully', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'test-user-id';

      const result = await service.remove(cardId, userId);

      expect(cardRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(cardRepository.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Card removed successfully' });
    });
  });

  describe('moveCard', () => {
    it('should move a card successfully', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const newListId = 'new-list-id';
      const userId = 'test-user-id';

      const result = await service.moveCard(cardId, newListId, userId);

      expect(cardRepository.findOne).toHaveBeenCalled();
      expect(boardRepository.findOne).toHaveBeenCalled();
      expect(cardRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockCard);
    });
  });
});