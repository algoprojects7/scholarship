import { IsEnum, IsString, MinLength, ValidateIf } from 'class-validator';

export enum ApplicationDecision {
  APPROVE = 'APPROVED',
  REJECT = 'REJECTED',
}

export class ApplicationDecisionDto {
  @IsEnum(ApplicationDecision)
  decision!: ApplicationDecision;

  @ValidateIf((dto: ApplicationDecisionDto) => dto.decision === ApplicationDecision.REJECT)
  @IsString()
  @MinLength(10)
  remark!: string;
}
