import { AdminType } from '@scholarship/shared';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name may only contain letters and spaces',
  })
  fullName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  employeeId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+91$/, { message: 'Country code must be +91' })
  countryCode?: string = '+91';

  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone must be 10 digits starting with 6–9',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password!: string;

  @IsOptional()
  @IsEnum(AdminType)
  adminType?: AdminType = AdminType.OPERATOR;
}
