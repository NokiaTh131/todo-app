import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

const mockAuthService = {
  login: jest.fn().mockResolvedValue('mock-jwt-token'),
};

const mockLocalAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const req = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
        },
      };
      const res = {
        cookie: jest.fn(),
      };

      const result = await controller.login(req, res);

      expect(service.login).toHaveBeenCalledWith(req.user);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        { httpOnly: true },
      );
      expect(result).toEqual({ message: 'Login successful' });
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookie', async () => {
      const res = {
        clearCookie: jest.fn(),
      };

      const result = await controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});
