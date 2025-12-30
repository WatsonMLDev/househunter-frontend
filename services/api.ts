import { PropertyListing, HunterZone, HunterTier, ListingStatus } from '../types';
import { zonesData } from './zonesData'; // Import local zones as TS module

const API_BASE_URL = 'http://localhost:8000'; // Standard FastAPI port

// Helper to calculate Price Tier (Client-side logic)
const calculatePriceTier = (price: number): HunterTier => {
  if (price < 225000) return HunterTier.GOLD;
  if (price >= 225000 && price <= 250000) return HunterTier.SILVER;
  return HunterTier.BRONZE;
};

// Helper to determine Status (Client-side mapping if API differs, or direct)
const mapStatus = (statusStr: string): ListingStatus => {
  const s = statusStr.toLowerCase();
  if (s.includes('pending') || s.includes('contingent')) return ListingStatus.PENDING;
  if (s.includes('sold')) return ListingStatus.SOLD;
  return ListingStatus.FOR_SALE;
};

// Helper to map string tier from API to Enum
const mapTier = (tierStr: string): HunterTier => {
  switch (tierStr?.toLowerCase()) {
    case 'gold': return HunterTier.GOLD;
    case 'silver': return HunterTier.SILVER;
    case 'bronze': return HunterTier.BRONZE;
    default: return HunterTier.ZINC;
  }
};

const processLocalZones = (): HunterZone[] => {
  try {
    const featureCollection = zonesData[0] as any;
    if (!featureCollection || !featureCollection.features) return [];

    return featureCollection.features.map((f: any, index: number) => {
      let rawCoords = [];
      if (f.geometry.type === 'Polygon') {
        rawCoords = f.geometry.coordinates[0];
      } else if (f.geometry.type === 'MultiPolygon') {
        rawCoords = f.geometry.coordinates[0][0];
      }

      const coordinates: [number, number][] = rawCoords.map((c: number[]) => [c[1], c[0]]);

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
    console.warn("Failed to process local zones", e);
    return [];
  }
};

export const fetchRealEstateData = async (): Promise<{ listings: PropertyListing[], zones: HunterZone[] }> => {
  // Use local zones directly - faster and reliable
  const zones = processLocalZones();

  try {
    // Only fetch listings from API
    const propsRes = await fetch(`${API_BASE_URL}/properties`);

    if (!propsRes.ok) {
      throw new Error(`API Error: ${propsRes.status}`);
    }

    const propsData = await propsRes.json();

    // Transform Listings
    const listings: PropertyListing[] = propsData.map((p: any) => ({
      id: p.id.toString(),
      price: p.price,
      address: p.address,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft || 0,
      listing_type: p.listing_type || 'Single Family',
      status: mapStatus(p.status || ''),
      image_url: p.image_url || `https://picsum.photos/seed/${p.id}/400/300`,
      property_url: p.property_url || '#',
      location: {
        lat: p.location?.lat || p.lat || 0,
        lon: p.location?.lon || p.lon || 0
      },
      price_tier: calculatePriceTier(p.price),
      zone_tier: mapTier(p.gis_tier),
      days_on_market: p.days_on_market || Math.floor(Math.random() * 30),
    }));

    return { listings, zones };

  } catch (error) {
    console.warn("API unreachable, falling back to mock data.", error);
    throw error; // Re-throw to trigger fallback in UI
  }
};