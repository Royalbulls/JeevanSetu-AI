import React, { useState } from "react";
import { 
  Pill, 
  Search, 
  ShieldAlert, 
  HelpCircle, 
  Building2, 
  MapPin, 
  AlertTriangle,
  Info
} from "lucide-react";
import { VERIFIED_MEDICINES } from "../data/verifiedData";
import { Medicine } from "../types";

export const MedicineSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>(VERIFIED_MEDICINES);

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-red-600" />
            <span>CDSCO Generic Medicine Search</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Verify generic alternatives, indications, safety alerts, and stock availability</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search drug by brand or generic formula (e.g. Dolo, Paracetamol, Augmentin)..." 
          className="w-full pl-10 pr-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((med) => (
              <div 
                key={med.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Pill className="w-4.5 h-4.5 text-red-500" />
                      <span>{med.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Generic Formula: <span className="font-extrabold text-slate-800 dark:text-slate-200">{med.genericName}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Manufacturer: {med.manufacturer}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {med.price}
                  </span>
                </div>

                {/* Indications & Warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="font-sans font-bold text-slate-900 dark:text-white">Prescribed Indications:</p>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">{med.indications}</p>
                  </div>

                  <div className="space-y-1 bg-rose-50/50 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100 dark:border-rose-950/30">
                    <p className="font-sans font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Clinical Safety Alerts:</span>
                    </p>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">{med.warnings}</p>
                  </div>
                </div>

                {/* Stock pharmacies */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Available Stock Nearest Pharmacies:</p>
                  <div className="flex flex-wrap gap-2">
                    {med.availableAt.map((pharm, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-red-500" />
                        {pharm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Source */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Source: {med.source}</span>
                  <span>Last Checked: {new Date(med.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No data available</p>
              <p className="text-[10px] text-slate-400">No generic drugs match your exact search parameters.</p>
            </div>
          )}
        </div>

        {/* Right side help alerts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Prescription Warning</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              In strict accordance with the **Drugs and Cosmetics Rules, 1945**, Schedule H and Schedule H1 drugs must not be purchased or consumed without a valid, original prescription issued by a Registered Medical Practitioner (RMP).
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] leading-relaxed text-slate-400 font-mono">
              Always verify dosage and intervals directly with your attending physician. Never self-medicate based purely on database information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
