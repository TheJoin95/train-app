import { AMQPClient } from '@cloudamqp/amqp-client'
import { QUEUES } from './sender';
import { createTransport } from 'nodemailer';

const lavinmqUrl = process.env.CLOUDAMQP_URL || '';



var transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PWD,
    }
  });
  
  var mailOptions = {
    from: 'miki.lombi@gmail.com',
    to: 'miki.lombi@gmail.com',
    subject: `Notification from train App`,
    text: `ciao`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });




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
      const travelData = JSON.parse(msg.bodyToString() || '');
      console.log(`[📤] Message received (${++counter})`, msg.bodyToString());
      
      var transporter = createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PWD,
        }
      });
      
      var mailOptions = {
        from: 'miki.lombi@gmail.com',
        to: 'miki.lombi@gmail.com',
        subject: `Notification from train App - €${travelData.price / 100} - ${travelData.departureStation} -> ${travelData.arrivalStation}`,
        text: `${travelData.mode} with a duration of ${travelData.duration / 60}h departing ${travelData.departureTime}, arriving ${travelData.arrivalTime} in ${travelData.stops} stops, ${travelData.ticketsLeft} ticket left`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

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

// startConsumer().catch(console.error);