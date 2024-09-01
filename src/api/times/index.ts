import { Time } from "@src/types";
import * as http from "http";
import { PrismaClient } from "@prisma/client";

/**
 * POST add a row in times with outbound, inbound and preferences
 * @param req 
 * @param res 
 */
export const addTime = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  let requestBody = "";

  req.on("data", (chunk) => {
    // Accumulate the request body
    requestBody += chunk;
  });

  req.on("end", async () => {
    // Parse the request body and add the new product
    const payload: Time = JSON.parse(requestBody);
    const time = new Time(payload.outbound, payload.inbound, payload.preferences);

    if (time.outbound.date.getTime() < new Date().getTime() && time.inbound.date.getTime() < time.outbound.date.getTime()) {
      res.writeHead(400, 'Content-type: application/json');
      res.end(JSON.stringify({"error": 'Date range unavailable'}));
      return;
    }

    const prisma = new PrismaClient();
    // @ts-ignore
    await prisma.times.create({ data: time});
    await prisma.$disconnect()

    res.writeHead(201, 'Content-type: application/json');
    res.end(JSON.stringify({"success": true}));
  });
};

/**
 * DELETE remove a row from times collection
 * @param req 
 * @param res 
 */
export const deleteTime = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const timeId = parseInt(req.url.match(/time\/([0-9]+)/)[1]);

  if (!timeId) {
    res.writeHead(400, 'Content-type: application/json');
    res.end(JSON.stringify({"error": 'timeid not found'}));
    return;
  }

  const prisma = new PrismaClient();
  // @ts-ignore
  await prisma.times.delete({ where: { id: timeId } });
  await prisma.$disconnect()

  res.writeHead(200, 'Content-type: application/json');
  res.end(JSON.stringify({"success": true}));
};

/**
 * GET get the prices list from a given time id
 * it can be filtered by outbound/inbound and datetime, price, duration
 * @param req 
 * @param res 
 */
export const getPricesFromTimeId = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const timeId = req.url.match(/time\/([0-9]+)\/prices/)[1];

  const prisma = new PrismaClient();
  const time: Time = await prisma.times.findFirst({where: { id: timeId }});

  // TODO: add filters like > or < datetime in departure/arrival, price, mode and duration

  const inboundJourneys = await prisma.prices.findMany({
    where: {
      departureStation: time.inbound.stations.departure,
      arrivalStation: time.outbound.stations.outbound,
      departureTime: {gte: new Date(time.inbound.date.toISOString().split('T')[0] + ' 00:00'), lte: new Date(time.inbound.date.toISOString().split('T')[0] + ' 24:00')},
    },
    orderBy: { id: 'desc' }
  });

  const outboundJourneys = await prisma.prices.findMany({
    where: {
      departureStation: time.outbound.stations.departure,
      arrivalStation: time.inbound.stations.outbound,
      departureTime: {gte: new Date(time.outbound.date.toISOString().split('T')[0] + ' 00:00'), lte: new Date(time.outbound.date.toISOString().split('T')[0] + ' 24:00')},
    },
    orderBy: { id: 'desc' }
  });

  await prisma.$disconnect()

  res.writeHead(200, 'Content-type: application/json');
  res.end(JSON.stringify({"success": true, data: {inbound: inboundJourneys, outbound: outboundJourneys}}));
};

export const getTimes = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const prisma = new PrismaClient();
  const times: Time[] = await prisma.times.findMany({ orderBy: { id: 'desc' } });
  await prisma.$disconnect()

  res.writeHead(200, 'Content-type: application/json');
  res.end(JSON.stringify({"success": true, data: times}));
}