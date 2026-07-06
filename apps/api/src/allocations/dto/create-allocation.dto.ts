import { PaymentStatus, ScholarshipType } from '@scholarship/shared';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  applicationId!: string;

  @IsEnum(ScholarshipType)
  type!: ScholarshipType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  academicYear!: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @IsOptional()
  @IsString()
  notes?: string;
}
