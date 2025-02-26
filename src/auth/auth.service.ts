import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { register } from 'node:module';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from './dto/checkcode-auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      return null;
    }
    const isValidPassword = await comparePassword(pass, user.password);

    if (!isValidPassword) {
      return null;
    }
    return user;
  }
  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };
  checkCode = async (codeDto: CodeAuthDto) => {
    return await this.usersService.handleActive(codeDto);
  };
  retryActive = async (retryCodeDto: RetryCodeDto) => {
    return await this.usersService.retryActive(retryCodeDto);
  };
  retryPassword = async (retryPasswordDto: RetryPasswordDto) => {
    return await this.usersService.retryPassword(retryPasswordDto);
  };
  changePassword = async (changePasswordDto: ChangePasswordDto) => {
    return await this.usersService.changePassword(changePasswordDto);
  };
}
