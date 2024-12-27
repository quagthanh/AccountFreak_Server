import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'User name không được để trống' })
  username: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}
