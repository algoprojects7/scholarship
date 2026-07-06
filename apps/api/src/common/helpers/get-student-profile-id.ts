import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function getStudentProfileId(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new NotFoundException('Student profile not found');
  }

  return profile.id;
}
