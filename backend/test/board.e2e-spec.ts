import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule } from './test.module';

describe('BoardController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];
  let userId: string;

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/board (POST)', () => {
    it('should create a new board with valid data', async () => {
      const boardData = {
        name: 'Test Board',
        description: 'Test board description',
        background_color: '#ffffff',
      };

      const response = await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(boardData.name);
      expect(response.body.description).toBe(boardData.description);
      expect(response.body.background_color).toBe(boardData.background_color);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('should fail to create board without authentication', async () => {
      const boardData = {
        name: 'Test Board',
        description: 'Test board description',
        background_color: '#ffffff',
      };

      await request(app.getHttpServer())
        .post('/board')
        .send(boardData)
        .expect(401);
    });

    it('should fail to create board with invalid data', async () => {
      const boardData = {
        name: '', // Empty name should fail validation
        description: 'Test board description',
        background_color: '#ffffff',
      };

      await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData)
        .expect(400);
    });
  });

  describe('/board (GET)', () => {
    it('should get all boards belonging to user', async () => {
      // Create a test board first
      const boardData = {
        name: 'User Board',
        description: 'User board description',
        background_color: '#f0f0f0',
      };

      await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData);

      const response = await request(app.getHttpServer())
        .get('/board')
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should fail to get boards without authentication', async () => {
      await request(app.getHttpServer()).get('/board').expect(401);
    });
  });

  describe('/board/:id (GET)', () => {
    it('should get a specific board by id', async () => {
      // Create a test board first
      const boardData = {
        name: 'Specific Board',
        description: 'Specific board description',
        background_color: '#e0e0e0',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData);

      const boardId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/board/${boardId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body.id).toBe(boardId);
      expect(response.body.name).toBe(boardData.name);
      expect(response.body.description).toBe(boardData.description);
    });

    it('should fail to get board without authentication', async () => {
      await request(app.getHttpServer()).get('/board/some-id').expect(401);
    });
  });

  describe('/board/:id (PUT)', () => {
    it('should update a board with valid data', async () => {
      // Create a test board first
      const boardData = {
        name: 'Original Board',
        description: 'Original description',
        background_color: '#ffffff',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData);

      const boardId = createResponse.body.id;

      const updateData = {
        name: 'Updated Board',
        description: 'Updated description',
        background_color: '#000000',
      };

      const response = await request(app.getHttpServer())
        .put(`/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.background_color).toBe(updateData.background_color);
    });

    it('should fail to update board without authentication', async () => {
      const updateData = {
        name: 'Updated Board',
      };

      await request(app.getHttpServer())
        .put('/board/some-id')
        .send(updateData)
        .expect(401);
    });
  });

  describe('/board/:id (DELETE)', () => {
    it('should delete a board', async () => {
      // Create a test board first
      const boardData = {
        name: 'Board to Delete',
        description: 'This board will be deleted',
        background_color: '#ff0000',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/board')
        .set('Cookie', authCookies)
        .send(boardData);

      const boardId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/board/${boardId}`)
        .set('Cookie', authCookies)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/board/${boardId}`)
        .set('Cookie', authCookies)
        .expect(500);
    });

    it('should fail to delete board without authentication', async () => {
      await request(app.getHttpServer()).delete('/board/some-id').expect(401);
    });
  });
});
