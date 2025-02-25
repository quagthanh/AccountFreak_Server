import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { CodeAuthDto } from './dto/checkcode-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
  @Public()
  @Post('register')
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }
  @Public()
  @Post('check-code')
  checkCode(@Body() codeDto: CodeAuthDto) {
    return this.authService.checkCode(codeDto);
  }
  @Public()
  @Get('mail')
  testMail() {
    this.mailerService.sendMail({
      to: 'test.quangthanh@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      template: './register',
      context: {
        name: 'QthanhQthanh',
        activationCode: 123131231,
      },
    });
    return 'okkk';
  }
}
