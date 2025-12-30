import React from 'react';
import { PropertyListing, HunterTier, ListingStatus } from '../types';
import { Heart, EyeOff, BedDouble, Bath, Square, MapPin, DollarSign, Timer, Eye } from 'lucide-react';

interface PropertyCardProps {
  listing: PropertyListing;
  isFavorite: boolean;
  isRejected: boolean;
  isUndecided: boolean;
  isViewed: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleReject: (id: string) => void;
  onToggleUndecided: (id: string) => void;
  onFocus: (id: string) => void;
  onMarkViewed: (id: string) => void;
  isFocused?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  listing,
  isFavorite,
  isRejected,
  isUndecided,
  isViewed,
  onToggleFavorite,
  onToggleReject,
  onToggleUndecided,
  onFocus,
  onMarkViewed,
  isFocused = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceBadge = (tier: HunterTier) => {
    switch (tier) {
      case HunterTier.GOLD: return 'bg-emerald-500/90 text-slate-900 border border-emerald-400';
      case HunterTier.SILVER: return 'bg-slate-200/90 text-slate-900 border border-slate-300';
      case HunterTier.BRONZE: return 'bg-orange-400/90 text-slate-900 border border-orange-300';
      default: return 'bg-gray-700/90 text-gray-300';
    }
  };

  const getZoneColor = (tier: HunterTier) => {
    switch (tier) {
      case HunterTier.GOLD: return 'text-yellow-400';
      case HunterTier.SILVER: return 'text-slate-400';
      case HunterTier.BRONZE: return 'text-orange-400';
      default: return 'text-slate-600';
    }
  };

  const handleCardClick = () => {
    onMarkViewed(listing.id);
    if (listing.property_url && listing.property_url !== '#') {
      window.open(listing.property_url, '_blank');
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-slate-900 border rounded-xl shadow-lg transition-all duration-300 overflow-hidden cursor-pointer 
        ${isRejected ? 'opacity-30 grayscale' : ''}
        ${isViewed ? 'bg-slate-900/50' : ''}
        ${isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-900/50 scale-[1.02] z-10' : 'border-slate-800 hover:shadow-indigo-900/10 hover:border-slate-700'}
      `}
      onMouseEnter={() => onFocus(listing.id)}
      onClick={handleCardClick}
    >
      {/* Image Section - HIDDEN FOR PERFORMANCE
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img 
          src={listing.image_url} 
          alt={listing.address} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start bg-gradient-to-b from-slate-950/80 to-transparent">
            <div className="flex gap-2">
                <span className={`flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded backdrop-blur-sm ${getPriceBadge(listing.price_tier)}`}>
                    <DollarSign className="w-3 h-3" />
                    {listing.price_tier}
                </span>
            </div>
            
            {listing.status === ListingStatus.PENDING && (
                <span className="px-2 py-1 text-[10px] bg-rose-500/90 text-white font-bold rounded backdrop-blur-sm shadow-sm border border-rose-400/50">
                    PENDING
                </span>
            )}
        </div>

        <button 
           onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
           className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-rose-400'}`}
        >
           <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      */}

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">{formatPrice(listing.price)}</h3>
            <div className="flex gap-2 items-center">
              {/* Re-added Price Badge here since image is hidden */}
              <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${getPriceBadge(listing.price_tier)}`}>
                {listing.price_tier}
              </span>
              {/* Favorite Button (Moved here since image is hidden) */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
                className={`p-1.5 rounded-full border border-slate-700 transition-all ${isFavorite ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-slate-800 text-slate-500 hover:text-rose-400'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center text-slate-400 text-sm mt-2">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span className="truncate font-medium">{listing.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">{listing.beds} <span className="text-slate-500 font-normal">bd</span></span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">{listing.baths} <span className="text-slate-500 font-normal">ba</span></span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">{listing.sqft.toLocaleString()} <span className="text-slate-500 font-normal">sqft</span></span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${getZoneColor(listing.zone_tier)}`}>
            <Timer className="w-3.5 h-3.5" />
            {listing.zone_tier} Zone
          </div>

          <div className="flex items-center gap-2">
            {isViewed && !isRejected && !isFavorite && !isUndecided && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-wide mr-2">
                <Eye className="w-3 h-3" /> Viewed
              </span>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); onToggleUndecided(listing.id); }}
              className={`p-1.5 rounded-full border border-slate-700 transition-all ${isUndecided ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'bg-slate-800 text-slate-500 hover:text-amber-400'}`}
              title="Mark as Undecided"
            >
              <span className="text-xs font-bold">?</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleReject(listing.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isRejected ? 'bg-slate-800 text-slate-500' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              {isRejected ? 'Hidden' : 'Hide'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};