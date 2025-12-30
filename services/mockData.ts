import { HunterTier, ListingStatus, PropertyListing, HunterZone } from '../types';
import { zonesData } from './zonesData'; // Direct Import

const CENTER_LAT = 38.0293;
const CENTER_LON = -78.4767; // Charlottesville, VA

// Helper to map string tier from GeoJSON to Enum
const mapTier = (tierStr: string): HunterTier => {
  switch (tierStr?.toLowerCase()) {
    case 'gold': return HunterTier.GOLD;
    case 'silver': return HunterTier.SILVER;
    case 'bronze': return HunterTier.BRONZE;
    default: return HunterTier.ZINC;
  }
};

// Process the Zones from the JSON file immediately
// This ensures that even in mock mode, we see the REAL geospatial contours
const processZones = (): HunterZone[] => {
  try {
    const featureCollection = zonesData[0] as any; // Assuming array wrap based on user input
    if (!featureCollection || !featureCollection.features) return [];

    return featureCollection.features.map((f: any, index: number) => {
      let rawCoords = [];
      if (f.geometry.type === 'Polygon') {
        rawCoords = f.geometry.coordinates[0];
      } else if (f.geometry.type === 'MultiPolygon') {
        rawCoords = f.geometry.coordinates[0][0];
      }

      // Swap Lon/Lat to Lat/Lon for Leaflet
      const coordinates: [number, number][] = rawCoords.map((c: number[]) => [c[1], c[0]]);

      // Extract tier from properties (GeoJSON usually has 'tier' or 'contour' property)
      // Based on user input, it seems to have 'contour' or 'tier'. 
      // If explicit 'tier' isn't there, we can guess based on color or ID, but let's assume 'tier' exists or default.
      // Looking at the provided JSON, it has "properties": { "contour": 60, "fill": "#bfaa40" ... }
      // Let's map contour/time to Tier
      const contour = f.properties.contour;
      let tier = HunterTier.BRONZE;
      let label = "60-75 min drive";

      if (contour <= 40) {
        tier = HunterTier.GOLD;
        label = "0-40 min drive";
      } else if (contour <= 60) {
        tier = HunterTier.SILVER;
        label = "40-60 min drive";
      }

      return {
        id: f.properties.id || `zone-${index}`,
        tier: tier,
        coordinates: coordinates,
        label: label
      };
    });
  } catch (e) {
    console.error("Failed to parse zones data", e);
    return [];
  }
}

export const MOCK_ZONES: HunterZone[] = processZones();

// Helper to determine zone based on distance (simplified check for mock listings)
const getZoneFromLocation = (lat: number, lon: number): HunterTier => {
  const dist = Math.sqrt(Math.pow(lat - CENTER_LAT, 2) + Math.pow(lon - CENTER_LON, 2)) * 111300;
  if (dist < 7000) return HunterTier.GOLD;
  if (dist < 14000) return HunterTier.SILVER;
  if (dist < 20000) return HunterTier.BRONZE;
  return HunterTier.ZINC;
};

const generateListings = (count: number): PropertyListing[] => {
  return Array.from({ length: count }).map((_, i) => {
    // 1. Generate Location
    const distFactor = Math.random();
    const radius = 2000 + (distFactor * 16000); // 2km to 18km
    const angle = Math.random() * 2 * Math.PI;
    const rDeg = radius / 111300;

    const lat = CENTER_LAT + rDeg * Math.sin(angle);
    const lon = CENTER_LON + rDeg * Math.cos(angle);

    const zoneTier = getZoneFromLocation(lat, lon);

    const price = Math.floor(Math.random() * (275000 - 150000) + 150000);

    let priceTier = HunterTier.BRONZE;
    if (price < 225000) {
      priceTier = HunterTier.GOLD;
    } else if (price >= 225000 && price <= 250000) {
      priceTier = HunterTier.SILVER;
    } else {
      priceTier = HunterTier.BRONZE;
    }

    return {
      id: `prop-${i}`,
      price: price,
      address: `${Math.floor(Math.random() * 999)} ${['Oak', 'Maple', 'Main', 'Broad', 'Market'][Math.floor(Math.random() * 5)]} St, Charlottesville VA`,
      beds: Math.floor(Math.random() * 4) + 2,
      baths: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 900,
      listing_type: 'Single Family',
      status: Math.random() > 0.2 ? ListingStatus.FOR_SALE : ListingStatus.PENDING,
      image_url: `https://picsum.photos/seed/${i + 100}/400/300`,
      property_url: 'https://www.zillow.com',
      location: { lat, lon },
      price_tier: priceTier,
      zone_tier: zoneTier,
      days_on_market: Math.floor(Math.random() * 45)
    };
  });
};

export const MOCK_LISTINGS = generateListings(80);