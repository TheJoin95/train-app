import { parse } from 'csv-parse';
import * as fs from 'fs/promises';
import Station from '@src/station/station';

const _STATIONS_CSV_FILE = "https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv";

async function processStations(): Promise<void> {
    try {
        const response = await fetch(_STATIONS_CSV_FILE);
        const csvContent = await response.text();

        const records: any[] = [];
        const parser = parse(csvContent, {
            delimiter: ';',
            columns: true,
            trim: true
        });

        for await (const record of parser) {
            records.push(record);
        }

        const stations = records
            .filter(record => record.is_suggestable === 't')
            .map(
                record => new Station(
                    parseInt(record.id),
                    record.name,
                    parseFloat(record.latitude),
                    parseFloat(record.longitude),
                    record.country,
                    record.time_zone
                )
            );

        await fs.writeFile('data/stations.json', JSON.stringify(stations), 'utf8');
    } catch (error) {
        console.error('Error processing stations:', error);
    }
}

processStations();
