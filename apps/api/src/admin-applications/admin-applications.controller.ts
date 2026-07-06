import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { AdminApplicationsService } from './admin-applications.service';
import { ApplicationDecisionDto } from './dto/decision.dto';
import { AdminApplicationsQueryDto } from './dto/query.dto';

@ApiTags('admin-applications')
@ApiBearerAuth()
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AdminApplicationsController {
  constructor(
    private readonly adminApplicationsService: AdminApplicationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Permissions(Permission.VIEW_APPLICATION_QUEUE)
  list(@Query() query: AdminApplicationsQueryDto) {
    return this.adminApplicationsService.list(query);
  }

  @Get(':id')
  @Permissions(Permission.VIEW_APPLICATION_QUEUE)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminApplicationsService.findOne(id);
  }

  @Patch(':id/review')
  @Permissions(Permission.VIEW_APPLICATION_QUEUE)
  async startReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.adminApplicationsService.startReview(id, adminId);
  }

  @Post(':id/decision')
  @Permissions(Permission.APPROVE_REJECT_APPLICATIONS)
  async decide(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ApplicationDecisionDto,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.adminApplicationsService.decide(id, adminId, dto);
  }
}
