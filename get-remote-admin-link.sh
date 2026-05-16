#!/bin/bash
VPS_HOST="root@srv1396855.hstgr.cloud"
DEPLOY_DIR="/home/brandingpioneers.in/public_html"

echo "Generating magic link on the remote server..."

# Create the Node.js script locally
cat > get-admin-link.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
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
EOF

# Upload and execute
echo "Uploading script..."
scp get-admin-link.js "$VPS_HOST:$DEPLOY_DIR/get-admin-link.js"

echo "Executing script on VPS to generate link..."
ssh "$VPS_HOST" "cd $DEPLOY_DIR && node get-admin-link.js && rm get-admin-link.js"

# Cleanup locally
rm get-admin-link.js
