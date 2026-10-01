import { AREQUIPA_CENTER, AREQUIPA_MAX_RADIUS_KM } from '../data/mockData';
import { FareConfig, TripQuote } from '../types';

/**
 * Calculates distance in kilometers between two lat/lng coordinates via Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Verifies if a given coordinate lies within the recognized Arequipa urban perimeter
 */
export function isWithinArequipaCoverage(lat: number, lng: number): boolean {
  const distFromCenter = calculateDistanceKm(
    AREQUIPA_CENTER[0],
    AREQUIPA_CENTER[1],
    lat,
    lng
  );
  return distFromCenter <= AREQUIPA_MAX_RADIUS_KM;
}

/**
 * Determines occupancy level string based on passenger count and capacity
 */
export function getOccupancyLevel(current: number, max: number): 'libre' | 'medio' | 'lleno' {
  if (max <= 0) return 'libre';
  const ratio = current / max;
  if (ratio < 0.5) return 'libre';
  if (ratio < 0.9) return 'medio';
  return 'lleno';
}

/**
 * Calculate dynamic or fixed public transport fare based on SRS v2 formula:
 * Costo Total = Tarifa Base + (Distancia * Costo/Km) + Recargos
 */
export function calculateTripFare(
  originCoords: [number, number],
  destinationCoords: [number, number],
  fareConfig: FareConfig,
  forceNight: boolean = false
): TripQuote {
  const distKm = calculateDistanceKm(
    originCoords[0],
    originCoords[1],
    destinationCoords[0],
    destinationCoords[1]
  );

  const withinCoverage =
    isWithinArequipaCoverage(originCoords[0], originCoords[1]) &&
    isWithinArequipaCoverage(destinationCoords[0], destinationCoords[1]);

  // Check if current hour is night time (21:00 to 05:00)
  const currentHour = new Date().getHours();
  const isNightTime = forceNight || (currentHour >= 21 || currentHour < 5);

  let baseFare = fareConfig.baseFare;
  let distanceFare = 0;

  if (fareConfig.tariffType === 'distancia') {
    distanceFare = Number((distKm * fareConfig.costPerKm).toFixed(2));
  } else {
    // Tarifa fija
    distanceFare = 0.50;
  }

  const subtotal = baseFare + distanceFare;
  const nightSurcharge = isNightTime ? Number(((subtotal * fareConfig.nightSurchargePercent) / 100).toFixed(2)) : 0;
  
  // Total rounded to standard 10 cents Peruvian coinage
  const rawTotal = subtotal + nightSurcharge;
  const totalFare = Math.max(1.00, Math.round(rawTotal * 10) / 10);
  const studentFare = Math.max(0.50, Math.round((totalFare * 0.5) * 10) / 10);

  // Speed estimation ~ 22 km/h in urban Arequipa traffic
  const estimatedMinutes = Math.max(5, Math.round((distKm / 22) * 60) + 3);

  return {
    originName: 'Punto de Origen',
    originCoords,
    destinationName: 'Punto de Destino',
    destinationCoords,
    distanceKm: distKm,
    estimatedMinutes,
    baseFare,
    distanceFare,
    nightSurcharge,
    isNightTime,
    totalFare,
    studentFare,
    isWithinArequipaCoverage: withinCoverage,
  };
}
