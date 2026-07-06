import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getStudentProfileId } from '../common/helpers/get-student-profile-id';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class ApplicationOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params: { id?: string; applicationId?: string };
    }>();

    const user = request.user;
    if (!user) {
      throw new NotFoundException('Application not found');
    }

    const applicationId = request.params.id ?? request.params.applicationId;
    if (!applicationId) {
      throw new NotFoundException('Application not found');
    }

    const studentProfileId = await getStudentProfileId(this.prisma, user.id);
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: studentProfileId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return true;
  }
}
