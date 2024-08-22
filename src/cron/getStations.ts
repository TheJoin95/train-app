import { parse } from "csv-parse";
import * as fs from "fs/promises";
import Station from "@src/station/station";
import { PrismaClient } from "@prisma/client";

const _STATIONS_CSV_FILE =
  "https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv";

const PARIS_LAT = 48.8857803;
const PARIS_LNG = 2.3821279;
const MAX_DISTANCE_FROM_ME = 900;
const prisma = new PrismaClient();

async function processStations(): Promise<void> {
  try {
    const response = await fetch(_STATIONS_CSV_FILE);
    const csvContent = await response.text();

    const records: any[] = [];
    const parser = parse(csvContent, {
      delimiter: ";",
      columns: true,
      trim: true,
    });

    for await (const record of parser) {
      record.distanceInKm = getDistanceFromLatLonInKm(
        PARIS_LAT,
        PARIS_LNG,
        record.latitude,
        record.longitude
      );
      records.push(record);
    }

    const stations = records
      .filter(
        (record) =>
          record.is_suggestable === "t" &&
          record.is_main_station === "t" &&
          record.distanceInKm < MAX_DISTANCE_FROM_ME
      )
      .map(
        (record) =>
          new Station(
            record.name,
            parseFloat(record.latitude),
            parseFloat(record.longitude),
            record.country,
            record.time_zone,
            record.distanceInKm
          )
      );

    await prisma.stations.deleteMany();
    await prisma.stations.createMany({
      data: stations,
    });

    console.log("Insered %d stations", stations.length);
    await fs.writeFile("data/stations.json", JSON.stringify(stations), "utf8");
  } catch (error) {
    console.error("Error processing stations:", error);
  }
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

processStations().then(async () => await prisma.$disconnect());
