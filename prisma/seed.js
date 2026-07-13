/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@inotech.com';
  
  // Hash the default password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Inotech Admin',
        email: adminEmail,
        passwordHash: passwordHash,
        role: 'admin',
        applicationStatus: 'approved'
      }
    });
    console.log('Seeded default admin account: admin@inotech.com / admin123');
  } else {
    console.log('Admin account already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
