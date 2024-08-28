import { AMQPClient } from '@cloudamqp/amqp-client'
import getJourneyPrices from '@src/scraper';
import { JourneyPayload } from '@src/types';
import sendToQueue, { QUEUES } from './sender';

const lavinmqUrl = process.env.CLOUDAMQP_URL || '';

async function startConsumer() {
  //Setup a connection to the LavinMQ server
  const connection = new AMQPClient(lavinmqUrl);
  await connection.connect();
  const channel = await connection.channel();

  console.log("[✅] Connection over channel established");
  console.log("[❎] Waiting for messages. To exit press CTRL+C ");

  const q = await channel.queue(QUEUES.QUEUE_GET_ROUTE_PRICE, {durable: true});

  let counter = 0;

  await q.subscribe({noAck: true}, async (msg) => {
    try {
      const body = JSON.parse(msg.bodyToString() || '');
      console.log(`[📤] Message received (${++counter})`, msg.bodyToString());
      
      if (body?.stations && body?.departure) {
        const journeyPayload = new JourneyPayload(body.stations, body.departure);
        const prices = await getJourneyPrices(journeyPayload);
        console.log(`Sending ${Object.values(body.stations).join(' -> ')} to save price`);
        await await sendToQueue(QUEUES.QUEUE_SAVE_ROUTE_PRICE, {payload: journeyPayload, prices: prices});
      }
    } catch (error) {
      console.error(error)
    }
  })

  //When the process is terminated, close the connection
  process.on('SIGINT', () => {
    channel.close()
    connection.close()
    console.log("[❎] Connection closed")
    process.exit(0)
  });
}

startConsumer().catch(console.error);