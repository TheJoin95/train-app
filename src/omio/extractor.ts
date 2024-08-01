export interface Outbound {
    companyId: string;
    duration: string;
    departureTime: string;
    arrivalTime: string;
    segments: number[];
    segmentClasses: SegmentClass[];
    stops: string;
    overnightOffset: number;
    arrivalOvernightOffset: number;
    mode: string;
    ticketsSellingCompanies: string[];
    outboundId: string;
    journeyId: string;
    price: number;
    originalPrice: number;
    updatedAt: string;
    serviceProviderIds: string[];
    status: string;
    vehicleConfig: VehicleConfig;
    additionalServices: AdditionalService[];
    sentOutDiscountCards: Record<string, unknown>;
    overtakenByJourneyCount: number;
    ticketsLeft: number;
    ticketsLeftDisplayMode: string;
    availableOfferOptions: AvailableOfferOption[];
}

export interface SegmentClass {
    ids: string[];
    className: string | null;
}

export interface VehicleConfig {
    isBookable: boolean;
    isRequired: boolean;
}

export interface AdditionalService {
    type: string;
    isBookable: boolean;
    isRequired: boolean;
}

export interface AvailableOfferOption {
    type: string;
    cheapestClassName: string;
    cheapestClassPrice: number;
}

/*export interface Itinerary {
    outboundLegId: string;
}*/

export interface Company {
    id: string;
    name: string;
    code: string;
    logoUrl: string;
    companyCodes: CompanyCode[];
}

export interface CompanyCode {
    code: string;
    type: string;
}

export interface Position {
    positionType: string;
    name: string;
    countryCode: string;
    cityName: string;
    iataCode: string;
    latitude: number;
    longitude: number;
    ticketVendingMachine: boolean;
}

export interface SegmentDetail {
    type: string;
    departureTime: string;
    departureZoneId: string;
    arrivalTime: string;
    arrivalZoneId: string;
    departurePosition: string;
    arrivalPosition: string;
    duration: string;
    company: string;
    marketingCompany: string;
    transportId: string;
    direction: string;
    noChangeForNextSegment: boolean;
}

export interface JsonData {
    outbounds: Record<string, Outbound>;
    // itineraries: Itinerary[];
    companies: Record<string, Company>;
    positions: Record<string, Position>;
    // sortVariants: SortVariants;
    segmentDetails: Record<string, SegmentDetail>;
}

/*export interface SortVariants {
    smart: number[];
}*/


export class TravelData {
    outbounds: Record<string, Outbound>;
    // itineraries: Itinerary[];
    companies: Record<string, Company>;
    positions: Record<string, Position>;
    // sortVariants: SortVariants;
    segmentDetails: Record<string, SegmentDetail>;

    constructor(data: JsonData) {
        const {
            outbounds,
            // itineraries,
            companies,
            positions,
            // sortVariants,
            segmentDetails,
        } = this.parseJsonData(data);

        this.outbounds = outbounds;
        // this.itineraries = itineraries;
        this.companies = companies;
        this.positions = positions;
        // this.sortVariants = sortVariants;
        this.segmentDetails = segmentDetails;
    }

    public parseJsonData(json: any): JsonData {
        return {
            outbounds: this.parseOutbounds(json.outbounds),
            // itineraries: json.itineraries.map(this.parseItinerary),
            companies: this.parseCompanies(json.companies),
            positions: this.parsePositions(json.positions),
            // sortVariants: this.parseSortVariants(json.sortVariants),
            segmentDetails: this.parseSegmentDetails(json.segmentDetails)
        };
    }
    
    public parseOutbounds(outbounds: any): Record<string, Outbound> {
        const result: Record<string, Outbound> = {};
        for (const key in outbounds) {
            if (outbounds.hasOwnProperty(key)) {
                result[key] = this.parseOutbound(outbounds[key]);
            }
        }
        return result;
    }
    
