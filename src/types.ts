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

export class TimeInfo {
  stations: StationsMap;
  date: Date;

  constructor(stations: StationsMap, date: number) {
    this.stations = stations;
    this.date = new Date(date);
  }
};

export type TimePreferences = {
  outbound: string;
  inbound: string;
}

export class Time {
  outbound: TimeInfo;
  inbound: TimeInfo;
  preferences: TimePreferences;

  constructor(outbound: TimeInfo, inbound: TimeInfo, preferences: TimePreferences) {
    this.outbound = outbound;
    this.inbound = inbound;
    this.preferences = preferences;
  }
}