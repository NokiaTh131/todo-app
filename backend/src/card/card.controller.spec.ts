import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
};

const mockCardService = {
  create: jest.fn().mockResolvedValue(mockCard),
  findByList: jest.fn().mockResolvedValue([mockCard]),
  findOne: jest.fn().mockResolvedValue(mockCard),
  update: jest.fn().mockResolvedValue(mockCard),
  moveCard: jest.fn().mockResolvedValue(mockCard),
  remove: jest.fn().mockResolvedValue({ message: 'Card removed successfully' }),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('CardController', () => {
  let controller: CardController;
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<CardController>(CardController);
    service = module.get<CardService>(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a card', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        description: 'Test Description',
      };
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await controller.create(listId, createCardDto);

      expect(service.create).toHaveBeenCalledWith(listId, createCardDto);
      expect(result).toEqual(mockCard);
    });
  });

  describe('findByList', () => {
    it('should return all cards for a list', async () => {
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await controller.findByList(listId);

      expect(service.findByList).toHaveBeenCalledWith(listId);
      expect(result).toEqual([mockCard]);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await controller.findOne(cardId);

      expect(service.findOne).toHaveBeenCalledWith(cardId);
      expect(result).toEqual(mockCard);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
      };

      const result = await controller.update(cardId, updateCardDto);

      expect(service.update).toHaveBeenCalledWith(cardId, updateCardDto);
      expect(result).toEqual(mockCard);
    });
  });

  describe('moveCard', () => {
    it('should move a card', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const moveData = {
        newListId: 'new-list-id',
        newPosition: 2,
      };

      const result = await controller.moveCard(cardId, moveData);

      expect(service.moveCard).toHaveBeenCalledWith(
        cardId,
        moveData.newListId,
        moveData.newPosition,
      );
      expect(result).toEqual(mockCard);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await controller.remove(cardId);

      expect(service.remove).toHaveBeenCalledWith(cardId);
      expect(result).toEqual({ message: 'Card removed successfully' });
    });
  });
});
