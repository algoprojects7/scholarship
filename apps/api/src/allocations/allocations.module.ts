import { Module } from '@nestjs/common';
import { AdminDashboardModule } from '../admin-dashboard/admin-dashboard.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AllocationsController } from './allocations.controller';
import { AllocationsService } from './allocations.service';

@Module({
  imports: [AuthModule, AdminDashboardModule, AuditModule],
  controllers: [AllocationsController],
  providers: [AllocationsService],
})
export class AllocationsModule {}
