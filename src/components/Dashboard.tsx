import React, { useEffect, useState } from "react";
import { 
  HeartHandshake, 
  AlertTriangle, 
  PlusCircle, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Activity, 
  Users, 
  Calendar,
  Search,
  Sparkles,
  RefreshCw,
  Info
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getBloodRequests, getActiveSosAlerts, getDonors } from "../lib/firestoreService";
import { BloodRequest, SosAlert } from "../types";
import { VERIFIED_CONTACTS } from "../data/verifiedData";

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  onSosTrigger: () => void;
  isSosTriggered: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setCurrentTab, 
  onSosTrigger,
  isSosTriggered 
}) => {
  const { user, profile } = useAuth();
  const [activeSos, setActiveSos] = useState<SosAlert[]>([]);
  const [bloodReqCount, setBloodReqCount] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const sos = await getActiveSosAlerts();
      const activeOnly = sos.filter(s => s.status === "ACTIVE");
      setActiveSos(activeOnly);

      const reqs = await getBloodRequests();
      const activeReqs = reqs.filter(r => r.status === "PENDING" || r.status === "URGENT");
      setBloodReqCount(activeReqs.length);

      const donors = await getDonors();
      setDonorCount(donors.length);
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Poll every 15s for live updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white shadow-xl shadow-red-500/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National AI Health Platform</span>
          </span>
          <h1 className="font-sans font-extrabold text-2xl md:text-3.5xl tracking-tight leading-tight">
            JeevanSetu AI
          </h1>
          <p className="text-sm md:text-base text-rose-50/90 font-medium">
            India's unified emergency assistance engine. Access verified donors, map beds, consult our AI assistant, and trigger instantaneous SOS broadcasts to preserve lives.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button 
              onClick={onSosTrigger}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
                isSosTriggered 
                  ? "bg-slate-900 text-white animate-pulse shadow-black/20" 
                  : "bg-white text-red-600 hover:bg-red-50 shadow-red-900/10"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isSosTriggered ? "SOS Active" : "Trigger SOS"}</span>
            </button>
            <button 
              onClick={() => setCurrentTab("ai-assistant")}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900/40 text-white hover:bg-slate-900/60 transition-all border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Consult AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Live Indicators & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Active SOS Alerts</span>
            <p className="font-sans font-extrabold text-lg text-slate-900 dark:text-white leading-none mt-1">
              {activeSos.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Blood Requests</span>
            <p className="font-sans font-extrabold text-lg text-slate-900 dark:text-white leading-none mt-1">
              {bloodReqCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">Registered Donors</span>
            <p className="font-sans font-extrabold text-lg text-slate-900 dark:text-white leading-none mt-1">
              {donorCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">GPS Service</span>
            <p className="font-sans font-bold text-xs text-slate-900 dark:text-white mt-1 leading-none">
              LOCALIZED
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Bento Grid */}
      <div>
        <h2 className="font-sans font-bold text-slate-900 dark:text-white mb-3">Quick Navigation Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Emergency SOS", tab: "sos", color: "bg-red-500 text-white" },
            { label: "Blood Donors", tab: "blood-donor", color: "bg-rose-500 text-white" },
            { label: "ICU / Bed Finder", tab: "hospitals", color: "bg-amber-500 text-white" },
            { label: "Ambulance", tab: "ambulances", color: "bg-blue-500 text-white" },
            { label: "Govt Schemes", tab: "schemes", color: "bg-emerald-500 text-white" },
            { label: "Document Scan", tab: "scanner", color: "bg-violet-500 text-white" },
          ].map((act, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTab(act.tab)}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all text-left h-24"
            >
              <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center shadow-xs text-sm font-bold uppercase`}>
                {act.label.slice(0, 1)}
              </div>
              <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left: Active SOS Alerts, Right: Emergency Direct Dials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Emergency Broadcasts from Cloud Firestore */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <h3 className="font-sans font-bold text-slate-900 dark:text-white">
                  Live Emergency Broadcasts
                </h3>
              </div>
              <button 
                onClick={loadData}
                title="Refresh feed"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
              </div>
            ) : activeSos.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                {activeSos.map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-4 rounded-xl border border-red-100 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-sans font-bold text-xs text-red-600 dark:text-red-400">
                          SOS Broadcast
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Patient: {alert.userName} • Contact: {alert.userPhone}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        GPS Coords: {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                      </p>
                    </div>
                    <a 
                      href={`tel:${alert.userPhone}`}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Rescue Call</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-75" />
                <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No active emergency alerts</p>
                <p className="text-[10px] text-slate-400">India is currently safe. Cloud DB connection initialized.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Source: JeevanSetu Cloud DB</span>
            <span>Last Checked: {lastUpdated || "Never"}</span>
          </div>
        </div>

        {/* Emergency Dials from Verified National Databases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-1.5">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Emergency Speed Dial</span>
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Click to dial official emergency response hotlines</p>
            
            <div className="space-y-2.5">
              {VERIFIED_CONTACTS.slice(0, 4).map((contact, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-sans font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">{contact.purpose}</p>
                  </div>
                  <a 
                    href={`tel:${contact.number}`}
                    className="px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold font-mono tracking-wider hover:bg-red-600 dark:hover:bg-red-600 transition-colors shrink-0"
                  >
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Source: Ministry of Home Affairs</span>
            <span>Verified 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
