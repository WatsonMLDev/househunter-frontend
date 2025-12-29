import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import { PropertyListing, HunterZone, HunterTier, GeoPoint } from '../types';
import L from 'leaflet';

// Fix for default Leaflet icons
const iconBase = "https://unpkg.com/leaflet@1.9.4/dist/images/";
const DefaultIcon = L.icon({
  iconUrl: `${iconBase}marker-icon.png`,
  shadowUrl: `${iconBase}marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  listings: PropertyListing[];
  zones: HunterZone[];
  focusedId: string | null;
  onMarkerClick: (id: string) => void;
}

// --- Sub Components ---

const MapController: React.FC<{ center: GeoPoint }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lon], 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

// Custom Marker Generator - Uses Price Tier for Color
const createCustomIcon = (priceTier: HunterTier, isFocused: boolean) => {
  let color = '#64748b'; // default slate
  // Colors for Price Tiers
  if (priceTier === HunterTier.GOLD) color = '#10b981'; // Emerald (Good price)
  if (priceTier === HunterTier.SILVER) color = '#cbd5e1'; // Slate (Mid price)
  if (priceTier === HunterTier.BRONZE) color = '#f97316'; // Orange (High price)

  const size = isFocused ? 32 : 14;
  const pulseClass = isFocused ? 'marker-pulse' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="${pulseClass}" style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${isFocused ? '3px' : '2px'} solid ${isFocused ? '#ffffff' : '#1e293b'};
        box-shadow: 0 0 10px ${color}80;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        ${isFocused ? '<div style="width: 6px; height: 6px; background: #1e293b; border-radius: 50%;"></div>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

export const MapContainerView: React.FC<MapViewProps> = ({ 
    listings, 
    zones, 
    focusedId, 
    onMarkerClick
}) => {
  const center = listings.length > 0 
    ? listings[0].location 
    : { lat: 38.0293, lon: -78.4767 };

  return (
    <div className="relative h-full w-full bg-slate-950">
        
        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-slate-700 z-[400] text-xs min-w-[200px]">
              
              {/* Zone Legend */}
              <div className="mb-4 pb-4 border-b border-slate-800">
                <h4 className="font-bold text-slate-200 mb-2 text-xs uppercase tracking-wider">Drive Time Zones</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 bg-yellow-400/30 border border-yellow-400 rounded-sm"></div>
                        <span className="text-slate-400">Gold (0-40m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 bg-slate-400/30 border border-slate-400 rounded-sm"></div>
                        <span className="text-slate-400">Silver (40-60m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 bg-orange-500/30 border border-orange-500 rounded-sm"></div>
                        <span className="text-slate-400">Bronze (60-75m)</span>
                    </div>
                </div>
              </div>

              {/* Price Legend */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 text-xs uppercase tracking-wider">Listing Price</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-400">Under $225k</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                        <span className="text-slate-400">$225k - $250k</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-slate-400">$250k - $275k</span>
                    </div>
                </div>
              </div>
        </div>

        <MapContainer 
        center={[center.lat, center.lon]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0, background: '#0f172a' }}
        zoomControl={false}
        >
        <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {listings.length > 0 && <MapController center={listings[0].location} />}

        {/* Render Zones (Isochrones) */}
        {zones.map(zone => {
            // Colors per request: Gold=Yellow, Silver=Grey, Bronze=Orange
            let color = '#334155';
            if (zone.tier === HunterTier.GOLD) color = '#facc15'; // Yellow
            if (zone.tier === HunterTier.SILVER) color = '#94a3b8'; // Grey
            if (zone.tier === HunterTier.BRONZE) color = '#f97316'; // Orange
            
            return (
            <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 10',
                    lineCap: 'round'
                }}
            >
                <Popup className="zone-popup">
                    <div className="p-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                            <h3 className="font-bold text-slate-200">{zone.tier} Zone</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            {zone.label}
                        </p>
                    </div>
                </Popup>
            </Polygon>
            );
        })}

        {/* Render Property Markers */}
        {listings.map(listing => (
            <Marker
            key={listing.id}
            position={[listing.location.lat, listing.location.lon]}
            // Color markers by Price Tier so user sees "Good Deals" instantly
            icon={createCustomIcon(listing.price_tier, focusedId === listing.id)}
            eventHandlers={{
                click: () => onMarkerClick(listing.id)
            }}
            zIndexOffset={focusedId === listing.id ? 1000 : 0}
            >
            <Popup>
                <div className="text-sm min-w-[160px]">
                    <div className="mb-2">
                        <strong className="block text-slate-100 text-lg leading-tight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(listing.price)}</strong>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wide">{listing.price_tier} PRICE TIER</span>
                    </div>
                    <span className="block text-slate-400 text-xs mb-2 border-b border-slate-700 pb-2">{listing.address}</span>
                    
                    <div className="flex items-center justify-between">
                         <span className="text-[10px] text-slate-500">{listing.beds}bd, {listing.baths}ba</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${listing.zone_tier === HunterTier.GOLD ? 'bg-yellow-500/20 text-yellow-500' : listing.zone_tier === HunterTier.SILVER ? 'bg-slate-500/20 text-slate-400' : 'bg-orange-500/20 text-orange-500'}`}>
                             {listing.zone_tier} Zone
                         </span>
                    </div>
                </div>
            </Popup>
            </Marker>
        ))}
        </MapContainer>
    </div>
  );
};