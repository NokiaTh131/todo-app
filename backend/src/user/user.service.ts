import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseService } from '../common/base.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super();
  }

  async create(userData: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      // Remove password from response
      const { password, ...userWithoutPassword } = savedUser;
      return userWithoutPassword as User;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    return this.handleDatabaseOperation(
      async () => {
        const user = await this.userRepository.findOne({ where: { id } });
        return this.handleEntityNotFound(user, 'User', id);
      },
      'Failed to find user',
    );
  }

  async findByEmail(email: string): Promise<User> {
    return this.handleDatabaseOperation(
      async () => {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          throw new InternalServerErrorException(
            `User with email ${email} not found`,
          );
        }
        return user;
      },
      'Failed to find user',
    );
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.userRepository.update(id, userData);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`User with ID ${id} not found`);
        }
        return await this.findOne(id);
      },
      'Failed to update user',
    );
  }

  async remove(id: string): Promise<void> {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
          throw new InternalServerErrorException(`User with ID ${id} not found`);
        }
      },
      'Failed to remove user',
    );
  }
}
