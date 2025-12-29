import React, { useState, useMemo, useEffect } from 'react';
import { FilterSidebar } from './components/FilterSidebar';
import { PropertyCard } from './components/PropertyCard';
import { MapContainerView } from './components/MapContainer';
import { fetchRealEstateData } from './services/api';
import { MOCK_LISTINGS, MOCK_ZONES } from './services/mockData';
import { FilterState, HunterTier, ListingStatus, PropertyListing, HunterZone } from './types';
import { Map as MapIcon, List, Home, AlertCircle, Sparkles, WifiOff, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [allListings, setAllListings] = useState<PropertyListing[]>([]);
  const [zones, setZones] = useState<HunterZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);
  
  // Tracking state (Favorites / Rejected)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 275000, 
    minBeds: 0,
    minBaths: 0,
    priceTiers: [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE, HunterTier.NONE],
    zoneTiers: [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE, HunterTier.NONE],
    status: [ListingStatus.FOR_SALE],
    favoritesOnly: false,
    hideSeen: false,
  });

  // Map & View State
  const [showMapMobile, setShowMapMobile] = useState(false);

  // --- Effects ---
  
  const loadData = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const { listings, zones } = await fetchRealEstateData();
      setAllListings(listings);
      setZones(zones);
    } catch (err) {
      console.warn("API unreachable, using mock data.");
      setApiError(true);
      setAllListings(MOCK_LISTINGS);
      setZones(MOCK_ZONES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Filter Logic ---

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleReject = (id: string) => {
    setRejected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter Pipeline
  const filteredListings = useMemo(() => {
    return allListings.filter(item => {
      // 1. Basic Filters
      if (item.price < filters.minPrice) return false;
      if (filters.maxPrice > 0 && item.price > filters.maxPrice) return false;
      if (item.beds < filters.minBeds) return false;
      if (item.baths < filters.minBaths) return false;
      
      // 2. Tier Filters
      if (!filters.priceTiers.includes(item.price_tier)) return false;
      if (!filters.zoneTiers.includes(item.zone_tier)) return false;

      // 3. Status & Tracking
      if (!filters.status.includes(item.status)) return false;
      if (filters.favoritesOnly && !favorites.has(item.id)) return false;
      if (filters.hideSeen && rejected.has(item.id)) return false;

      return true;
    });
  }, [allListings, filters, favorites, rejected]);

  // Sort
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Sort by Price Ascending (Cheaper is usually better in this context) 
      return a.price - b.price;
    });
  }, [filteredListings, favorites]);

  const scrollToListItem = (id: string) => {
    setFocusedId(id);
    const element = document.getElementById(`card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-100 relative">
      
      {/* Error Toast Notification */}
      {apiError && (
        <div className="absolute top-20 right-6 z-[9999] animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="bg-slate-900 border border-red-500/50 rounded-lg shadow-2xl p-4 flex items-start gap-3 max-w-sm backdrop-blur-md">
            <div className="bg-red-500/10 p-2 rounded-full">
              <WifiOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-400">Connection Failed</h4>
              <p className="text-xs text-slate-400 mt-1">Unable to reach HouseHunter API. Loaded offline mock data.</p>
              <button 
                onClick={loadData}
                className="mt-2 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded transition-colors"
              >
                <RefreshCcw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">HouseHunter<span className="text-indigo-400">.ai</span></h1>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-1">Geospatial Intelligence Engine</p>
          </div>
        </div>
        
        {/* Mobile View Toggle */}
        <div className="md:hidden flex gap-2">
           <button 
             onClick={() => setShowMapMobile(false)}
             className={`p-2 rounded ${!showMapMobile ? 'bg-indigo-900 text-indigo-300' : 'text-slate-500'}`}
           >
             <List className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setShowMapMobile(true)}
             className={`p-2 rounded ${showMapMobile ? 'bg-indigo-900 text-indigo-300' : 'text-slate-500'}`}
           >
             <MapIcon className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar Filter */}
        <div className="hidden md:block z-10 h-full">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            totalCount={allListings.length}
            filteredCount={filteredListings.length}
          />
        </div>

        {/* Listings List */}
        <div className={`
          flex-1 md:max-w-md h-full overflow-y-auto bg-slate-950 border-r border-slate-800
          ${showMapMobile ? 'hidden' : 'block'}
        `}>
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
               <span className="text-sm font-medium animate-pulse">Syncing with Intelligence Network...</span>
             </div>
          ) : sortedListings.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
               <div className="bg-slate-900 p-4 rounded-full mb-3 border border-slate-800">
                 <AlertCircle className="w-8 h-8 text-slate-600" />
               </div>
               <p className="font-bold text-slate-400 text-lg">No properties found</p>
               <p className="text-sm mt-1 max-w-[200px]">
                   Try adjusting your filters to widen the hunt.
               </p>
             </div>
          ) : (
            <div className="p-4 space-y-4 pb-20">
               <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Top Matches</span>
                    <div className="flex items-center gap-1 text-[10px] bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                        <Sparkles className="w-3 h-3" />
                        AI RANKED
                    </div>
               </div>
               {sortedListings.map(item => (
                 <div key={item.id} id={`card-${item.id}`}>
                    <PropertyCard 
                      listing={item}
                      isFavorite={favorites.has(item.id)}
                      isRejected={rejected.has(item.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleReject={handleToggleReject}
                      onFocus={setFocusedId}
                    />
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Map View */}
        <div className={`
          flex-1 h-full bg-slate-900 relative
          ${!showMapMobile ? 'hidden md:block' : 'block'}
        `}>
           <MapContainerView 
             listings={sortedListings} 
             zones={zones}
             focusedId={focusedId}
             onMarkerClick={scrollToListItem}
           />
        </div>

      </div>
    </div>
  );
};

export default App;