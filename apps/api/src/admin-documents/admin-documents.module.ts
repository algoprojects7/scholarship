import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AdminDocumentsController } from './admin-documents.controller';
import { AdminDocumentsService } from './admin-documents.service';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [AdminDocumentsController],
  providers: [AdminDocumentsService],
})
export class AdminDocumentsModule {}
