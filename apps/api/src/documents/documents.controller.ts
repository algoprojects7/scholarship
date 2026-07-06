import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentType, UserRole } from '@scholarship/shared';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { ApplicationOwnerGuard } from '../applications/application-owner.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { DocumentsService } from './documents.service';
import { ConfirmDocumentDto } from './dto/confirm-document.dto';
import { PresignDocumentDto } from './dto/presign-document.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('applications/:applicationId/documents/presign')
  @UseGuards(ApplicationOwnerGuard)
  presignUpload(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: PresignDocumentDto,
  ) {
    return this.documentsService.createPresignedUpload(
      applicationId,
      user.id,
      body.documentType,
      body.fileName,
      body.contentType,
      body.fileSize,
    );
  }

  @Post('applications/:applicationId/documents/confirm')
  @UseGuards(ApplicationOwnerGuard)
  confirmUpload(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: ConfirmDocumentDto,
  ) {
    return this.documentsService.confirmUpload(
      applicationId,
      user.id,
      body.documentType,
      body.key,
      body.fileName,
      body.fileSize,
      body.mimeType,
    );
  }

  @Post('applications/:applicationId/documents')
  @UseGuards(ApplicationOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType', new ParseEnumPipe(DocumentType))
    documentType: DocumentType,
  ) {
    return this.documentsService.upload(
      applicationId,
      user.id,
      documentType,
      file,
    );
  }

  @Delete('documents/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.documentsService.remove(id, user.id);
  }

  @Get('documents/:id/preview')
  async preview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const result = await this.documentsService.getPreviewUrl(id, user.id);

    if (result.mode === 'redirect') {
      return res.redirect(result.url);
    }

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${result.fileName}"`,
    );

    const filePath = result.filePath;
    const { existsSync } = await import('fs');
    if (!existsSync(filePath)) {
      throw new NotFoundException('Local document file is not found. It may have expired or is unavailable on this server.');
    }

    const stream = createReadStream(filePath);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).send('Error reading or streaming document');
      }
    });
    stream.pipe(res);
  }
}
