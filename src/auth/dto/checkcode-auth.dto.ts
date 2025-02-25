import { IsNotEmpty, IsOptional } from 'class-validator';

export class CodeAuthDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;
  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;
}
