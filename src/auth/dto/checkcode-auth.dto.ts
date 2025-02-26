import { IsNotEmpty, IsOptional } from 'class-validator';

export class CodeAuthDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;
  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;
}

export class RetryCodeDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
}
