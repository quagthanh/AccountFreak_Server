import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { hashPassword } from '@/helpers/utils';
import aqp from 'api-query-params';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    //hash password
    const { name, email, password, phone, address, image } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashPasswordForRegister = await hashPassword(password);
    const user = this.userModel.create({
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
}
import { create } from 'node:domain';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { filter } from 'rxjs';
import { response } from 'express';
