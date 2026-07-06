import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Permissions(Permission.VIEW_FULL_AUDIT_LOGS)
  listAll(@Query() query: AuditQueryDto) {
    return this.auditService.listAll(query);
  }

  @Get('mine')
  @Permissions(Permission.VIEW_OWN_AUDIT_TRAIL)
  async listMine(
    @CurrentUser() user: AuthUser,
    @Query() query: AuditQueryDto,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.auditService.listMine(adminId, query);
  }
}
