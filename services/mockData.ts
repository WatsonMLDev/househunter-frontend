import { HunterTier, ListingStatus, PropertyListing, HunterZone } from '../types';

const CENTER_LAT = 38.0293;
const CENTER_LON = -78.4767; // Charlottesville, VA

// Helper to create jagged polygon (simulating isochrone)
const generateJaggedPoly = (centerLat: number, centerLon: number, radiusMeters: number, points: number, noise: number) => {
  const coords: [number, number][] = [];
  const rDeg = radiusMeters / 111300;
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const rNoise = 1 + (Math.random() - 0.5) * noise;
    const r = rDeg * rNoise;
    
    const lat = centerLat + r * Math.sin(angle);
    const lon = centerLon + r * Math.cos(angle);
    coords.push([lat, lon]);
  }
  return coords;
};

// Create Zones (Ordered Bronze -> Silver -> Gold so they stack correctly on map)
export const MOCK_ZONES: HunterZone[] = [
  {
    id: 'z-bronze',
    tier: HunterTier.BRONZE,
    label: '60-75 min drive',
    coordinates: generateJaggedPoly(CENTER_LAT, CENTER_LON, 18000, 40, 0.4)
  },
  {
    id: 'z-silver',
    tier: HunterTier.SILVER,
    label: '40-60 min drive',
    coordinates: generateJaggedPoly(CENTER_LAT, CENTER_LON, 12000, 35, 0.35)
  },
  {
    id: 'z-gold',
    tier: HunterTier.GOLD,
    label: '0-40 min drive',
    coordinates: generateJaggedPoly(CENTER_LAT, CENTER_LON, 6000, 30, 0.3)
  }
];

// Helper to determine zone based on distance (simplified check)
const getZoneFromLocation = (lat: number, lon: number): HunterTier => {
  const dist = Math.sqrt(Math.pow(lat - CENTER_LAT, 2) + Math.pow(lon - CENTER_LON, 2)) * 111300;
  if (dist < 7000) return HunterTier.GOLD;
  if (dist < 14000) return HunterTier.SILVER;
  if (dist < 20000) return HunterTier.BRONZE;
  return HunterTier.NONE;
};

const generateListings = (count: number): PropertyListing[] => {
  return Array.from({ length: count }).map((_, i) => {
    // 1. Generate Location
    // Spread them out to cover different zones
    const distFactor = Math.random(); 
    const radius = 2000 + (distFactor * 16000); // 2km to 18km
    const angle = Math.random() * 2 * Math.PI;
    const rDeg = radius / 111300;
    
    const lat = CENTER_LAT + rDeg * Math.sin(angle);
    const lon = CENTER_LON + rDeg * Math.cos(angle);

    // 2. Determine Zone Tier
    const zoneTier = getZoneFromLocation(lat, lon);

    // 3. Generate Price & Price Tier
    // Price cap 275k. Gold < 225, Silver 225-250, Bronze > 250
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
      address: `${Math.floor(Math.random() * 999)} ${['Oak', 'Maple', 'Main', 'Broad', 'Market'][Math.floor(Math.random()*5)]} St, Charlottesville VA`,
      beds: Math.floor(Math.random() * 4) + 2,
      baths: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 900,
      listing_type: 'Single Family',
      status: Math.random() > 0.2 ? ListingStatus.FOR_SALE : ListingStatus.PENDING,
      image_url: `https://picsum.photos/seed/${i + 100}/400/300`,
      location: { lat, lon },
      price_tier: priceTier,
      zone_tier: zoneTier,
      gis_contour: 10,
      days_on_market: Math.floor(Math.random() * 45)
    };
  });
};

export const MOCK_LISTINGS = generateListings(80);