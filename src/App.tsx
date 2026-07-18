import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EmergencySOS } from "./components/EmergencySOS";
import { BloodDonorSearch } from "./components/BloodDonorSearch";
import { BloodRequest } from "./components/BloodRequest";
import { HospitalFinder } from "./components/HospitalFinder";
import { AmbulanceFinder } from "./components/AmbulanceFinder";
import { MedicineSearch } from "./components/MedicineSearch";
import { AiAssistant } from "./components/AiAssistant";
import { GovSchemes } from "./components/GovSchemes";
import { MedicalScanner } from "./components/MedicalScanner";
import { ContactsNGO } from "./components/ContactsNGO";
import { Crowdfunding } from "./components/Crowdfunding";
import { ProfileSettings } from "./components/ProfileSettings";
import { AdminDashboard } from "./components/AdminDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { LostFound } from "./components/LostFound";
import { ThemeProvider } from "./components/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isSosTriggered, setIsSosTriggered] = useState<boolean>(false);

  const handleSosTrigger = () => {
    setIsSosTriggered((prev) => !prev);
  };

  // Switch tabs programmatically
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <ErrorBoundary moduleName="Dashboard">
            <Dashboard 
              setCurrentTab={setCurrentTab} 
              onSosTrigger={handleSosTrigger} 
              isSosTriggered={isSosTriggered} 
            />
          </ErrorBoundary>
        );
      case "sos":
        return (
          <ErrorBoundary moduleName="Emergency SOS">
            <EmergencySOS 
              isSosTriggered={isSosTriggered} 
              onSosTrigger={handleSosTrigger} 
            />
          </ErrorBoundary>
        );
      case "blood-donor":
        return (
          <ErrorBoundary moduleName="Blood Donor Directory">
            <BloodDonorSearch />
          </ErrorBoundary>
        );
      case "blood-requests":
        return (
          <ErrorBoundary moduleName="Emergency Blood Requests">
            <BloodRequest />
          </ErrorBoundary>
        );
      case "hospitals":
        return (
          <ErrorBoundary moduleName="Hospital & ICU Finder">
            <HospitalFinder />
          </ErrorBoundary>
        );
      case "ambulances":
        return (
          <ErrorBoundary moduleName="Ambulance Finder">
            <AmbulanceFinder />
          </ErrorBoundary>
        );
      case "medicines":
        return (
          <ErrorBoundary moduleName="Medicine Finder">
            <MedicineSearch />
          </ErrorBoundary>
        );
      case "ai-assistant":
        return (
          <ErrorBoundary moduleName="JeevanSetu AI Assistant">
            <AiAssistant 
              setCurrentTab={setCurrentTab} 
              onSosTrigger={handleSosTrigger} 
              isSosTriggered={isSosTriggered} 
            />
          </ErrorBoundary>
        );
      case "schemes":
        return (
          <ErrorBoundary moduleName="Government Schemes Tracker">
            <GovSchemes />
          </ErrorBoundary>
        );
      case "scanner":
        return (
          <ErrorBoundary moduleName="Medical Document Scanner">
            <MedicalScanner />
          </ErrorBoundary>
        );
      case "volunteer-ngos":
        return (
          <ErrorBoundary moduleName="NGO & Contact Network">
            <ContactsNGO />
          </ErrorBoundary>
        );
      case "crowdfunding":
        return (
          <ErrorBoundary moduleName="Medical Crowdfunding">
            <Crowdfunding />
          </ErrorBoundary>
        );
      case "profile":
        return (
          <ErrorBoundary moduleName="User Profile Settings">
            <ProfileSettings />
          </ErrorBoundary>
        );
      case "lost-found":
        return (
          <ErrorBoundary moduleName="Lost & Found Portal">
            <LostFound />
          </ErrorBoundary>
        );
      case "admin-controls":
        return (
          <ErrorBoundary moduleName="Administrative Panel">
            <AdminDashboard />
          </ErrorBoundary>
        );
      case "analytics":
        return (
          <ErrorBoundary moduleName="Real-time Health Analytics">
            <AnalyticsDashboard />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary moduleName="Dashboard">
            <Dashboard 
              setCurrentTab={setCurrentTab} 
              onSosTrigger={handleSosTrigger} 
              isSosTriggered={isSosTriggered} 
            />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
          {/* Main left responsive sidebar drawer */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            onSosTrigger={handleSosTrigger}
            isSosTriggered={isSosTriggered}
          />

          {/* Main right scrolling workspace container */}
          <main className="flex-1 overflow-x-hidden">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Persistent Alarm Banner if SOS is Active */}
              {isSosTriggered && (
                <div className="p-4 rounded-xl bg-red-600 text-white animate-pulse shadow-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs md:text-sm font-extrabold tracking-wide">
                    <span className="text-xl">🚨</span>
                    <span>ACTIVE CRITICAL SOS BROADCAST TRANSMITTING CURRENT GEOLOCATION TO EMERGENCY RESCUE NETWORKS</span>
                  </div>
                  <button 
                    onClick={handleSosTrigger}
                    className="px-3 py-1 bg-black/45 hover:bg-black/60 rounded-lg text-xs font-bold uppercase transition-all"
                  >
                    Mute SOS
                  </button>
                </div>
              )}

              {/* Dynamic tab rendering */}
              <div className="transition-all duration-300">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
