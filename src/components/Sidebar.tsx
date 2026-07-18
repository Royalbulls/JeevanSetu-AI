import React, { useState } from "react";
import { 
  Home, 
  AlertTriangle, 
  Search, 
  HeartHandshake, 
  PlusCircle, 
  MapPin, 
  Truck, 
  Pill, 
  Bot, 
  FileText, 
  Users, 
  Coins, 
  User, 
  Settings, 
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Compass
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "../hooks/useAuth"; // Let's create this hook or handle in App

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSosTrigger: () => void;
  isSosTriggered: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onSosTrigger,
  isSosTriggered 
}) => {
  const { theme } = useTheme();
  const { user, login, logout, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const baseItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "ai-assistant", label: "AI Health Assistant", icon: Bot, highlight: true },
    { id: "sos", label: "Emergency SOS", icon: AlertTriangle, danger: true },
    { id: "blood-donor", label: "Blood Donor Search", icon: Search },
    { id: "blood-requests", label: "Blood Requests", icon: PlusCircle },
    { id: "hospitals", label: "Hospital Finder", icon: MapPin },
    { id: "ambulances", label: "Ambulance Finder", icon: Truck },
    { id: "medicines", label: "Medicine Search", icon: Pill },
    { id: "schemes", label: "Govt Health Schemes", icon: FileText },
    { id: "scanner", label: "Medical Scanner", icon: ShieldCheck },
    { id: "volunteer-ngos", label: "Volunteers & NGOs", icon: Users },
    { id: "crowdfunding", label: "Crowdfunding", icon: Coins },
    { id: "lost-found", label: "Lost & Found Recovery", icon: Compass },
    { id: "analytics", label: "Real-Time Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile & Settings", icon: User },
  ];

  const menuItems = [...baseItems];
  if (profile?.role === "Admin" || profile?.role === "Super Admin") {
    // Insert Admin Controls right before profile
    const profileIdx = menuItems.findIndex(i => i.id === "profile");
    if (profileIdx !== -1) {
      menuItems.splice(profileIdx, 0, { id: "admin-controls", label: "Admin Controls", icon: ShieldAlert });
    }
  }

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-between p-1.5 shadow-md shadow-red-500/20">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold tracking-tight text-slate-900 dark:text-white">
            JeevanSetu <span className="text-red-600 text-xs px-1 py-0.5 rounded bg-red-50 dark:bg-red-950/40 ml-1">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Quick SOS Trigger in mobile header */}
          <button 
            onClick={onSosTrigger}
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-white shadow-lg shadow-red-500/30 animate-pulse ${
              isSosTriggered ? "bg-red-800" : "bg-red-600"
            }`}
          >
            {isSosTriggered ? "SOS Active" : "SOS"}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 lg:sticky lg:top-0 lg:h-screen transition-all duration-300 transform lg:transform-none ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Logo */}
            <div className="hidden lg:flex items-center space-x-2.5 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center p-2 shadow-lg shadow-red-500/20">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  JeevanSetu <span className="text-red-600">AI</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                  Emergency Platform
                </span>
              </div>
            </div>

            {/* Quick emergency action */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={onSosTrigger}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white font-sans font-bold shadow-md uppercase tracking-wider transition-all duration-300 ${
                  isSosTriggered 
                    ? "bg-gradient-to-r from-red-800 to-red-950 hover:opacity-95 shadow-red-900/50 animate-pulse border-2 border-red-500" 
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <span>{isSosTriggered ? "SOS Active" : "Broadcast SOS"}</span>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {menuItems.map((item) => {
                const isSelected = currentTab === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-150 ${
                      isSelected 
                        ? item.danger
                          ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold"
                          : item.highlight
                            ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-l-4 border-slate-900 dark:border-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${
                      isSelected 
                        ? item.danger ? "text-red-600 dark:text-red-400" : item.highlight ? "text-amber-500" : "text-slate-900 dark:text-white"
                        : item.highlight ? "text-amber-500/80" : "text-slate-400 dark:text-slate-500"
                    }`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.highlight && (
                      <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Auth State footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/85">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white font-bold uppercase ring-1 ring-slate-200 dark:ring-slate-700">
                    {user.displayName ? user.displayName.slice(0, 2) : "JS"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || "User"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-150"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
