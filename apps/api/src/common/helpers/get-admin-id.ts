import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function getAdminId(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!admin) {
    throw new NotFoundException('Admin profile not found');
  }

  return admin.id;
}
