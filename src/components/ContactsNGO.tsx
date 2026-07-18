import React from "react";
import { 
  Users, 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  Info, 
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { VERIFIED_CONTACTS, VERIFIED_NGOS } from "../data/verifiedData";

export const ContactsNGO: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <span>Emergency Contacts & NGO Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Unified directories of official Indian helplines and non-profit humanitarian NGOs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Full emergency hotlines */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <PhoneCall className="w-4.5 h-4.5 text-red-600 animate-bounce" />
            <span>National Support Helplines</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {VERIFIED_CONTACTS.map((contact, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1 min-w-0 pr-3 text-xs">
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white truncate">
                    {contact.name}
                  </h4>
                  <p className="text-slate-500 leading-tight pr-2">{contact.purpose}</p>
                  <p className="text-[9px] text-slate-400 font-mono">Source: {contact.source}</p>
                </div>

                <a 
                  href={`tel:${contact.number}`}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold tracking-widest shrink-0 shadow-xs"
                >
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: NGO directory */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <Users className="w-4.5 h-4.5 text-red-600" />
            <span>Humanitarian NGOs & Support Groups</span>
          </h3>

          <div className="space-y-3">
            {VERIFIED_NGOS.map((ngo) => (
              <div 
                key={ngo.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                      Active Civil Network
                    </span>
                    <a 
                      href={ngo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                    >
                      <ExternalLink className="w-4 h-4 text-red-500" />
                    </a>
                  </div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white">
                    {ngo.name}
                  </h4>
                  <p className="text-slate-500 leading-relaxed pt-0.5">
                    {ngo.purpose}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400">Head Office: {ngo.address}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex flex-col text-[8px] text-slate-400 font-mono">
                    <span>Source: {ngo.source}</span>
                    <span>Last Synced: Verified 2026</span>
                  </div>

                  <a 
                    href={`tel:${ngo.contact}`}
                    className="flex items-center space-x-1 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                    <span>Coordinate Support</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
