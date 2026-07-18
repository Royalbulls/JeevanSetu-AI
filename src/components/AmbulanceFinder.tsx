import React, { useState } from "react";
import { 
  Truck, 
  PhoneCall, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Search, 
  HelpCircle,
  AlertCircle,
  Heart
} from "lucide-react";
import { VERIFIED_AMBULANCES } from "../data/verifiedData";
import { Ambulance } from "../types";

export const AmbulanceFinder: React.FC = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(VERIFIED_AMBULANCES);
  const [filterType, setFilterType] = useState<string>("All");

  const filtered = ambulances.filter(a => 
    filterType === "All" || a.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-red-600" />
            <span>Emergency Ambulance Coordinator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Dial verified emergency ambulances, ACLS transport, and free national critical care services</p>
        </div>
      </div>

      {/* Quick Type Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Filter by Ambulance Equipment Level</label>
          <div className="flex flex-wrap gap-1.5">
            {["All", "Basic", "BLS", "ACLS", "Cardiac Care"].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  filterType === t 
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ambulance Listings Grid */}
      <div>
        <h3 className="font-sans font-bold text-slate-900 dark:text-white mb-3">Verified Ambulance Operators</h3>
        
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((amb) => (
              <div 
                key={amb.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2 space-y-1">
                      <span className="text-[8px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                        {amb.type} Equipped
                      </span>
                      <h4 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                        {amb.providerName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {amb.distance} away
                      </p>
                    </div>

                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
                      amb.status === "AVAILABLE" 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                    }`}>
                      {amb.status === "AVAILABLE" ? "Idle" : "On Duty"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mt-2">
                    Estimated Charges: <span className="font-extrabold text-slate-800 dark:text-slate-200">{amb.chargePerHour}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-col text-[8px] text-slate-400 font-mono">
                    <span>Source: {amb.source}</span>
                    <span>Last Synced: {new Date(amb.lastUpdated).toLocaleTimeString()}</span>
                  </div>

                  <a 
                    href={`tel:${amb.contact}`}
                    className="flex items-center space-x-1 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Unit</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No data available</p>
            <p className="text-[10px] text-slate-400">There are currently no emergency ambulances of this type available. Source: JeevanSetu Cloud DB.</p>
          </div>
        )}
      </div>

      {/* Helpful info section */}
      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start gap-2.5">
        <HelpCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-sans font-bold text-slate-900 dark:text-white">Emergency Level Guideline:</p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>BLS (Basic Life Support)</strong>: Equipped with oxygen cylinders, pulse-oximeters, blood pressure monitors, and basic stretchers.</li>
            <li><strong>ACLS (Advance Life Support)</strong>: Includes complete emergency ventilators, defibrillators, ECG monitors, critical care medications, and paramedics.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
