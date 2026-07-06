import { DocumentType } from '@scholarship/shared';
import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';
import { ALLOWED_DOCUMENT_MIMES, MAX_DOCUMENT_SIZE_BYTES } from '../../common/constants/application.constants';

export class PresignDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_DOCUMENT_SIZE_BYTES)
  fileSize!: number;
}

export function isAllowedDocumentMime(
  mimeType: string,
): mimeType is (typeof ALLOWED_DOCUMENT_MIMES)[number] {
  return (ALLOWED_DOCUMENT_MIMES as readonly string[]).includes(mimeType);
}
