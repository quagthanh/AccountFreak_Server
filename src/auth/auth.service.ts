import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/helpers/utils';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    const isValidPassword = await comparePassword(pass, user.password);

    if (!isValidPassword || !user) {
      return null;
    }
    return user;
  }
  async login(user: any) {
    const payload = { username123: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
