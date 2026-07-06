import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Permission, UserRole } from '@scholarship/shared';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { getAdminId } from '../common/helpers/get-admin-id';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminDocumentsService } from './admin-documents.service';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Controller('admin/documents')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AdminDocumentsController {
  constructor(
    private readonly adminDocumentsService: AdminDocumentsService,
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':id/preview')
  @Permissions(Permission.VIEW_APPLICATION_QUEUE)
  async preview(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const result = await this.documentsService.getAdminPreviewUrl(id);

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

  @Patch(':id/verify')
  @Permissions(Permission.VERIFY_DOCUMENTS)
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: VerifyDocumentDto,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.adminDocumentsService.verify(id, adminId, dto);
  }
}
