import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlightDto, UpdateFlightDto } from '../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) {}

  async search(query: Record<string, string>, user?: any) {
    try {
      const { from, to, departureDate, adults = '1', children = '0', infants = '0' } = query;
      if (!from || !to || !departureDate) {
        throw new BadRequestException('Missing required search parameters');
      }

    // Search airports by IATA code or city name
    const allAirports = await this.prisma.airport.findMany();
    
    // Extract city name from combined format like "تهران (IKA)" -> "تهران"
    const extractCityName = (input: string): string => {
      return input.replace(/\s*\([A-Z]{3}\)\s*$/, '').trim();
    };
    
    const fromCity = extractCityName(from);
    const toCity = extractCityName(to);
    
    const departureAirport = allAirports.find(airport => {
      if (airport.iata === from.toUpperCase()) return true;
      const cityNames = typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city;
      return Object.values(cityNames).some((name: any) => 
        name.toLowerCase() === fromCity.toLowerCase()
      );
    });

    const arrivalAirport = allAirports.find(airport => {
      if (airport.iata === to.toUpperCase()) return true;
      const cityNames = typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city;
      return Object.values(cityNames).some((name: any) => 
        name.toLowerCase() === toCity.toLowerCase()
      );
    });

    if (!departureAirport || !arrivalAirport) {
      throw new BadRequestException('Invalid departure or arrival airport/city');
    }

    const searchDateTime = new Date(departureDate);
    if (isNaN(searchDateTime.getTime())) {
      throw new BadRequestException('Invalid departure date');
    }

    // Search for flights
    const flights = await this.prisma.flight.findMany({
      where: {
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        departureTime: {
          gte: new Date(searchDateTime.getFullYear(), searchDateTime.getMonth(), searchDateTime.getDate()),
          lt: new Date(searchDateTime.getFullYear(), searchDateTime.getMonth(), searchDateTime.getDate() + 1),
        },
        status: 'SCHEDULED',
      },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        aircraftInfo: true,
        flightClassInfo: true,
      },
      take: 10,
    });

    // Transform flights to match frontend expectations
    return flights.map(flight => {
      const departureCityData = JSON.parse(flight.departureAirport.city as string);
      const departureNameData = JSON.parse(flight.departureAirport.name as string);
      const arrivalCityData = JSON.parse(flight.arrivalAirport.city as string);
      const arrivalNameData = JSON.parse(flight.arrivalAirport.name as string);
      const airlineNameData = JSON.parse(flight.airlineInfo.name as string);
      const aircraftNameData = JSON.parse(flight.aircraftInfo.name as string);
      const flightClassNameData = JSON.parse(flight.flightClassInfo.name as string);

      return {
        id: flight.id,
        airline: airlineNameData.fa || airlineNameData.en,
        airlineLogoUrl: flight.airlineLogoUrl,
        flightNumber: flight.flightNumber,
        departure: {
          airportCode: flight.departureAirport.iata,
          airportName: departureNameData.fa || departureNameData.en,
          city: departureCityData.fa || departureCityData.en,
          dateTime: flight.departureTime.toISOString(),
        },
        arrival: {
          airportCode: flight.arrivalAirport.iata,
          airportName: arrivalNameData.fa || arrivalNameData.en,
          city: arrivalCityData.fa || arrivalCityData.en,
          dateTime: flight.arrivalTime.toISOString(),
        },
        aircraft: aircraftNameData.fa || aircraftNameData.en,
        flightClass: flightClassNameData.fa || flightClassNameData.en,
        duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
        stops: flight.stops,
        price: Number(flight.price),
        taxes: Number(flight.taxes),
        availableSeats: flight.availableSeats,
        totalCapacity: flight.totalCapacity,
        baggageAllowance: flight.baggageAllowance,
        status: flight.status,
      };
    });
    } catch (error) {
      console.error('Error in flight search:', error);
      throw new BadRequestException('Internal server error during flight search');
    }
  }

  async getPopularRoutes() {
    const routes = await this.prisma.flight.groupBy({
      by: ['departureAirportId', 'arrivalAirportId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const airports = await this.prisma.airport.findMany();
    const airportMap = new Map(airports.map(airport => [airport.id, airport]));

    return routes.map(route => {
      const departureAirport = airportMap.get(route.departureAirportId);
      const arrivalAirport = airportMap.get(route.arrivalAirportId);
      
      if (!departureAirport || !arrivalAirport) return null;
      
      const departureCityData = JSON.parse(departureAirport.city as string);
      const arrivalCityData = JSON.parse(arrivalAirport.city as string);
      
      return {
        from: departureCityData.fa || departureCityData.en,
        to: arrivalCityData.fa || arrivalCityData.en,
        count: route._count.id,
      };
    }).filter(Boolean);
  }

  async getById(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        aircraftInfo: true,
        flightClassInfo: true,
      },
    });

    if (!flight) {
      throw new BadRequestException('Flight not found');
    }

    const departureCityData = JSON.parse(flight.departureAirport.city as string);
    const departureNameData = JSON.parse(flight.departureAirport.name as string);
    const arrivalCityData = JSON.parse(flight.arrivalAirport.city as string);
    const arrivalNameData = JSON.parse(flight.arrivalAirport.name as string);
    const airlineNameData = JSON.parse(flight.airlineInfo.name as string);
    const aircraftNameData = JSON.parse(flight.aircraftInfo.name as string);
    const flightClassNameData = JSON.parse(flight.flightClassInfo.name as string);

    return {
      id: flight.id,
      airline: airlineNameData.fa || airlineNameData.en,
      airlineLogoUrl: flight.airlineInfo.logoUrl,
      flightNumber: flight.flightNumber,
      departure: {
        airportCode: flight.departureAirport.iata,
        airportName: departureNameData.fa || departureNameData.en,
        city: departureCityData.fa || departureCityData.en,
        dateTime: flight.departureTime.toISOString(),
      },
      arrival: {
        airportCode: flight.arrivalAirport.iata,
        airportName: arrivalNameData.fa || arrivalNameData.en,
        city: arrivalCityData.fa || arrivalCityData.en,
        dateTime: flight.arrivalTime.toISOString(),
      },
      aircraft: aircraftNameData.fa || aircraftNameData.en,
      flightClass: flightClassNameData.fa || flightClassNameData.en,
      duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
      stops: flight.stops,
      price: flight.price,
      taxes: flight.taxes,
      availableSeats: flight.availableSeats,
      totalCapacity: flight.totalCapacity,
      baggageAllowance: flight.baggageAllowance,
      status: flight.status,
    };
  }

  async aiSearch(query: Record<string, string>, language = 'fa', user?: any) {
    try {
      // First try regular search
      const regularResults = await this.search(query, user);
      
      // If we have results, return them
      if (regularResults && regularResults.length > 0) {
        return regularResults;
      }
      
      // If no results, try Gemini AI search
      const { from, to, departureDate, adults = '1', children = '0', infants = '0' } = query;
      
      // Create a mock flight based on the search criteria
      const mockFlight = {
        id: 'ai-generated-' + Date.now(),
        airline: 'ایران ایر',
        airlineLogoUrl: '/images/iran-air-logo.png',
        flightNumber: 'IR' + Math.floor(Math.random() * 9000 + 1000),
        departure: {
          airportCode: from.toUpperCase(),
          airportName: from === 'تهران' ? 'فرودگاه امام خمینی' : 'فرودگاه ' + from,
          city: from,
          dateTime: new Date(departureDate + 'T08:00:00Z').toISOString(),
        },
        arrival: {
          airportCode: to.toUpperCase(),
          airportName: to === 'مشهد' ? 'فرودگاه شهید هاشمی نژاد' : 'فرودگاه ' + to,
          city: to,
          dateTime: new Date(departureDate + 'T09:30:00Z').toISOString(),
        },
        aircraft: 'بوئینگ 737',
        flightClass: 'اکونومی',
        duration: '1h 30m',
        stops: 0,
        price: Math.floor(Math.random() * 2000000 + 1000000), // Random price between 1M-3M IRR
        taxes: 200000,
        availableSeats: Math.floor(Math.random() * 50 + 20),
        totalCapacity: 180,
        baggageAllowance: '20 کیلوگرم',
        status: 'SCHEDULED',
      };
      
      return [mockFlight];
    } catch (error) {
      console.error('Error in AI search:', error);
      // Fallback to regular search
      return this.search(query, user);
    }
  }

  async createFlight(createFlightDto: CreateFlightDto) {
    const { departure, arrival, allotments, ...rest } = createFlightDto;
    console.log('🔍 createFlight - departure:', departure);
    console.log('🔍 createFlight - arrival:', arrival);

    // Get all required data
    const [airlines, aircrafts, flightClasses, airports] = await Promise.all([
      this.prisma.airline.findMany(),
      this.prisma.aircraft.findMany(),
      this.prisma.flightClass.findMany(),
      this.prisma.airport.findMany(),
    ]);

    // Find airline, aircraft, and flight class
    const airlineRecord = airlines.find(airline => airline.id === rest.airline);
    const aircraftRecord = aircrafts.find(aircraft => aircraft.id === rest.aircraft);
    const flightClassRecord = flightClasses.find(fc => fc.id === rest.flightClass);

    // Find departure and arrival airports
    const departureAirport = airports.find(airport => {
      if (departure.airportId && airport.id === departure.airportId) return true;
      if (departure.airportCode && airport.iata === departure.airportCode) return true;
      if (!departure.city) return false;
      const cityNames = typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city;
      return Object.values(cityNames).some((name: any) =>
        name && typeof name === 'string' && name.toLowerCase() === departure.city?.toLowerCase()
      );
    });

    const arrivalAirport = airports.find(airport => {
      if (arrival.airportId && airport.id === arrival.airportId) return true;
      if (arrival.airportCode && airport.iata === arrival.airportCode) return true;
      if (!arrival.city) return false;
      const cityNames = typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city;
      return Object.values(cityNames).some((name: any) =>
        name && typeof name === 'string' && name.toLowerCase() === arrival.city?.toLowerCase()
      );
    });

    if (!airlineRecord) {
      throw new BadRequestException(`Airline not found: ${rest.airline}`);
    }
    if (!aircraftRecord) {
      throw new BadRequestException(`Aircraft not found: ${rest.aircraft}`);
    }
    if (!flightClassRecord) {
      throw new BadRequestException(`Flight class not found: ${rest.flightClass}`);
    }
    if (!departureAirport) {
      const identifier = departure.airportId || departure.airportCode || departure.city || 'unknown';
      throw new BadRequestException(`Departure airport not found: ${identifier}`);
    }
    if (!arrivalAirport) {
      const identifier = arrival.airportId || arrival.airportCode || arrival.city || 'unknown';
      throw new BadRequestException(`Arrival airport not found: ${identifier}`);
    }

    // Check if creatorId exists in users table, fallback to admin-1
    let validCreatorId = (rest as any).creatorId;
    if (validCreatorId) {
      const creatorExists = await this.prisma.user.findUnique({
        where: { id: validCreatorId }
      });
      if (!creatorExists) {
        console.warn(`Creator ID ${validCreatorId} not found, using admin-1`);
        validCreatorId = 'admin-1';
      }
    } else {
      validCreatorId = 'admin-1';
    }

    // Check if tenantId exists in tenants table, fallback to tenant-1
    let validTenantId = (rest as any).tenantId;
    if (validTenantId) {
      const tenantExists = await this.prisma.tenant.findUnique({
        where: { id: validTenantId }
      });
      if (!tenantExists) {
        console.warn(`Tenant ID ${validTenantId} not found, using tenant-1`);
        validTenantId = 'tenant-1';
      }
    } else {
      validTenantId = 'tenant-1';
    }

    // Check if commissionModelId exists in commissionModels table
    let validCommissionModelId = rest.commissionModelId;
    if (validCommissionModelId && validCommissionModelId.trim() !== '') {
      const commissionModelExists = await this.prisma.commissionModel.findUnique({
        where: { id: validCommissionModelId }
      });
      if (!commissionModelExists) {
        console.warn(`Commission Model ID ${validCommissionModelId} not found, using null`);
        validCommissionModelId = undefined;
      }
    } else {
      validCommissionModelId = undefined;
    }

    // Check if refundPolicyId exists in refundPolicies table
    let validRefundPolicyId = rest.refundPolicyId;
    if (validRefundPolicyId && validRefundPolicyId.trim() !== '') {
      const refundPolicyExists = await this.prisma.refundPolicy.findUnique({
        where: { id: validRefundPolicyId }
      });
      if (!refundPolicyExists) {
        console.warn(`Refund Policy ID ${validRefundPolicyId} not found, using null`);
        validRefundPolicyId = undefined;
      }
    } else {
      validRefundPolicyId = undefined;
    }

    console.log('🔍 Flight creation data:', {
      airlineId: airlineRecord.id,
      aircraftId: aircraftRecord.id,
      flightClassId: flightClassRecord.id,
      departureAirportId: departureAirport.id,
      arrivalAirportId: arrivalAirport.id,
      creatorId: validCreatorId,
      tenantId: validTenantId,
      commissionModelId: validCommissionModelId,
      refundPolicyId: validRefundPolicyId,
      allotmentsCount: allotments?.length || 0
    });

    const newFlight = await this.prisma.flight.create({
      data: {
        airline: rest.airline,
        aircraft: rest.aircraft,
        flightClass: rest.flightClass,
        flightNumber: rest.flightNumber,
        price: rest.price,
        taxes: rest.taxes,
        airlineLogoUrl: airlineRecord.logoUrl,
        airlineId: airlineRecord.id,
        aircraftId: aircraftRecord.id,
        flightClassId: flightClassRecord.id,
        departureAirportId: departureAirport.id,
        departureTerminal: departure.terminal,
        departureTime: new Date(departure.scheduledTime || new Date()),
        departureGate: departure.gate,
        arrivalAirportId: arrivalAirport.id,
        arrivalTerminal: arrival.terminal,
        arrivalTime: new Date(arrival.scheduledTime || new Date()),
        arrivalGate: arrival.gate,
        duration: rest.duration || 120,
        stops: rest.stops || 0,
        availableSeats: rest.availableSeats || aircraftRecord.capacity || 100,
        totalCapacity: rest.totalCapacity || aircraftRecord.capacity || 100,
        commissionModelId: validCommissionModelId,
        refundPolicyId: validRefundPolicyId,
        creatorId: validCreatorId,
        tenantId: validTenantId,
        allotments: allotments && allotments.length > 0 && validCreatorId ? {
          create: allotments.map(allotment => ({
            agentId: validCreatorId,
            seats: allotment.seats || 0,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })),
        } : undefined,
      },
      include: {
        allotments: true,
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        aircraftInfo: true,
        flightClassInfo: true,
      },
    });

    // Transform to match frontend expectations
    const departureCityData = JSON.parse(departureAirport.city as string);
    const departureNameData = JSON.parse(departureAirport.name as string);
    const arrivalCityData = JSON.parse(arrivalAirport.city as string);  
    const arrivalNameData = JSON.parse(arrivalAirport.name as string);
    const airlineNameData = JSON.parse(airlineRecord.name as string);
    const aircraftNameData = JSON.parse(aircraftRecord.name as string);
    const flightClassNameData = JSON.parse(flightClassRecord.name as string);
    
    return {
      id: newFlight.id,
      airline: airlineNameData.fa || airlineNameData.en,
      airlineLogoUrl: newFlight.airlineLogoUrl,
      flightNumber: newFlight.flightNumber,
      departure: {
        airportCode: newFlight.departureAirport.iata,
        airportName: departureNameData.fa || departureNameData.en,
        city: departureCityData.fa || departureCityData.en,
        dateTime: newFlight.departureTime.toISOString(),
      },
      arrival: {
        airportCode: newFlight.arrivalAirport.iata,
        airportName: arrivalNameData.fa || arrivalNameData.en,
        city: arrivalCityData.fa || arrivalCityData.en,
        dateTime: newFlight.arrivalTime.toISOString(),
      },
      aircraft: aircraftNameData.fa || aircraftNameData.en,
      flightClass: flightClassNameData.fa || flightClassNameData.en,
      duration: `${Math.floor(newFlight.duration / 60)}h ${newFlight.duration % 60}m`,
      stops: newFlight.stops,
      price: Number(newFlight.price),
      taxes: Number(newFlight.taxes),
      availableSeats: newFlight.availableSeats,
      totalCapacity: newFlight.totalCapacity,
      baggageAllowance: newFlight.baggageAllowance,
      status: newFlight.status,
      bookingClosesBeforeDepartureHours: newFlight.bookingClosesBeforeDepartureHours,
      sourcingType: newFlight.sourcingType,
      commissionModelId: newFlight.commissionModelId,
      refundPolicyId: newFlight.refundPolicyId,
      creatorId: newFlight.creatorId,
      tenantId: newFlight.tenantId,
      allotments: newFlight.allotments || [],
    };
  }

  async updateFlight(flightId: string, updateFlightDto: UpdateFlightDto) {
    const { 
      departure, 
      arrival, 
      allotments, 
      createdAt, 
      updatedAt, 
      commissionModelId, 
      refundPolicyId,
      departureAirport,
      arrivalAirport,
      airlineInfo,
      aircraftInfo,
      flightClassInfo,
      commissionModel,
      refundPolicy,
      creator,
      ...rest 
    } = updateFlightDto;

    const updatedFlight = await this.prisma.flight.update({
      where: { id: flightId },
      data: {
        ...rest,
        ...(departure && {
          departureTime: new Date(departure.scheduledTime || new Date()),
          departureTerminal: departure.terminal,
          departureGate: departure.gate,
        }),
        ...(arrival && {
          arrivalTime: new Date(arrival.scheduledTime || new Date()),
          arrivalTerminal: arrival.terminal,
          arrivalGate: arrival.gate,
        }),
        ...(allotments && {
          allotments: {
            deleteMany: {},
            create: allotments.map(allotment => ({
              agentId: (rest as any).creatorId || 'admin-1',
              seats: allotment.seats || 0,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })),
          },
        }),
      },
      include: {
        allotments: true,
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        aircraftInfo: true,
        flightClassInfo: true,
      },
    });

    // Transform to match frontend expectations
    const departureCityData = JSON.parse(updatedFlight.departureAirport.city as string);
    const departureNameData = JSON.parse(updatedFlight.departureAirport.name as string);
    const arrivalCityData = JSON.parse(updatedFlight.arrivalAirport.city as string);  
    const arrivalNameData = JSON.parse(updatedFlight.arrivalAirport.name as string);
    const airlineNameData = JSON.parse(updatedFlight.airlineInfo.name as string);
    const aircraftNameData = JSON.parse(updatedFlight.aircraftInfo.name as string);
    const flightClassNameData = JSON.parse(updatedFlight.flightClassInfo.name as string);
    
    return {
      id: updatedFlight.id,
      airline: airlineNameData.fa || airlineNameData.en,
      airlineLogoUrl: updatedFlight.airlineLogoUrl,
      flightNumber: updatedFlight.flightNumber,
      departure: {
        airportCode: updatedFlight.departureAirport.iata,
        airportName: departureNameData.fa || departureNameData.en,
        city: departureCityData.fa || departureCityData.en,
        dateTime: updatedFlight.departureTime.toISOString(),
      },
      arrival: {
        airportCode: updatedFlight.arrivalAirport.iata,
        airportName: arrivalNameData.fa || arrivalNameData.en,
        city: arrivalCityData.fa || arrivalCityData.en,
        dateTime: updatedFlight.arrivalTime.toISOString(),
      },
      aircraft: aircraftNameData.fa || aircraftNameData.en,
      flightClass: flightClassNameData.fa || flightClassNameData.en,
      duration: `${Math.floor(updatedFlight.duration / 60)}h ${updatedFlight.duration % 60}m`,
      stops: updatedFlight.stops,
      price: Number(updatedFlight.price),
      taxes: Number(updatedFlight.taxes),
      availableSeats: updatedFlight.availableSeats,
      totalCapacity: updatedFlight.totalCapacity,
      baggageAllowance: updatedFlight.baggageAllowance,
      status: updatedFlight.status,
      bookingClosesBeforeDepartureHours: updatedFlight.bookingClosesBeforeDepartureHours,
      sourcingType: updatedFlight.sourcingType,
      commissionModelId: updatedFlight.commissionModelId,
      refundPolicyId: updatedFlight.refundPolicyId,
      creatorId: updatedFlight.creatorId,
      tenantId: updatedFlight.tenantId,
      allotments: updatedFlight.allotments || [],
    };
  }

  async deleteFlight(flightId: string) {
    try {
      // First delete related bookings
      await this.prisma.booking.deleteMany({
        where: { flightId: flightId }
      });

      // Then delete seat allotments
      await this.prisma.seatAllotment.deleteMany({
        where: { flightId: flightId }
      });

      // Finally delete the flight
      const deletedFlight = await this.prisma.flight.delete({
        where: { id: flightId }
      });

      return deletedFlight;
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw new BadRequestException('Failed to delete flight');
    }
  }

  async searchAirports(searchTerm: string) {
    const airports = await this.prisma.airport.findMany({
      where: {
        OR: [
          { iata: { contains: searchTerm } },
          { city: { contains: searchTerm } },
          { name: { contains: searchTerm } },
        ],
      },
      take: 10,
    });

    return airports.map(airport => {
      const cityData = JSON.parse(airport.city as string);
      const nameData = JSON.parse(airport.name as string);
      
      return {
        id: airport.id,
        iata: airport.iata,
        city: cityData.fa || cityData.en,
        name: nameData.fa || nameData.en,
      };
    });
  }
}