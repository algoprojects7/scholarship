import {

  Controller,

  Get,

  Post,

  Res,

  UploadedFile,

  UseGuards,

  UseInterceptors,

} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { UserRole } from '@scholarship/shared';

import type { Response } from 'express';

import { createReadStream } from 'fs';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { Roles } from '../auth/decorators/roles.decorator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { AuthUser } from '../auth/interfaces/auth-user.interface';

import { StudentsService } from './students.service';



@Controller('student')

@UseGuards(JwtAuthGuard, RolesGuard)

@Roles(UserRole.STUDENT)

export class StudentsController {

  constructor(private readonly studentsService: StudentsService) {}



  @Get('dashboard')

  getDashboard(@CurrentUser() user: AuthUser) {

    return this.studentsService.getDashboard(user.id);

  }



  @Get('scholarship')

  getScholarship(@CurrentUser() user: AuthUser) {

    return this.studentsService.getScholarship(user.id);

  }



  @Get('profile')

  getProfile(@CurrentUser() user: AuthUser) {

    return this.studentsService.getProfile(user.id);

  }



  @Post('profile/avatar')

  @UseInterceptors(FileInterceptor('file'))

  uploadAvatar(

    @CurrentUser() user: AuthUser,

    @UploadedFile() file: Express.Multer.File,

  ) {

    return this.studentsService.uploadAvatar(user.id, file);

  }



  @Get('profile/avatar')

  async getAvatar(@CurrentUser() user: AuthUser, @Res() res: Response) {

    const result = await this.studentsService.getAvatar(user.id);



    if (result.mode === 'redirect') {

      return res.redirect(result.url);

    }



    res.setHeader('Content-Type', result.mimeType);

    res.setHeader('Cache-Control', 'private, max-age=300');

    createReadStream(result.filePath).pipe(res);

  }

}


