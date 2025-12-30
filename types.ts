export enum ListingStatus {
  FOR_SALE = 'FOR_SALE',
  PENDING = 'PENDING',
  SOLD = 'SOLD'
}

export enum HunterTier {
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
  NONE = 'None'
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
  zoneTiers: HunterTier[];  // Filter for Location
  status: ListingStatus[];
  favoritesOnly: boolean;
  hideSeen: boolean;
}