    public parseOutbound(outbound: any): Outbound {
        return {
            companyId: outbound.companyId,
            duration: outbound.duration,
            departureTime: outbound.departureTime,
            arrivalTime: outbound.arrivalTime,
            segments: outbound.segments,
            segmentClasses: outbound.segmentClasses.map(this.parseSegmentClass),
            stops: outbound.stops,
            overnightOffset: outbound.overnightOffset,
            arrivalOvernightOffset: outbound.arrivalOvernightOffset,
            mode: outbound.mode,
            ticketsSellingCompanies: outbound.ticketsSellingCompanies,
            outboundId: outbound.outboundId,
            journeyId: outbound.journeyId,
            price: outbound.price,
            originalPrice: outbound.originalPrice,
            updatedAt: outbound.updatedAt,
            serviceProviderIds: outbound.serviceProviderIds,
            status: outbound.status,
            vehicleConfig: this.parseVehicleConfig(outbound.vehicleConfig),
            additionalServices: outbound.additionalServices.map(this.parseAdditionalService),
            sentOutDiscountCards: outbound.sentOutDiscountCards,
            overtakenByJourneyCount: outbound.overtakenByJourneyCount,
            ticketsLeft: outbound.ticketsLeft,
            ticketsLeftDisplayMode: outbound.ticketsLeftDisplayMode,
            availableOfferOptions: outbound.availableOfferOptions.map(this.parseAvailableOfferOption),
        };
    }
    
    public parseSegmentClass(segmentClass: any): SegmentClass {
        return {
            ids: segmentClass.ids,
            className: segmentClass.className
        };
    }
    
    public parseVehicleConfig(vehicleConfig: any): VehicleConfig {
        return {
            isBookable: vehicleConfig.isBookable,
            isRequired: vehicleConfig.isRequired
        };
    }
    
    public parseAdditionalService(additionalService: any): AdditionalService {
        return {
            type: additionalService.type,
            isBookable: additionalService.isBookable,
            isRequired: additionalService.isRequired
        };
    }
    
    public parseAvailableOfferOption(availableOfferOption: any): AvailableOfferOption {
        return {
            type: availableOfferOption.type,
            cheapestClassName: availableOfferOption.cheapestClassName,
            cheapestClassPrice: availableOfferOption.cheapestClassPrice
        };
    }
    
    public parseItinerary(itinerary: any): Itinerary {
        return {
            outboundLegId: itinerary.outboundLegId
        };
    }
    
    public parseCompanies(companies: any): Record<string, Company> {
        const result: Record<string, Company> = {};
        for (const key in companies) {
            if (companies.hasOwnProperty(key)) {
                result[key] = this.parseCompany(companies[key]);
            }
        }
        return result;
    }
    
    public parseCompany(company: any): Company {
        return {
            id: company.id,
            name: company.name,
            code: company.code,
            logoUrl: company.logoUrl,
            companyCodes: company.companyCodes.map(this.parseCompanyCode)
        };
    }
    
    public parseCompanyCode(companyCode: any): CompanyCode {
        return {
            code: companyCode.code,
            type: companyCode.type
        };
    }
    
    public parsePositions(positions: any): Record<string, Position> {
        const result: Record<string, Position> = {};
        for (const key in positions) {
            if (positions.hasOwnProperty(key)) {
                result[key] = this.parsePosition(positions[key]);
            }
        }
        return result;
    }
    
    public parsePosition(position: any): Position {
        return {
            positionType: position.positionType,
            name: position.name,
            countryCode: position.countryCode,
            cityName: position.cityName,
            iataCode: position.iataCode,
            latitude: position.latitude,
            longitude: position.longitude,
            ticketVendingMachine: position.ticketVendingMachine
        };
    }
    
    public parseSortVariants(sortVariants: any): SortVariants {
        return {
            smart: sortVariants.smart
        };
    }
    
    public parseSegmentDetails(segmentDetails: any): Record<string, SegmentDetail> {
        const result: Record<string, SegmentDetail> = {};
        for (const key in segmentDetails) {
            if (segmentDetails.hasOwnProperty(key)) {
                result[key] = this.parseSegmentDetail(segmentDetails[key]);
            }
        }
        return result;
    }
    
    public parseSegmentDetail(segmentDetail: any): SegmentDetail {
        return {
            type: segmentDetail.type,
            departureTime: segmentDetail.departureTime,
            departureZoneId: segmentDetail.departureZoneId,
            arrivalTime: segmentDetail.arrivalTime,
            arrivalZoneId: segmentDetail.arrivalZoneId,
            departurePosition: segmentDetail.departurePosition,
            arrivalPosition: segmentDetail.arrivalPosition,
            duration: segmentDetail.duration,
            company: segmentDetail.company,
            marketingCompany: segmentDetail.marketingCompany,
            transportId: segmentDetail.transportId,
            direction: segmentDetail.direction,
            noChangeForNextSegment: segmentDetail.noChangeForNextSegment
        };
    }
    

    static fromJSON(json: string): TravelData {
        const data: JsonData = JSON.parse(json);
        return new TravelData(data);
    }
}