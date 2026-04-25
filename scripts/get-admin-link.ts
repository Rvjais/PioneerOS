
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      role: 'SUPER_ADMIN'
    }
  });

  if (!admin) {
    console.log('Super Admin not found in database.');
    return;
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.magicLinkToken.create({
    data: {
      token: tokenHash,
      userId: admin.id,
      channel: 'MANUAL',
      expiresAt,
    },
  });

  console.log(`\nMagic Link for Super Admin (${admin.firstName} ${admin.lastName || ''}):`);
  console.log(`https://brandingpioneers.in/auth/magic?token=${token}\n`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
