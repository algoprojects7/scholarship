import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Permission, UserRole } from '@scholarship/shared';
import { getAdminId } from '../common/helpers/get-admin-id';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AdminDocumentsService } from './admin-documents.service';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Controller('admin/documents')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AdminDocumentsController {
  constructor(
    private readonly adminDocumentsService: AdminDocumentsService,
    private readonly prisma: PrismaService,
  ) {}

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
