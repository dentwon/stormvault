import { PrismaClient } from '@prisma/client';

async function checkUserRole() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();