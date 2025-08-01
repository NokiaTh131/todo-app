import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule } from './test.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/user/register (POST)', () => {
    it('should register a new user with valid data', async () => {
      const id = Math.random().toString(36).substring(7);
      const email = `user${id}@example.com`;
      const username = `user${id}`;
      
      const response = await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: username,
          email: email,
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(email);
      expect(response.body.username).toBe(username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to register with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail to register with short password', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should fail to register with short username', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail to register with duplicate email', async () => {
      const id = Math.random().toString(36).substring(7);
      const email = `dup${id}@example.com`;
      
      const userData = {
        username: `user${id}`,
        email: email,
        password: 'password123',
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/user/register')
        .send(userData)
        .expect(201);

      // Second registration with same email should fail
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          ...userData,
          username: `diff${id}`,
        })
        .expect(409);
    });
  });

  describe('/user/profile (GET)', () => {
    it('should get user profile when authenticated', async () => {
      const id = Math.random().toString(36).substring(7);
      const email = `prof${id}@example.com`;
      const username = `prof${id}`;
      
      // Create and login user
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: username,
          email: email,
          password: 'password123',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: email,
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const response = await request(app.getHttpServer())
        .get('/user/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(email);
      expect(response.body.username).toBe(username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to get profile when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/user/profile')
        .expect(401);
    });
  });
});