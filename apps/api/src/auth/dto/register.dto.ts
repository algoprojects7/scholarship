import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '@scholarship/shared';
import { Match } from './match.decorator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name may only contain letters and spaces',
  })
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\+91$/, { message: 'Country code must be +91' })
  countryCode!: string;

  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile must be 10 digits starting with 6–9',
  })
  mobile!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password!: string;

  @IsString()
  @Match('password', { message: 'Passwords must match' })
  confirmPassword!: string;
}
