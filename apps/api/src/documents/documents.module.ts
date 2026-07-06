import { Module } from '@nestjs/common';
import { ApplicationOwnerGuard } from '../applications/application-owner.guard';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, ApplicationOwnerGuard],
})
export class DocumentsModule {}
