import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin/admins')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Permissions(Permission.MANAGE_OPERATORS)
  list() {
    return this.adminsService.list();
  }

  @Post()
  @Permissions(Permission.MANAGE_OPERATORS)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAdminDto,
  ) {
    const superAdminId = await getAdminId(this.prisma, user.id);
    return this.adminsService.create(superAdminId, dto);
  }

  @Get(':id')
  @Permissions(Permission.MANAGE_OPERATORS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.MANAGE_OPERATORS)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAdminDto,
  ) {
    const requestingAdminId = await getAdminId(this.prisma, user.id);
    return this.adminsService.update(id, dto, requestingAdminId);
  }
}
