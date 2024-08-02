export default class Station {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    timeZone: string;

    constructor(id: number, name: string, latitude: number, longitude: number, country: string, timeZone: string) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.country = country;
        this.timeZone = timeZone;
    }
}
