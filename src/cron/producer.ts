import sendToQueue, { QUEUES } from "@src/queue/sender";
import { PrismaClient } from "@prisma/client";

async function startProducer() {
  try {
    const prisma = new PrismaClient();
    const times = await prisma.times.findMany()
    await prisma.$disconnect();

    const formattedTimes = [];
    times.forEach((time) => {
      ['inbound', 'outbound'].forEach((mode) => {
        formattedTimes.push({
          stations: time[mode].stations,
          departure: {
            day: time[mode].date.getDate(),
            month: time[mode].date.getMonth() + 1,
          },
        });
        

        // Search for the next saturday as well
        const saturdayDayWeek = 6;
        const d = new Date();
        const nextSaturday = (d.getDate() + (((saturdayDayWeek + 7 - d.getDay()) % 7) || 7));
        formattedTimes.push({
          stations: time[mode].stations,
          departure: {
            day: nextSaturday,
            month: d.getMonth() + 1,
          }
        })
      })
    });

    for await (const payload of formattedTimes) {
      await sendToQueue(QUEUES.QUEUE_GET_ROUTE_PRICE, payload);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  } catch (error) {
    console.error(error);
    //Retry after 3 second
    setTimeout(() => {
      startProducer();
    }, 3000);
  }
}

startProducer();
