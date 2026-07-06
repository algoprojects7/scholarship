import { DocumentType } from '@scholarship/shared';
import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';
import { MAX_DOCUMENT_SIZE_BYTES } from '../../common/constants/application.constants';

export class ConfirmDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  @MaxLength(500)
  key!: string;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_DOCUMENT_SIZE_BYTES)
  fileSize!: number;

  @IsString()
  mimeType!: string;
}
