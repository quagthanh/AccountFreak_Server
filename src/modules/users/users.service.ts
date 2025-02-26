import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { hashPassword } from '@/helpers/utils';
import aqp from 'api-query-params';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    //hash password
    const { name, email, password, phone, address, image } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashPasswordForRegister = await hashPassword(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPasswordForRegister,
      phone,
      address,
      image,
    });
    return user;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select('-password')
      .sort(sort as any);
    return { result, totalPages };
  }

  async findOne(_id: string) {
    return this.userModel.findOne({ _id });
  }
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async update(updateUserDto: UpdateUserDto) {
    const { _id, ...remain } = updateUserDto;
    const result = await this.userModel.updateOne({ _id }, { ...remain });
    return { result, ...remain };
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Lỗi xảy ra ');
    }
  }
  async handleRegister(registerDto: CreateAuthDto) {
    //check email
    const { name, email, password } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException('Email đã tồn tại');
    }
    //hash password
    const hashPasswordForRegister = await hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPasswordForRegister,
      codeId: codeId,
      codeExpired: dayjs().add(3, 'minutes'),
    });
    //send email
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account',
      template: './register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id };
  }
  async handleActive(codeDto: CodeAuthDto) {
    const { _id, code } = codeDto;
    const data = await this.userModel.findOne({ _id: _id, codeId: code });
    if (!data) {
      throw new BadRequestException({
        message: 'Mã code không hợp lệ hoặc đã hết hạn ',
      });
    }
    //check code's expired
    const isBeforeCheck = dayjs().isBefore(data.codeExpired);
    if (isBeforeCheck) {
      await this.userModel.updateOne({ _id: data._id }, { isActive: true });
    } else {
      throw new BadRequestException({
        message: 'Mã code không hợp lệ hoặc đã hết hạn ',
      });
    }
    return { isBeforeCheck };
  }
  async retryActive(retryCodeDto: RetryCodeDto) {
    const { email } = retryCodeDto;
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      if (user.isActive) {
        throw new BadRequestException('Tài khoản đã được kích hoạt');
      }
      const codeId = uuidv4();
      if (!codeId) {
        throw new BadRequestException('Tạo code kích hoạt lại thất bại');
      }
      await this.userModel.updateOne(
        { _id: user._id },
        { codeId: codeId, codeExpired: dayjs().add(3, 'minutes') },
      );
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reactive your account',
        template: './register',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      });
      return { _id: user._id };
    } catch {
      throw new BadRequestException('Tài khoản không tồn tại/hợp lệ');
    }
  }
  async retryPassword(retryPasswordDto: RetryPasswordDto) {
    const { email } = retryPasswordDto;
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      if (user.isActive === false) {
        throw new BadRequestException('Tài khoản chưa được kích hoạt');
      }
      const codeId = uuidv4();
      if (!codeId) {
        throw new BadRequestException('Tạo code kích hoạt lại thất bại');
      }
      await this.userModel.updateOne(
        { _id: user._id },
        { codeId: codeId, codeExpired: dayjs().add(3, 'minutes') },
      );
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Change your password',
        template: './register',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      });
      return { _id: user._id, email: email };
    } catch {
      throw new BadRequestException('Tài khoản không tồn tại/hợp lệ');
    }
  }
  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { email, code, password, confirmPassword } = changePasswordDto;
    try {
      if (password !== confirmPassword) {
        throw new BadRequestException(
          'Password và Re-Password không chính xác',
        );
      }
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      //check code's expired
      const isBeforeCheck = dayjs().isBefore(user.codeExpired);
      if (isBeforeCheck) {
        const newPassword = await hashPassword(user.password);
        await user.updateOne({ password: newPassword });
        return { isBeforeCheck };
      } else {
        throw new BadRequestException({
          message: 'Mã code không hợp lệ hoặc đã hết hạn ',
        });
      }
    } catch {
      throw new BadRequestException('Internal server error');
    }
  }
}
import { create } from 'node:domain';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { filter } from 'rxjs';
import e, { response } from 'express';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from '@/auth/dto/checkcode-auth.dto';
