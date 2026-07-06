import { AdminType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email =
    process.env.SEED_SUPER_ADMIN_EMAIL ?? 'super@scholarship.local';
  const password =
    process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'SuperAdmin@123';
  const passwordHash = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    console.log(`Super Admin already exists (${email}), skipping seed.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      admin: {
        create: {
          adminType: AdminType.SUPER,
          fullName: 'Super Admin',
          employeeId: 'EMP-000',
          department: 'Administration',
          countryCode: '+91',
          isActive: true,
        },
      },
    },
  });

  console.log(`Super Admin seeded: ${email} (EMP-000)`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
