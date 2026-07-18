import React, { useState } from "react";
import { 
  MapPin, 
  PhoneCall, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Navigation,
  Check,
  Search,
  Bed,
  Layers,
  Star,
  Globe,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { VERIFIED_HOSPITALS } from "../data/verifiedData";
import { Hospital } from "../types";

export const HospitalFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHosp, setSelectedHosp] = useState<Hospital | null>(VERIFIED_HOSPITALS[0]);
  
  // Real-time search state
  const [isLiveSearch, setIsLiveSearch] = useState(false);
  const [liveHospitals, setLiveHospitals] = useState<Hospital[]>([]);
  const [sources, setSources] = useState<Array<{ title: string; uri: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLiveSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/hospital-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.hospitals)) {
        setLiveHospitals(data.hospitals);
        setSources(data.sources || []);
        setIsLiveSearch(true);
        if (data.hospitals.length > 0) {
          setSelectedHosp(data.hospitals[0]);
        } else {
          setSelectedHosp(null);
        }
        if (data.isFallback) {
          setError(data.message || "Google Search Grounding quota reached. Showing offline backup directory.");
        }
      } else {
        setError(data.error || "Failed to find live hospitals. Reverting to local database.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to Google Search Grounding service. Using offline search.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setIsLiveSearch(false);
    setSearchTerm("");
    setLiveHospitals([]);
    setSources([]);
    setError(null);
    setSelectedHosp(VERIFIED_HOSPITALS[0]);
  };

  const displayedHospitals = isLiveSearch ? liveHospitals : VERIFIED_HOSPITALS.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-600" />
            <span>Verified Hospital & ICU Bed Finder</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time public hospital search with verified ICU, Oxygen, and General bed availability</p>
        </div>
      </div>

      {/* Grid: Search & Map Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive list & Search */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Smart Search Box with Live Search Grounding */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  if (isLiveSearch && e.target.value === "") {
                    setIsLiveSearch(false);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleLiveSearch();
                  }
                }}
                placeholder="Search name, or enter city/area for real-time web results..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLiveSearch}
                disabled={loading || !searchTerm.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold font-sans shadow-sm cursor-pointer select-none transition-all shrink-0"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Search Live Grounded</span>
              </button>
              
              {isLiveSearch && (
                <button
                  onClick={handleResetSearch}
                  className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLiveSearch && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                <span>Real-time public results grounded using Google Search.</span>
              </span>
              <button 
                onClick={handleResetSearch} 
                className="underline hover:text-indigo-800 dark:hover:text-indigo-300 font-bold"
              >
                Switch to Local Data
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {displayedHospitals.length > 0 ? (
              displayedHospitals.map((hosp) => {
                const isSelected = selectedHosp?.id === hosp.id;
                return (
                  <div 
                    key={hosp.id}
                    onClick={() => setSelectedHosp(hosp)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      isSelected 
                        ? "bg-slate-50 dark:bg-slate-800/40 border-red-500/50 shadow-xs" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 pr-2">
                      <div className="flex items-center flex-wrap gap-2">
                        {hosp.rating && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {Number(hosp.rating).toFixed(1)}
                          </span>
                        )}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isLiveSearch 
                            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                        }`}>
                          {isLiveSearch ? "Search Grounded" : "Govt Verified"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {hosp.distance || "Real-time locator"}
                        </span>
                      </div>
                      <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {hosp.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">{hosp.address}</p>
                      
                      {/* Bed chips */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          ICU: {hosp.bedsAvailable?.icu ?? "N/A"}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-lg">
                          O2: {hosp.bedsAvailable?.oxygen ?? "N/A"}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                          General: {hosp.bedsAvailable?.general ?? "N/A"}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-300 self-center shrink-0" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No data available</p>
                <p className="text-[10px] text-slate-400">No public hospitals found matching your parameters.</p>
              </div>
            )}
          </div>

          {/* Citation Grounding Sources */}
          {isLiveSearch && sources.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Verified Research & Search Grounding Sources ({sources.length})</span>
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                These web listings were cited by Gemini Grounding to verify ratings, address, and current bed details:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {sources.slice(0, 5).map((src, idx) => (
                  <a 
                    key={idx}
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-100 dark:border-slate-700 transition-all shadow-2xs"
                  >
                    <span>{src.title.length > 30 ? src.title.slice(0, 30) + "..." : src.title}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Simulated Map Navigation & Selected Details */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHosp ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Active Location GPS Router</h3>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Live Maps</span>
              </div>

              {/* Polished Visual Map Container */}
              <div className="relative w-full h-44 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center">
                {/* Visual grid background */}
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-900/50 pointer-events-none" />
                
                {/* Visual map graphics (abstract vector lines & markers) */}
                <svg className="absolute inset-0 w-full h-full text-slate-200 dark:text-slate-800 opacity-60" fill="none" viewBox="0 0 400 200">
                  <path d="M 10 80 Q 52.5 10, 95 80 T 180 80" stroke="currentColor" strokeWidth="2" />
                  <path d="M 50 180 Q 150 15, 250 180" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 200 10 L 200 190" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="150" cy="90" r="12" className="fill-red-500/20 text-red-500 animate-ping" />
                  <circle cx="150" cy="90" r="4" className="fill-red-600 text-red-600" />
                </svg>

                <div className="relative z-10 text-center space-y-1 bg-white/90 dark:bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-xs max-w-[85%]">
                  <MapPin className="w-5 h-5 text-red-600 mx-auto" />
                  <p className="font-sans font-extrabold text-[11px] text-slate-900 dark:text-white truncate">
                    {selectedHosp.name}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">Distance Router: {selectedHosp.distance || "Direct Match"}</p>
                </div>
              </div>

              {/* Details card content */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">Facility Details</h4>
                      {selectedHosp.rating && (
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {Number(selectedHosp.rating).toFixed(1)} / 5
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-0.5">{selectedHosp.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {selectedHosp.contact && selectedHosp.contact !== "N/A" ? (
                    <a 
                      href={`tel:${selectedHosp.contact.split('/')[0]}`}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                      <span>Call Facility</span>
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>No Contact</span>
                    </button>
                  )}

                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHosp.name + " " + selectedHosp.address)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* Bottom Source citation */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[200px]">Source: {selectedHosp.source}</span>
                <span>Last Updated: {selectedHosp.lastUpdated ? (selectedHosp.lastUpdated.includes("2026") || selectedHosp.lastUpdated.includes("-") ? selectedHosp.lastUpdated : new Date(selectedHosp.lastUpdated).toLocaleDateString()) : "Real-time Search"}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-center py-12">
              <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">Select a hospital from the list to view the router map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
