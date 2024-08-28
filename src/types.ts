export type StationsMap = {
  [type: string]: string;
};

export type Departure = {
    day: number;
    month: number;
}

export class JourneyPayload {
  stations: StationsMap;
  departure: Departure;

  constructor(stations: StationsMap, departure: Departure) {
    this.stations = stations;
    this.departure = departure;
  }
};
