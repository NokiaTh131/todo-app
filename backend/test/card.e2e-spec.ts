import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule } from './test.module';

describe('CardController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];
  let userId: string;
  let boardId: string;
  let listId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();

    // Create and login a user for authentication
    const id = Math.random().toString(36).substring(7);
    const email = `user${id}@example.com`;

    const userResponse = await request(app.getHttpServer())
      .post('/user/register')
      .send({
        username: `user${id}`,
        email: email,
        password: 'password123',
      });

    userId = userResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: 'password123',
      });

    authCookies = loginResponse.headers['set-cookie'] as unknown as string[];

    // Create a test board for card operations
    const boardResponse = await request(app.getHttpServer())
      .post('/board')
      .set('Cookie', authCookies)
      .send({
        name: 'Test Board for Cards',
        description: 'Board for testing cards',
        background_color: '#ffffff',
      });

    boardId = boardResponse.body.id;

    // Create a test list for card operations
    const listResponse = await request(app.getHttpServer())
      .post(`/lists/board/${boardId}`)
      .set('Cookie', authCookies)
      .send({
        name: 'Test List for Cards',
        position: 1,
      });

    listId = listResponse.body.id;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/cards/list/:listId (POST)', () => {
    it('should create a new card with valid data', async () => {
      const cardData = {
        title: 'Test Card',
        description: 'Test card description',
        position: 1,
        due_date: '2024-12-31T23:59:59.000Z',
        cover_color: '#ff0000',
      };

      const response = await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(cardData.title);
      expect(response.body.description).toBe(cardData.description);
      expect(response.body.position).toBe(cardData.position);
      expect(response.body.cover_color).toBe(cardData.cover_color);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('should create a card with minimal data', async () => {
      const cardData = {
        title: 'Minimal Card',
      };

      const response = await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(cardData.title);
    });

    it('should fail to create card without authentication', async () => {
      const cardData = {
        title: 'Test Card',
        description: 'Test card description',
      };

      await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .send(cardData)
        .expect(401);
    });

    it('should fail to create card with invalid data', async () => {
      const cardData = {
        title: '', // Empty title should fail validation
        description: 'Test card description',
      };

      await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData)
        .expect(400);
    });
  });

  describe('/cards/list/:listId (GET)', () => {
    it('should get all cards belonging to a list', async () => {
      // Create a test card first
      const cardData = {
        title: 'List Card',
        description: 'Card in list',
        position: 1,
      };

      await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData);

      const response = await request(app.getHttpServer())
        .get(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should fail to get cards without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/cards/list/${listId}`)
        .expect(401);
    });
  });

  describe('/cards/:id (GET)', () => {
    it('should get a specific card by id', async () => {
      // Create a test card first
      const cardData = {
        title: 'Specific Card',
        description: 'Specific card description',
        position: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData);

      const cardId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/cards/${cardId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body.id).toBe(cardId);
      expect(response.body.title).toBe(cardData.title);
      expect(response.body.description).toBe(cardData.description);
    });

    it('should fail to get card without authentication', async () => {
      await request(app.getHttpServer()).get('/cards/some-id').expect(401);
    });
  });

  describe('/cards/:id (PATCH)', () => {
    it('should update a card with valid data', async () => {
      // Create a test card first
      const cardData = {
        title: 'Original Card',
        description: 'Original description',
        position: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData);

      const cardId = createResponse.body.id;

      const updateData = {
        title: 'Updated Card',
        description: 'Updated description',
        cover_color: '#00ff00',
      };

      const response = await request(app.getHttpServer())
        .patch(`/cards/${cardId}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.cover_color).toBe(updateData.cover_color);
    });

    it('should fail to update card without authentication', async () => {
      const updateData = {
        title: 'Updated Card',
      };

      await request(app.getHttpServer())
        .patch('/cards/some-id')
        .send(updateData)
        .expect(401);
    });
  });

  describe('/cards/:id (DELETE)', () => {
    it('should delete a card', async () => {
      // Create a test card first
      const cardData = {
        title: 'Card to Delete',
        description: 'This card will be deleted',
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/cards/list/${listId}`)
        .set('Cookie', authCookies)
        .send(cardData);

      const cardId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/cards/${cardId}`)
        .set('Cookie', authCookies)
        .expect(200);

      // Verify the card is deleted by trying to get it (expect 404 or 500 depending on implementation)
      const verifyResponse = await request(app.getHttpServer())
        .get(`/cards/${cardId}`)
        .set('Cookie', authCookies)
        .expect(500);
    });

    it('should fail to delete card without authentication', async () => {
      await request(app.getHttpServer()).delete('/cards/some-id').expect(401);
    });
  });
});
