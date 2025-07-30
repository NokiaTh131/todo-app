import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface ValidatedUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    const user = await this.userService.findByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      return {
        id: user.id,
        email: user.email,
      };
    }
    return null;
  }

  async login(user: ValidatedUser) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
