import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PARIS_SNCF_ID = 'admin:fr:75056';

const getDurationForStations = async () => {
    const stations = await prisma.stations.findMany();

    for (let station of stations) {
        console.log('Processing %s', station.name);

        const response = await fetch(`${process.env.SNCF_PLACE_API}?q=${station.name}`, {
            headers: {
                'Authorization': `Basic ${btoa(`${process.env.SNCF_API_TOKEN}:`)}`,
            },
            mode: 'no-cors',
        });

        const responseJson = await response.json();

        if (responseJson?.places !== undefined) {
            const stationSncfId = responseJson?.places[0]['id'];
    
            const date = new Date((new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
            const journey = await fetch(`${process.env.SNCF_JOURNEY_API}?from=${PARIS_SNCF_ID}&to=${stationSncfId}&datetime=${date.getFullYear()}${('0' + (date.getMonth()+1)).slice(-2)}${('0' + (date.getDate()+1)).slice(-2)}T060934`, {
                headers: {
                    'Authorization': `Basic ${btoa(`${process.env.SNCF_API_TOKEN}:`)}`,
                },
                mode: 'no-cors',
            });
    
            const responseJourneyJson = await journey.json();
            if (responseJourneyJson?.journeys !== undefined) {
                const duration = responseJourneyJson?.journeys[0].durations.total;
        
                await prisma.stations.update({ data: { sncfId: stationSncfId, duration: duration }, where: { id: station.id } })
            }
        }

    }
} 

getDurationForStations().then(async () => await prisma.$disconnect());