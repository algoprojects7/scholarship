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

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

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
    createReadStream(result.filePath).pipe(res);
  }
}
