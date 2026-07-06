import { Module } from '@nestjs/common';
import { AdminDashboardModule } from '../admin-dashboard/admin-dashboard.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AdminApplicationsController } from './admin-applications.controller';
import { AdminApplicationsService } from './admin-applications.service';

@Module({
  imports: [AuthModule, AdminDashboardModule, AuditModule],
  controllers: [AdminApplicationsController],
  providers: [AdminApplicationsService],
})
export class AdminApplicationsModule {}
