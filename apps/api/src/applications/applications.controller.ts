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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@scholarship/shared';
import { getStudentProfileId } from '../common/helpers/get-student-profile-id';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationOwnerGuard } from './application-owner.guard';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthUser) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.createDraft(studentId);
  }

  @Get('mine')
  async findMine(@CurrentUser() user: AuthUser) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.findMine(studentId);
  }

  @Get(':id')
  @UseGuards(ApplicationOwnerGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.findOne(id, studentId);
  }

  @Patch(':id')
  @UseGuards(ApplicationOwnerGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateApplicationDto,
  ) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.update(id, studentId, dto);
  }

  @Post(':id/submit')
  @UseGuards(ApplicationOwnerGuard)
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.submit(id, studentId);
  }

  @Get(':id/remarks')
  @UseGuards(ApplicationOwnerGuard)
  async findRemarks(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const studentId = await getStudentProfileId(this.prisma, user.id);
    return this.applicationsService.findRemarks(id, studentId);
  }
}
