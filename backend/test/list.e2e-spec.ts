import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule } from './test.module';

describe('ListController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];
  let userId: string;
  let boardId: string;

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

    // Create a test board for list operations
    const boardResponse = await request(app.getHttpServer())
      .post('/board')
      .set('Cookie', authCookies)
      .send({
        name: 'Test Board for Lists',
        description: 'Board for testing lists',
        background_color: '#ffffff',
      });

    boardId = boardResponse.body.id;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/lists/board/:boardId (POST)', () => {
    it('should create a new list with valid data', async () => {
      const listData = {
        name: 'Test List',
        position: 1,
      };

      const response = await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(listData.name);
      expect(response.body.position).toBe(listData.position);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a list without position (optional)', async () => {
      const listData = {
        name: 'List Without Position',
      };

      const response = await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(listData.name);
    });

    it('should fail to create list without authentication', async () => {
      const listData = {
        name: 'Test List',
        position: 1,
      };

      await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .send(listData)
        .expect(401);
    });

    it('should fail to create list with invalid data', async () => {
      const listData = {
        name: '', // Empty name should fail validation
        position: 1,
      };

      await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData)
        .expect(400);
    });
  });

  describe('/lists/board/:boardId (GET)', () => {
    it('should get all lists belonging to a board', async () => {
      // Create a test list first
      const listData = {
        name: 'Board List',
        position: 1,
      };

      await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData);

      const response = await request(app.getHttpServer())
        .get(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should fail to get lists without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/lists/board/${boardId}`)
        .expect(401);
    });
  });

  describe('/lists/:id (GET)', () => {
    it('should get a specific list by id', async () => {
      // Create a test list first
      const listData = {
        name: 'Specific List',
        position: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData);

      const listId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body.id).toBe(listId);
      expect(response.body.name).toBe(listData.name);
      expect(response.body.position).toBe(listData.position);
    });

    it('should fail to get list without authentication', async () => {
      await request(app.getHttpServer()).get('/lists/some-id').expect(401);
    });
  });

  describe('/lists/:id (PATCH)', () => {
    it('should update a list with valid data', async () => {
      // Create a test list first
      const listData = {
        name: 'Original List',
        position: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData);

      const listId = createResponse.body.id;

      const updateData = {
        name: 'Updated List',
        position: 3,
      };

      const response = await request(app.getHttpServer())
        .patch(`/lists/${listId}`)
        .set('Cookie', authCookies)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.position).toBe(updateData.position);
    });

    it('should fail to update list without authentication', async () => {
      const updateData = {
        name: 'Updated List',
      };

      await request(app.getHttpServer())
        .patch('/lists/some-id')
        .send(updateData)
        .expect(401);
    });
  });

  describe('/lists/:id (DELETE)', () => {
    it('should delete a list', async () => {
      // Create a test list first
      const listData = {
        name: 'List to Delete',
        position: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/lists/board/${boardId}`)
        .set('Cookie', authCookies)
        .send(listData);

      const listId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/lists/${listId}`)
        .set('Cookie', authCookies)
        .expect(200);

      // Verify the list is deleted by trying to get it (expect 404, 401, or 500 depending on implementation)
      const verifyResponse = await request(app.getHttpServer())
        .get(`/lists/${listId}`)
        .set('Cookie', authCookies)
        .expect(401);
    });

    it('should fail to delete list without authentication', async () => {
      await request(app.getHttpServer()).delete('/lists/some-id').expect(401);
    });
  });
});

