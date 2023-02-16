import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone()
  phone: string;
}

export class LoginSuperUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  password: string;
}
