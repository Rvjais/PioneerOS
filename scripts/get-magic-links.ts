
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
  // Get Super Admin
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  // Get Priya (HR)
  const priya = await prisma.user.findFirst({
    where: {
      firstName: { equals: 'Priya' },
      department: 'HR'
    }
  });

  // Get Ranveer Jaiswal
  const ranveer = await prisma.user.findFirst({
    where: {
      firstName: { equals: 'Ranveer' },
      lastName: { equals: 'Jaiswal' }
    }
  });

  console.log('\n===== MAGIC LINKS FOR LOCAL TESTING =====\n');

  if (superAdmin) {
    const token1 = generateToken();
    await prisma.magicLinkToken.create({
      data: {
        token: hashToken(token1),
        userId: superAdmin.id,
        channel: 'MANUAL',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('SUPER ADMIN:');
    console.log(`Name: ${superAdmin.firstName} ${superAdmin.lastName || ''}`);
    console.log(`Link: http://localhost:3000/auth/magic?token=${token1}\n`);
  }

  if (priya) {
    const token2 = generateToken();
    await prisma.magicLinkToken.create({
      data: {
        token: hashToken(token2),
        userId: priya.id,
        channel: 'MANUAL',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('HR (Priya):');
    console.log(`Name: ${priya.firstName} ${priya.lastName || ''}`);
    console.log(`Link: http://localhost:3000/auth/magic?token=${token2}\n`);
  }

  if (ranveer) {
    const token3 = generateToken();
    await prisma.magicLinkToken.create({
      data: {
        token: hashToken(token3),
        userId: ranveer.id,
        channel: 'MANUAL',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('Ranveer:');
    console.log(`Name: ${ranveer.firstName} ${ranveer.lastName || ''}`);
    console.log(`Role: ${ranveer.role}, Dept: ${ranveer.department}`);
    console.log(`Link: http://localhost:3000/auth/magic?token=${token3}\n`);
  } else {
    console.log('Ranveer Jaiswal not found in database.\n');
  }

  console.log('==========================================\n');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
