import { PaymentStatus } from '@scholarship/shared';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;
}
