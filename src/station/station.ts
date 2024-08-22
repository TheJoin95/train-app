type StationsLocation = {
    coordinates: number[],
    type: string
  }
export default class Station {
    name: string;
    country: string;
    timeZone: string;
    distanceInKm: number;
    location: StationsLocation;
    duration: number | null;

    constructor(name: string, latitude: number, longitude: number, country: string, timeZone: string, distanceInKm: number, duration: number | null = null) {
        this.name = name;
        this.country = country;
        this.timeZone = timeZone;
        this.distanceInKm = distanceInKm;
        this.location = {
            type: 'Point',
            coordinates: [
                longitude,
                latitude,
            ],
        };
        this.duration = duration;
    }
}
