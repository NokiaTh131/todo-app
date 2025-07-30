import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';
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
};

const mockRepository = {
  create: jest.fn().mockReturnValue(mockCard),
  save: jest.fn().mockResolvedValue(mockCard),
  find: jest.fn().mockResolvedValue([mockCard]),
  findOne: jest.fn().mockResolvedValue(mockCard),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('CardService', () => {
  let service: CardService;
  let repository: Repository<Card>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    repository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a card with auto-position', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        description: 'Test Description',
      };
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.create(listId, createCardDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { list_id: listId },
        order: { position: 'DESC' },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createCardDto,
        list_id: listId,
        position: 2,
        due_date: undefined,
      });
      expect(repository.save).toHaveBeenCalledWith(mockCard);
      expect(result).toEqual(mockCard);
    });

    it('should create a card with specific position and due date', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        position: 2,
        due_date: '2024-12-31T23:59:59.000Z',
      };
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.create(listId, createCardDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createCardDto,
        list_id: listId,
        position: 2,
        due_date: new Date('2024-12-31T23:59:59.000Z'),
      });
      expect(result).toEqual(mockCard);
    });

    it('should handle creation error', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
      };
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(listId, createCardDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByList', () => {
    it('should return cards for a list', async () => {
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      const result = await service.findByList(listId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { list_id: listId },
        order: { position: 'ASC' },
      });
      expect(result).toEqual([mockCard]);
    });

    it('should handle find error', async () => {
      const listId = '987f6543-e21a-43b2-b123-987654321000';

      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findByList(listId)).rejects.toThrow(
        'Failed to find cards: Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await service.findOne(cardId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: cardId },
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw error if card not found', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(cardId)).rejects.toThrow(
        'Card with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a card successfully', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
        due_date: '2024-12-31T23:59:59.000Z',
      };

      const result = await service.update(cardId, updateCardDto);

      expect(repository.update).toHaveBeenCalledWith(cardId, {
        ...updateCardDto,
        due_date: new Date('2024-12-31T23:59:59.000Z'),
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw error if card not found for update', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
      };

      mockRepository.update.mockResolvedValueOnce({ affected: 0 });

      await expect(service.update(cardId, updateCardDto)).rejects.toThrow(
        'Card with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a card successfully', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      const result = await service.remove(cardId);

      expect(repository.delete).toHaveBeenCalledWith(cardId);
      expect(result).toEqual({ message: 'Card removed successfully' });
    });

    it('should throw error if card not found for deletion', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.delete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.remove(cardId)).rejects.toThrow(
        'Card with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });

  describe('moveCard', () => {
    it('should move a card with auto-position', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const newListId = 'abc123-new-list-id';

      const result = await service.moveCard(cardId, newListId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { list_id: newListId },
        order: { position: 'DESC' },
      });
      expect(repository.update).toHaveBeenCalledWith(cardId, {
        list_id: newListId,
        position: 2,
      });
      expect(result).toEqual(mockCard);
    });

    it('should move a card with specific position', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const newListId = 'abc123-new-list-id';
      const newPosition = 3;

      const result = await service.moveCard(cardId, newListId, newPosition);

      expect(repository.update).toHaveBeenCalledWith(cardId, {
        list_id: newListId,
        position: newPosition,
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw error if card not found for move', async () => {
      const cardId = '123e4567-e89b-12d3-a456-426614174000';
      const newListId = 'abc123-new-list-id';

      mockRepository.update.mockResolvedValueOnce({ affected: 0 });

      await expect(service.moveCard(cardId, newListId)).rejects.toThrow(
        'Card with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      );
    });
  });
});
