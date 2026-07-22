import { PaymentType } from '@scholarship/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class FeePaymentDto {
  @IsInt()
  @Min(2022)
  @Max(2026)
  year!: number;

  @IsNumber()
  @Min(0)
  amountPaid!: number;
}

export class FeeDetailsDto {
  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsObject()
  personalDetails?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  educationalDetails?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  contactAddress?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  bankDetails?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeeDetailsDto)
  feeDetails?: FeeDetailsDto;

  @IsOptional()
  @IsObject()
  familyDetails?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePaymentDto)
  feePayments?: FeePaymentDto[];
}
