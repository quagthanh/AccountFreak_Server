import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  phone: string;

  address: string;

  image: string;
}
