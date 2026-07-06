import { Module } from '@nestjs/common';
import { ApplicationOwnerGuard } from './application-owner.guard';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationOwnerGuard],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
