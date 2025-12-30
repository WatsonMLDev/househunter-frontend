import React from 'react';
import { FilterState, HunterTier, ListingStatus } from '../types';
import { SlidersHorizontal, CheckCircle2, XCircle, Map as MapIcon, DollarSign } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  totalCount,
  filteredCount,
}) => {
  const handlePriceTierToggle = (tier: HunterTier) => {
    setFilters((prev) => {
      const exists = prev.priceTiers.includes(tier);
      return {
        ...prev,
        priceTiers: exists ? prev.priceTiers.filter((t) => t !== tier) : [...prev.priceTiers, tier],
      };
    });
  };

  const handleZoneTierToggle = (tier: HunterTier) => {
    setFilters((prev) => {
      const exists = prev.zoneTiers.includes(tier);
      return {
        ...prev,
        zoneTiers: exists ? prev.zoneTiers.filter((t) => t !== tier) : [...prev.zoneTiers, tier],
      };
    });
  };

  const handleVisibleZoneToggle = (tier: HunterTier) => {
    setFilters((prev) => {
      const exists = prev.visibleZones.includes(tier);
      return {
        ...prev,
        visibleZones: exists ? prev.visibleZones.filter((t) => t !== tier) : [...prev.visibleZones, tier],
      };
    });
  };

  const tiers = [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE];
  const zoneTiers = [HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE, HunterTier.ZINC];

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-30">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-lg text-slate-100 tracking-tight">Filters</h2>
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {filteredCount} results found
        </p>
      </div>

      <div className="p-6 space-y-8">

        {/* Address Search */}
        <section>
          <div className="relative group">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <MapIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={filters.addressQuery || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, addressQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none placeholder-slate-500"
              placeholder="Search address (e.g. Inglewood)"
            />
          </div>
        </section>

        {/* Price Tiers */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200 tracking-tight">Price Tiers</h3>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Cap $275k</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tiers.map((tier) => {
              const isActive = filters.priceTiers.includes(tier);
              let baseClass = "px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 flex-1 text-center";
              let activeClass = "";

              switch (tier) {
                case HunterTier.GOLD:
                  activeClass = isActive
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-500/50';
                  break;
                case HunterTier.SILVER:
                  activeClass = isActive
                    ? 'bg-slate-400/10 border-slate-400 text-slate-300'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-400/50 hover:text-slate-400/50';
                  break;
                case HunterTier.BRONZE:
                  activeClass = isActive
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-orange-500/50 hover:text-orange-500/50';
                  break;
              }

              return (
                <button
                  key={tier}
                  onClick={() => handlePriceTierToggle(tier)}
                  className={`${baseClass} ${activeClass}`}
                  title={tier === HunterTier.GOLD ? "< $225k" : tier === HunterTier.SILVER ? "$225k - $250k" : "> $250k"}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </section>

        {/* Map Layers (Isochrones) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200 tracking-tight">Map Layers</h3>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[HunterTier.GOLD, HunterTier.SILVER, HunterTier.BRONZE].map((tier) => {
              const isActive = filters.visibleZones.includes(tier);
              let label = "";
              let colorClass = "";

              if (tier === HunterTier.GOLD) { label = "0 - 40 Minutes"; colorClass = "bg-yellow-400"; }
              if (tier === HunterTier.SILVER) { label = "40 - 60 Minutes"; colorClass = "bg-slate-400"; }
              if (tier === HunterTier.BRONZE) { label = "60 - 75 Minutes"; colorClass = "bg-orange-500"; }

              return (
                <label
                  key={`layer-${tier}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isActive ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${isActive ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-600'}`}>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                      <span>{tier} Zone</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isActive}
                    onChange={() => handleVisibleZoneToggle(tier)}
                  />
                </label>
              );
            })}
          </div>
        </section>

        {/* Property Location Filters */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200 tracking-tight">Filter by Location</h3>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {zoneTiers.map((tier) => {
              const isActive = filters.zoneTiers.includes(tier);
              let label = "";
              let borderColor = "";

              if (tier === HunterTier.GOLD) { label = "0 - 40 Minutes"; borderColor = "border-yellow-500"; }
              if (tier === HunterTier.SILVER) { label = "40 - 60 Minutes"; borderColor = "border-slate-400"; }
              if (tier === HunterTier.BRONZE) { label = "60 - 75 Minutes"; borderColor = "border-orange-500"; }
              if (tier === HunterTier.ZINC) { label = "75+ Minutes"; borderColor = "border-slate-600"; }

              return (
                <button
                  key={`prop-${tier}`}
                  onClick={() => handleZoneTierToggle(tier)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${isActive ? `bg-slate-800 ${borderColor} text-slate-200` : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tier === HunterTier.GOLD ? 'bg-yellow-400' : tier === HunterTier.SILVER ? 'bg-slate-400' : tier === HunterTier.BRONZE ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
                    <span>{tier}</span>
                  </div>
                  <span className="opacity-70">{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Price Range */}
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-4 tracking-tight">Price Range</h3>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                className="w-full pl-6 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none placeholder-slate-600"
                placeholder="0"
              />
            </div>
            <span className="text-slate-600">-</span>
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full pl-6 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none placeholder-slate-600"
                placeholder="275,000"
                max={275000}
              />
            </div>
          </div>
        </section>

        {/* Specs */}
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-4 tracking-tight">Property Specs</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bedrooms</label>
              <select
                value={filters.minBeds}
                onChange={(e) => setFilters(prev => ({ ...prev, minBeds: Number(e.target.value) }))}
                className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value={0}>Any Beds</option>
                <option value={2}>2+ Beds</option>
                <option value={3}>3+ Beds</option>
                <option value={4}>4+ Beds</option>
                <option value={5}>5+ Beds</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bathrooms</label>
              <select
                value={filters.minBaths}
                onChange={(e) => setFilters(prev => ({ ...prev, minBaths: Number(e.target.value) }))}
                className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value={0}>Any Baths</option>
                <option value={1}>1+ Baths</option>
                <option value={2}>2+ Baths</option>
                <option value={3}>3+ Baths</option>
              </select>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="pt-2 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={!filters.status.includes(ListingStatus.PENDING)}
                onChange={() => setFilters(prev => ({
                  ...prev,
                  status: prev.status.includes(ListingStatus.PENDING)
                    ? prev.status.filter(s => s !== ListingStatus.PENDING)
                    : [...prev.status, ListingStatus.PENDING]
                }))}
                className="peer h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Hide Pending / Contingent</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={filters.hideSeen}
                onChange={() => setFilters(prev => ({
                  ...prev,
                  hideSeen: !prev.hideSeen
                }))}
                className="peer h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Hide Viewed Properties</span>
          </label>
        </section>
      </div>
    </div>
  );
};