export enum ListingStatus {
  FOR_SALE = 'FOR_SALE',
  PENDING = 'PENDING',
  SOLD = 'SOLD'
}

export enum HunterTier {
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
  ZINC = 'Zinc'
}

export interface PropertyChangeLog {
  id: string;
  property_id: string;
  timestamp: string;
  changes: Record<string, { old: any; new: any }>;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface PropertyListing {
  id: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  listing_type: string;
  status: ListingStatus;
  image_url: string;
  property_url: string; // Link to Zillow/Realtor
  location: GeoPoint;
  price_tier: HunterTier; // Based on price (<225k, etc)
  zone_tier: HunterTier;  // Based on location (Isochrone)
  days_on_market: number;
  created_at?: string; // ISO timestamp of discovery
  latest_change?: string; // ISO timestamp of last update
}

export interface HunterZone {
  id: string;
  tier: HunterTier;
  coordinates: [number, number][];
  label: string;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  priceTiers: HunterTier[]; // Filter for Price
  zoneTiers: HunterTier[];  // Filter for Location (Property Filtering)
  visibleZones: HunterTier[]; // Filter for Map Overlay (Isochrones)
  status: ListingStatus[];
  favoritesOnly: boolean;
  hideSeen: boolean;
  addressQuery: string;
}