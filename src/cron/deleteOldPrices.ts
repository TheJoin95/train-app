import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteOldPrices(): Promise<void> {
  try {
    await prisma.prices.deleteMany({ where: { departureTime: { lt: new Date() } }});
    console.log('Delete complete');
  } catch (e) {
    console.error(e);
  }
}

deleteOldPrices().then(async () => await prisma.$disconnect());
