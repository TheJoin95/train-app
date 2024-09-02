import { AMQPClient } from '@cloudamqp/amqp-client'

const cloudAMQPURL = process.env.CLOUDAMQP_URL || '';

export const QUEUES = {
  QUEUE_GET_ROUTE_PRICE: process.env.QUEUE_GET_ROUTE_PRICE || '',
  QUEUE_SAVE_ROUTE_PRICE: 'save_route_price',
  QUEUE_SEND_NOTIFICATION: 'send_notification',
};

export default async function sendToQueue(queue: string, body: object, shouldExit: boolean = false) {
  const connection = new AMQPClient(cloudAMQPURL);
  await connection.connect();
  const channel = await connection.channel();

  console.log("[✅] Connection over channel established");

  await channel.queue(queue, {
    durable: true
  });

  await channel.basicPublish("", queue, JSON.stringify(body));
  console.log("[📥] Message sent to queue", queue, JSON.stringify(body));

  connection.close();
  console.log("[❎] Connection closed");

  if (shouldExit)
    process.exit(0);
}
