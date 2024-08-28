import type { StationsMap } from "@src/types";
import sendToQueue, { QUEUES } from "./sender";

const DEPARTURE_STATION = 'Paris';
const ARRIVAL_STATIONS = [
  'Etretat',
  'Lille',
  'Londre',
  'Lussemburgo',
  'Munchen',
  'Grenoble',
  'Cassis',
  'Marseille',
  'Bezier',
  'Carcassone',
  'Pau',
  'Barcellona',
  'Toulose',
  'Biarritz',
  'Rennes',
  'Brest',
  'Saint Malo',
  'Saint Nazaire',
  'Nantes',
  'Deauville',
  'Dieppe',
  'Amiens',
];

async function startProducer() {
  try {
    for await (const arrivalStation of ARRIVAL_STATIONS) {
      const STATIONS: StationsMap = {
        departure: DEPARTURE_STATION,
        arrival: arrivalStation,
      };
  
      const payload = {
        stations: STATIONS,
        departure: {
          day: 20,
          month: 10,
        },
      };

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
