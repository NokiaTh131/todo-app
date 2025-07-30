import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedPassword',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await service.validateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'notfound@example.com';
      const password = 'password123';

      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const result = await service.validateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return JWT token', async () => {
      const user = {
        id: mockUser.id,
        email: mockUser.email,
      };

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual('mock-jwt-token');
    });
  });
});
