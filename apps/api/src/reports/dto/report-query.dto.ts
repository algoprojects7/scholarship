import { ApplicationStatus } from '@scholarship/shared';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReportType {
  APPLICATIONS = 'applications',
  ALLOCATIONS = 'allocations',
  DISTRICT = 'district',
  STATUS = 'status',
}

export enum ReportFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
}

export class ReportQueryDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}
