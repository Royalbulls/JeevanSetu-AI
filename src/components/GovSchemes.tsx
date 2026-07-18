import React, { useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronDown,
  Info
} from "lucide-react";
import { VERIFIED_SCHEMES } from "../data/verifiedData";
import { Scheme } from "../types";

export const GovSchemes: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(VERIFIED_SCHEMES[0]);
  const [income, setIncome] = useState<string>("Under ₹2.5L");
  const [rural, setRural] = useState<boolean>(false);
  const [eligibleResult, setEligibleResult] = useState<string | null>(null);

  const checkEligibility = () => {
    if (income === "Under ₹2.5L" || rural) {
      setEligibleResult("Congratulations! You are highly likely eligible for Ayushman Bharat (PM-JAY) or Rashtriya Swasthya Bima Yojana.");
    } else {
      setEligibleResult("Based on your inputs, you may not fit low-income classifications, but you can still access generic medicines via PMBJP or purchase individual schemes.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            <span>Verified Government Health Schemes Handbook</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Explore national healthcare initiatives, eligibility criteria, cashless hospitalization limits, and application links</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Schemes list */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Select Health Initiative</p>
          <div className="space-y-2">
            {VERIFIED_SCHEMES.map((scheme) => {
              const isSelected = selectedScheme?.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col space-y-1 ${
                    isSelected 
                      ? "bg-slate-50 dark:bg-slate-800/40 border-red-500/50 shadow-xs" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase self-start">
                    National
                  </span>
                  <span className="font-sans font-bold text-xs text-slate-900 dark:text-white leading-tight">
                    {scheme.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Scheme Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedScheme ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
              <div className="space-y-1">
                <h2 className="font-sans font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  {selectedScheme.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{selectedScheme.description}</p>
              </div>

              {/* Grid: Eligibility & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Who is Eligible?</span>
                  </h4>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">{selectedScheme.eligibility}</p>
                </div>

                <div className="space-y-2 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/30">
                  <h4 className="font-sans font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Critical Benefits:</span>
                  </h4>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">{selectedScheme.benefits}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col text-[8px] text-slate-400 font-mono">
                  <span>Source: {selectedScheme.source}</span>
                  <span>Last Verified: {new Date(selectedScheme.lastUpdated).toLocaleDateString()}</span>
                </div>

                <a 
                  href={selectedScheme.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-red-500" />
                  <span>Official Application Portal</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl text-center text-slate-400 border border-slate-100 dark:border-slate-800">
              Select a scheme from handbook to inspect parameters.
            </div>
          )}

          {/* Eligibility Evaluator Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <QuestionIcon className="w-4.5 h-4.5 text-red-600" />
              <span>Ayushman Bharat Eligibility Calculator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Family Annual Income Bracket</label>
                <select 
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option>Under ₹2.5L</option>
                  <option>₹2.5L to ₹5L</option>
                  <option>Over ₹5L</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input 
                  type="checkbox" 
                  id="rural" 
                  checked={rural}
                  onChange={e => setRural(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 accent-red-600"
                />
                <label htmlFor="rural" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resides in rural/agricultural areas under SECC
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={checkEligibility}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
              >
                Evaluate Eligibility
              </button>
            </div>

            {eligibleResult && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 font-sans font-semibold flex items-start gap-2">
                <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{eligibleResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
