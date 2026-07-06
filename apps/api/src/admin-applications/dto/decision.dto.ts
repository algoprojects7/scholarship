import { IsEnum, IsString, MinLength, ValidateIf } from 'class-validator';

export enum ApplicationDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ApplicationDecisionDto {
  @IsEnum(ApplicationDecision)
  decision!: ApplicationDecision;

  @ValidateIf((dto: ApplicationDecisionDto) => dto.decision === ApplicationDecision.REJECT)
  @IsString()
  @MinLength(10)
  remark!: string;
}
