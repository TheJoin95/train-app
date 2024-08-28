import { AMQPClient } from '@cloudamqp/amqp-client'
import { JourneyPayload } from '@src/types';
import { QUEUES } from './sender';
import { PrismaClient } from "@prisma/client";
import type { TravelData } from '@src/omio/extractor';

const lavinmqUrl = process.env.CLOUDAMQP_URL || '';
const prisma = new PrismaClient();

async function startConsumer() {
  //Setup a connection to the LavinMQ server
  const connection = new AMQPClient(lavinmqUrl);
  await connection.connect();
  const channel = await connection.channel();

  console.log("[✅] Connection over channel established");
  console.log("[❎] Waiting for messages. To exit press CTRL+C ");

  const q = await channel.queue(QUEUES.QUEUE_SAVE_ROUTE_PRICE, {durable: true});
  let counter = 0;

  await q.subscribe({noAck: true}, async (msg) => {
    try {
      const { prices: journeyPrices, payload }: { prices: TravelData, payload: JourneyPayload } = JSON.parse(msg.bodyToString() || '');
      console.log(`[📤] Message received (${++counter})`, msg.bodyToString());
      
      if (journeyPrices && payload) {
        const prices: any = [];
        Object.values(journeyPrices.outbounds).map((outbound) => {
          prices.push({
            companyId: parseInt(outbound.companyId),
            duration: parseInt(outbound.duration),
            departureStation: payload.stations.departure,
            arrivalStation: payload.stations.arrival,
            departureTime: new Date(outbound.departureTime),
            arrivalTime: new Date(outbound.arrivalTime),
            stops: parseInt(outbound.stops),
            mode: outbound.mode,
            price: outbound.price,
            originalPrice: outbound.originalPrice,
            status: outbound.status,
            ticketsLeft: outbound.ticketsLeft,
          });
        });

        await prisma.prices.createMany({ data: prices });
      }
    } catch (error) {
      console.error(error)
    }
  })

  //When the process is terminated, close the connection
  process.on('SIGINT', () => {
    channel.close()
    connection.close()
    prisma.$disconnect()
    console.log("[❎] Connection closed")
    process.exit(0)
  });
}

startConsumer().catch(console.error);