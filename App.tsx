import React, { useState, useMemo, useEffect } from 'react';
import { FilterSidebar } from './components/FilterSidebar';
import { PropertyCard } from './components/PropertyCard';
import { MapContainerView } from './components/MapContainer';
import { fetchRealEstateData } from './services/api';
import { MOCK_LISTINGS, MOCK_ZONES } from './services/mockData';
import { FilterState, HunterTier, ListingStatus, PropertyListing, HunterZone } from './types';
import { Map as MapIcon, List, Home, AlertCircle, Sparkles, WifiOff, RefreshCcw, ArrowUpDown, Eye, Heart, EyeOff } from 'lucide-react';

type ViewMode = 'all' | 'favorites' | 'rejected' | 'history' | 'undecided';
type SortOption = 'price-asc' | 'price-desc' | 'newest';

const App: React.FC = () => {
  // --- State ---
  const [allListings, setAllListings] = useState<PropertyListing[]>([]);
  const [zones, setZones] = useState<HunterZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);

  // Tracking state (Favorites / Rejected)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('househunter_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.warn('Failed to parse favorites from storage', e);
      return new Set();
    }
  });

  const [rejected, setRejected] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('househunter_rejected');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.warn('Failed to parse rejected from storage', e);
      return new Set();
    }
  });

  const [viewed, setViewed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('househunter_viewed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.warn('Failed to parse viewed from storage', e);
      return new Set();
    }
  });

  const [undecided, setUndecided] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('househunter_undecided');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.warn('Failed to parse undecided from storage', e);
      return new Set();
    }
  });

  // Filters
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem('househunter_filters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse filters from storage', e);
    }
    // Default Fallback
    return {
      minPrice: 0,
      maxPrice: 275000,
      minBeds: 0,
      minBaths: 0,
      priceTiers: [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE, HunterTier.ZINC],
      zoneTiers: [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE, HunterTier.ZINC],
      visibleZones: [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE],
      status: [ListingStatus.FOR_SALE],
      favoritesOnly: false,
      hideSeen: false,
      addressQuery: '',
    };
  });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortOption, setSortOption] = useState<SortOption>('price-asc');

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

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('househunter_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('househunter_rejected', JSON.stringify([...rejected]));
  }, [rejected]);

  useEffect(() => {
    localStorage.setItem('househunter_viewed', JSON.stringify([...viewed]));
  }, [viewed]);

  useEffect(() => {
    localStorage.setItem('househunter_undecided', JSON.stringify([...undecided]));
  }, [undecided]);

  useEffect(() => {
    localStorage.setItem('househunter_filters', JSON.stringify(filters));
  }, [filters]);

  // --- Filter Logic ---

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Exclusivity: Remove from others
        setRejected(prevR => {
          const nextR = new Set(prevR);
          nextR.delete(id);
          return nextR;
        });
        setUndecided(prevU => {
          const nextU = new Set(prevU);
          nextU.delete(id);
          return nextU;
        });
      }
      return next;
    });
  };

  const handleToggleReject = (id: string) => {
    setRejected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Exclusivity
        setFavorites(prevF => {
          const nextF = new Set(prevF);
          nextF.delete(id);
          return nextF;
        });
        setUndecided(prevU => {
          const nextU = new Set(prevU);
          nextU.delete(id);
          return nextU;
        });
      }
      return next;
    });
  };

  const handleToggleUndecided = (id: string) => {
    setUndecided(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Exclusivity
        setFavorites(prevF => {
          const nextF = new Set(prevF);
          nextF.delete(id);
          return nextF;
        });
        setRejected(prevR => {
          const nextR = new Set(prevR);
          nextR.delete(id);
          return nextR;
        });
      }
      return next;
    });
  };

  const handleMarkViewed = (id: string) => {
    if (!viewed.has(id)) {
      setViewed(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  // Filter Pipeline
  const filteredListings = useMemo(() => {
    return allListings.filter(item => {
      // 1. Basic Filters
      if (item.price < filters.minPrice) return false;
      if (filters.maxPrice > 0 && item.price > filters.maxPrice) return false;
      if (item.beds < filters.minBeds) return false;
      if (item.baths < filters.minBaths) return false;

      // Address Filter
      if (filters.addressQuery && !item.address.toLowerCase().includes(filters.addressQuery.toLowerCase())) return false;

      // 2. Tier Filters
      if (!filters.priceTiers.includes(item.price_tier)) return false;
      if (!filters.zoneTiers.includes(item.zone_tier)) return false;

      // 3. Status & Tracking
      if (!filters.status.includes(item.status)) return false;

      // Filter out 'Viewed' if the checkbox is checked
      if (filters.hideSeen && viewed.has(item.id)) return false;

      // View Mode Logic replaces the old boolean flags
      if (viewMode === 'favorites') {
        if (!favorites.has(item.id)) return false;
      } else if (viewMode === 'rejected') {
        if (!rejected.has(item.id)) return false;
      } else if (viewMode === 'undecided') {
        if (!undecided.has(item.id)) return false;
      } else if (viewMode === 'history') {
        if (!viewed.has(item.id)) return false;
      } else {
        // 'all' mode - hide rejected by default unless specifically asked?
        // Usually 'all' implies "Active House Hunt", so hide rejected.
        if (rejected.has(item.id)) return false;
      }

      return true;
    });
  }, [allListings, filters, favorites, rejected, viewMode]);

  // Filter Zones for Map
  const filteredZones = useMemo(() => {
    return zones.filter(z => filters.visibleZones.includes(z.tier));
  }, [zones, filters.visibleZones]);

  // Sort
  // Sort
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      // Always put favorites at the top unless we are explicitly in 'rejected' mode?
      // Actually, if we are sorting, we might want strict sorting.
      // But let's keep the "Favorites First" logic for 'all' mode as it's nice.
      if (viewMode === 'all') {
        const aFav = favorites.has(a.id);
        const bFav = favorites.has(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
      }

      // Sort Options
      switch (sortOption) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return (a.days_on_market || 0) - (b.days_on_market || 0); // Newest = smallest days? Or logic inverse? Usually "Newest" means "Listed recently" -> 0 days.
        // If days_on_market is "Days", then ascending (0, 1, 2) is "Newest first".
        default: return a.price - b.price;
      }
    });
  }, [filteredListings, favorites, viewMode, sortOption]);

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
          <div className="p-4 flex flex-col h-full">
            <div className="flex flex-col gap-4 px-1 mb-4 flex-shrink-0">

              {/* View Mode Tabs */}
              <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800 gap-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <List className="w-3.5 h-3.5" /> All
                </button>
                <button
                  onClick={() => setViewMode('favorites')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'favorites' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" /> Favorites
                </button>
                <button
                  onClick={() => setViewMode('undecided')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'undecided' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Undecided
                </button>
                <button
                  onClick={() => setViewMode('rejected')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'rejected' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hidden
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> History
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{sortedListings.length} Properties</span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest Listed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto -mx-4 px-4 pb-20 space-y-4">
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
                sortedListings.map(item => (
                  <div key={item.id} id={`card-${item.id}`}>
                    <PropertyCard
                      listing={item}
                      isFavorite={favorites.has(item.id)}
                      isRejected={rejected.has(item.id)}
                      isUndecided={undecided.has(item.id)}
                      isViewed={viewed.has(item.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleReject={handleToggleReject}
                      onToggleUndecided={handleToggleUndecided}
                      onMarkViewed={handleMarkViewed}
                      onFocus={setFocusedId}
                      isFocused={focusedId === item.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className={`
          flex-1 h-full bg-slate-900 relative
          ${!showMapMobile ? 'hidden md:block' : 'block'}
        `}>
          <MapContainerView
            listings={sortedListings}
            zones={filteredZones}
            focusedId={focusedId}
            onMarkerClick={scrollToListItem}
            onBackgroundClick={() => setFocusedId(null)}
            viewed={viewed}
          />
        </div>

      </div>
    </div>
  );
};

export default App;