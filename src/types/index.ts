export type UserRole = 'pasajero' | 'conductor' | 'admin';

export type OccupancyLevel = 'libre' | 'medio' | 'lleno';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  dni?: string;
  phone?: string;
  driverDetails?: {
    license: string;
    vehiclePlate: string;
    vehicleModel: string;
    maxCapacity: number;
    status: 'Activo' | 'Inactivo' | 'Suspendido';
  };
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
  order: number;
}

export interface TransitRoute {
  id: string;
  code: string; // e.g. "C-1", "A-1"
  name: string;
  category: 'Troncal' | 'Alimentadora' | 'Interurbana';
  color: string;
  operatingHours: string;
  frequencyMinutes: string;
  lengthKm: number;
  fixedFare: number;
  stops: BusStop[];
  path: [number, number][]; // Lat, Lng polyline
}

export interface BusTelemetry {
  id: string;
  plate: string;
  driverName: string;
  driverDni: string;
  routeId: string;
  routeCode: string;
  lat: number;
  lng: number;
  speedKmH: number;
  headingDeg: number;
  currentPassengers: number;
  maxCapacity: number;
  occupancy: OccupancyLevel;
  lastUpdated: string;
  isOnline: boolean;
  model: string;
}

export interface FareConfig {
  tariffType: 'distancia' | 'fija';
  baseFare: number; // S/
  costPerKm: number; // S/ per km
  nightSurchargePercent: number; // % extra (21:00 - 05:00)
  studentDiscountPercent: number; // % discount or fixed half-fare
  arequipaMaxRadiusKm: number; // Max distance from central Arequipa (-16.3988, -71.5369)
  lastUpdated: string;
  updatedBy: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  target: string;
  oldValue: string;
  newValue: string;
  notes?: string;
}

export interface TripQuote {
  originName: string;
  originCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  distanceFare: number;
  nightSurcharge: number;
  isNightTime: boolean;
  totalFare: number;
  studentFare: number;
  isWithinArequipaCoverage: boolean;
  suggestedRoute?: TransitRoute;
}
