import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule } from './test.module';

describe('AuthController (e2e)', () => {
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

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const id = Math.random().toString(36).substring(7);
      const email = `test${id}@example.com`;
      
      // First create a user
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: `user${id}`,
          email: email,
          password: 'password123',
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: email,
          password: 'password123',
        })
        .expect(201);

      expect(response.body.message).toBe('Login successful');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully when authenticated', async () => {
      const id = Math.random().toString(36).substring(7);
      const email = `test${id}@example.com`;
      
      // First create and login user
      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          username: `user${id}`,
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
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(201);

      expect(response.body.message).toBe('Logout successful');
    });

    it('should fail logout when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });
});