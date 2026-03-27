const { PrismaClient } = require('@prisma/client');

async function checkLeads() {
  const prisma = new PrismaClient();
  
  try {
    const leadCount = await prisma.lead.count();
    console.log(`Total leads in database: ${leadCount}`);
    
    if (leadCount > 0) {
      const leads = await prisma.lead.findMany({
        take: 5,
        include: {
          organization: true,
          property: true,
        },
      });
      
      console.log('Sample leads:');
      leads.forEach(lead => {
        console.log(`- ${lead.firstName} ${lead.lastName} (${lead.status})`);
      });
    }
  } catch (error) {
    console.error('Error checking leads:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeads();