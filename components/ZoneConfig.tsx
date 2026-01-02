import React, { useState } from 'react';
import { X, MapPin, Save, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface ZoneConfigProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de/isochrone";

export function ZoneConfig({ isOpen, onClose }: ZoneConfigProps) {
    const [lat, setLat] = useState<string>("52.5200");
    const [lon, setLon] = useState<string>("13.4050");
    const [gold, setGold] = useState<number>(30);
    const [silver, setSilver] = useState<number>(45);
    const [bronze, setBronze] = useState<number>(60);
    const [valhallaUrl, setValhallaUrl] = useState<string>(DEFAULT_VALHALLA_URL);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                handleSearch(searchQuery);
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setSearching(true);
        setMessage(null);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (e: any) {
            console.error("Geocoding failed", e);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectSuggestion = (item: any) => {
        setLat(item.lat);
        setLon(item.lon);
        setSearchQuery(item.display_name);
        setShowSuggestions(false);
        setMessage({ type: 'success', text: `Selected: ${item.display_name.split(',')[0]}` });
    };


    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const payload = {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                contours: [gold, silver, bronze],
                valhalla_url: valhallaUrl,
                costing: "auto"
            };

            const res = await fetch('http://localhost:8000/admin/generate-zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to generate zones");
            }

            const data = await res.json();
            setMessage({ type: 'success', text: data.message });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        Configure Isochrones
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Location Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Center Location</h3>

                        {/* Search Bar */}
                        <div className="flex gap-2 mb-2 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    placeholder="Search place (e.g. Berlin)..."
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-md pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                />

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-md shadow-2xl z-20 max-h-48 overflow-y-auto">
                                        {suggestions.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-600/20 hover:text-white border-b border-slate-800 last:border-0 transition-colors"
                                            >
                                                {item.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="px-3 py-2 bg-slate-800 text-slate-400 rounded-md flex items-center justify-center min-w-[3rem]">
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    className="w-full bg-[#334155] border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={lon}
                                    onChange={(e) => setLon(e.target.value)}
                                    className="w-full bg-[#334155] border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-700/50" />

                    {/* Tiers Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Time Contours (Minutes)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-yellow-500/10 rounded-md blur-sm group-hover:bg-yellow-500/20 transition-all" />
                                <div className="relative">
                                    <label className="block text-xs text-yellow-500 mb-1 font-bold">GOLD</label>
                                    <input
                                        type="number"
                                        value={gold}
                                        onChange={(e) => setGold(Number(e.target.value))}
                                        className="w-full bg-[#334155] border border-yellow-500/30 rounded-md px-3 py-2 text-yellow-100 focus:outline-none focus:border-yellow-500 transition-all text-center font-bold"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-slate-400/10 rounded-md blur-sm group-hover:bg-slate-400/20 transition-all" />
                                <div className="relative">
                                    <label className="block text-xs text-slate-300 mb-1 font-bold">SILVER</label>
                                    <input
                                        type="number"
                                        value={silver}
                                        onChange={(e) => setSilver(Number(e.target.value))}
                                        className="w-full bg-[#334155] border border-slate-400/30 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-slate-400 transition-all text-center font-bold"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-orange-700/10 rounded-md blur-sm group-hover:bg-orange-700/20 transition-all" />
                                <div className="relative">
                                    <label className="block text-xs text-orange-400 mb-1 font-bold">BRONZE</label>
                                    <input
                                        type="number"
                                        value={bronze}
                                        onChange={(e) => setBronze(Number(e.target.value))}
                                        className="w-full bg-[#334155] border border-orange-700/30 rounded-md px-3 py-2 text-orange-200 focus:outline-none focus:border-orange-600 transition-all text-center font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic mt-2">
                            * Anything outside these times will be categorized as "Zinc".
                        </p>
                    </div>

                    <div className="h-px bg-slate-700/50" />

                    {/* Advanced Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Backend Settings</h3>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Valhalla API URL</label>
                            <input
                                type="text"
                                value={valhallaUrl}
                                onChange={(e) => setValhallaUrl(e.target.value)}
                                className="w-full bg-[#334155] border border-slate-600 rounded-md px-3 py-2 text-slate-400 focus:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className={`p-3 rounded-md flex items-start gap-2 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-[#0f172a] border-t border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Generating...' : 'Generate Zones'}
                    </button>
                </div>

            </div>
        </div>
    );
}
