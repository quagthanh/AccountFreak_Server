import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CodeAuthDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;
  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;
}

export class RetryCodeDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail()
  email: string;
}

export class RetryPasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;
}
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
  @IsNotEmpty({ message: 'Re-Password không được để trống' })
  confirmPassword: string;
}
