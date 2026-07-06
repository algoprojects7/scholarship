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
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { AllocationsQueryDto } from './dto/query.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('allocations')
@ApiBearerAuth()
@Controller('admin/allocations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN)
export class AllocationsController {
  constructor(
    private readonly allocationsService: AllocationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions(Permission.ALLOCATE_SCHOLARSHIP)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAllocationDto,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.allocationsService.create(adminId, dto);
  }

  @Get()
  list(@Query() query: AllocationsQueryDto) {
    return this.allocationsService.list(query);
  }

  @Get('application/:applicationId')
  findByApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    return this.allocationsService.findByApplication(applicationId);
  }

  @Patch(':id/payment')
  async updatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePaymentDto,
  ) {
    const adminId = await getAdminId(this.prisma, user.id);
    return this.allocationsService.updatePayment(id, adminId, dto);
  }
}
