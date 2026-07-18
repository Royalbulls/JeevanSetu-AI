import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Camera, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Award, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Bell, 
  ArrowRight, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Compass, 
  Eye, 
  RefreshCw,
  Building2,
  Trash2
} from "lucide-react";
import { db } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { LostFoundReport } from "../types";

const CATEGORIES = [
  "Person",
  "Child",
  "Senior Citizen",
  "Pet",
  "Mobile Phone",
  "Wallet",
  "Aadhaar Card",
  "PAN Card",
  "Driving License",
  "Passport",
  "Vehicle",
  "Luggage",
  "Keys",
  "Other"
];

const INDIAN_STATES = [
  "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", 
  "Haryana", "West Bengal", "Gujarat", "Telangana", "Rajasthan", "Bihar", "Punjab"
];

// Seed cities with mock nearest police stations and contacts
const POLICE_STATION_DATABASE: Record<string, { stationName: string; phone: string }> = {
  "New Delhi": { stationName: "Connaught Place Police Station", phone: "011-23351100" },
  "Delhi": { stationName: "Connaught Place Police Station", phone: "011-23351100" },
  "Mumbai": { stationName: "Colaba Police HQ", phone: "022-22822626" },
  "Bengaluru": { stationName: "Koramangala Police Station", phone: "080-22942571" },
  "Bangalore": { stationName: "Koramangala Police Station", phone: "080-22942571" },
  "Chennai": { stationName: "Nungambakkam Police Station", phone: "044-23452601" },
  "Noida": { stationName: "Sector 20 Police Station", phone: "0120-2525100" },
  "Gurugram": { stationName: "DLF Phase 2 Police Station", phone: "0124-2388700" },
  "Kolkata": { stationName: "Park Street Police Station", phone: "033-22849000" },
  "Hyderabad": { stationName: "Banjara Hills Police Station", phone: "040-27853508" },
  "Jaipur": { stationName: "Sindhi Camp Police Station", phone: "0141-2204561" },
  "Lucknow": { stationName: "Hazratganj Police Station", phone: "0522-2206100" },
  "Patna": { stationName: "Gandhi Maidan Police Station", phone: "0612-2222100" },
  "Pune": { stationName: "Shivajinagar Police Station", phone: "020-25501111" }
};

// Simple visual map implementation
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "LOST" | "FOUND";
  category: string;
  city: string;
}

export const LostFound: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "browse" | "report" | "moderation">("dashboard");
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchCategory, setSearchCategory] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState<"ALL" | "LOST" | "FOUND">("ALL");

  // Report Form state
  const [formType, setFormType] = useState<"LOST" | "FOUND">("LOST");
  const [formCategory, setFormCategory] = useState("Wallet");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formState, setFormState] = useState("Delhi");
  const [formDistrict, setFormDistrict] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formReward, setFormReward] = useState("");
  const [formSafeCustody, setFormSafeCustody] = useState("");
  
  // Police support fields
  const [formFirNumber, setFormFirNumber] = useState("");
  const [formFirPoliceStation, setFormFirPoliceStation] = useState("");
  const [suggestedPolice, setSuggestedPolice] = useState<{ stationName: string; phone: string } | null>(null);

  // Selected report for matching/details
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);
  const [aiMatches, setAiMatches] = useState<Array<{
    candidateId: string;
    matchPercentage: number;
    matchExplanation: string;
    candidate?: LostFoundReport;
  }>>([]);
  const [matchingLoader, setMatchingLoader] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: "match" | "privacy" }>>([]);

  // OTP Verification Simulation State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pendingReportData, setPendingReportData] = useState<any>(null);

  // AI Assistant input state
  const [aiInput, setAiInput] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);

  // Mock Map interactive center
  const [mapZoom, setMapZoom] = useState(8);
  const [selectedMapMarker, setSelectedMapMarker] = useState<MapMarker | null>(null);

  // Fetch reports from Firestore
  const fetchReports = async () => {
    setLoading(true);
    try {
      const qSnapshot = await getDocs(collection(db, "lost_found"));
      const list: LostFoundReport[] = [];
      qSnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as LostFoundReport);
      });
      // Sort by creation time descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(list);
    } catch (e) {
      console.error("Error fetching lost & found reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Nearest Police Station Suggestion Engine
  useEffect(() => {
    if (formCity) {
      const cityKey = Object.keys(POLICE_STATION_DATABASE).find(
        key => formCity.toLowerCase().trim().includes(key.toLowerCase()) || key.toLowerCase().includes(formCity.toLowerCase().trim())
      );
      if (cityKey) {
        setSuggestedPolice(POLICE_STATION_DATABASE[cityKey]);
      } else {
        setSuggestedPolice(null);
      }
    } else {
      setSuggestedPolice(null);
    }
  }, [formCity]);

  // Handle reporting submit (triggers OTP Verification)
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to submit a Lost or Found report.");
      return;
    }
    if (!formTitle || !formDescription || !formCity) {
      alert("Please fill in all required fields (Title, Description, and City).");
      return;
    }

    // Prepare payload
    const reportData = {
      type: formType,
      category: formCategory,
      title: formTitle,
      description: formDescription,
      photoUrl: formPhotoUrl || getRandomPlaceholderImage(formCategory),
      dateTime: formDate || new Date().toISOString().slice(0, 16),
      lastSeenLocation: formLocation,
      state: formState,
      district: formDistrict || formCity,
      city: formCity,
      contactName: profile?.fullName || user.displayName || "Anonymous Citizen",
      contactPhone: profile?.phone || "Hidden (Configure in Profile)",
      contactEmail: user.email || "",
      reward: formType === "LOST" ? formReward : "",
      safeCustodyDetails: formType === "FOUND" ? formSafeCustody : "",
      firNumber: formFirNumber,
      firPoliceStation: formFirPoliceStation || (suggestedPolice?.stationName || ""),
      nearestPoliceStation: suggestedPolice?.stationName || "Local Police HQ",
      nearestPoliceContact: suggestedPolice?.phone || "100",
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      isOtpVerified: false,
      status: "ACTIVE" as const,
      reportFlags: 0,
      privacyAgreedUsers: [],
      connectionRequests: []
    };

    setPendingReportData(reportData);
    
    // Generate simple 6-digit mock OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpCode("");
    setShowOtpModal(true);
  };

  // Confirm OTP and save to Firestore
  const handleVerifyOtp = async () => {
    if (otpCode !== "123456" && otpCode !== generatedOtp) {
      alert("Invalid OTP code. For test mode, you can use '123456' or the generated code.");
      return;
    }

    try {
      setLoading(true);
      const verifiedData = {
        ...pendingReportData,
        isOtpVerified: true
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "lost_found"), verifiedData);

      // Trigger automatic matching search in background
      triggerMatchNotification(verifiedData);

      // Save admin audit log
      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "citizen",
        userEmail: user?.email || "anonymous@jeevansetu.org",
        action: `CREATE_LOST_FOUND_${verifiedData.type}`,
        details: `Created a verified ${verifiedData.type.toLowerCase()} report for ${verifiedData.title} with ID: ${docRef.id}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Citizen"
      });

      setShowOtpModal(false);
      setPendingReportData(null);
      
      // Reset form fields
      setFormTitle("");
      setFormDescription("");
      setFormPhotoUrl("");
      setFormLocation("");
      setFormDistrict("");
      setFormCity("");
      setFormReward("");
      setFormSafeCustody("");
      setFormFirNumber("");
      setFormFirPoliceStation("");

      // Reload
      await fetchReports();
      setActiveTab("browse");
      alert("Success! Your listing has been verified via OTP and published live on the recovery network.");
    } catch (e) {
      console.error("Error creating report:", e);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Smart background match algorithm triggers a notification toast
  const triggerMatchNotification = (newReport: any) => {
    // Find matching reports of opposite type in the same city or category
    const candidates = reports.filter(r => 
      r.type !== newReport.type && 
      r.category === newReport.category &&
      r.city.toLowerCase() === newReport.city.toLowerCase()
    );

    if (candidates.length > 0) {
      const bestMatch = candidates[0];
      const newNotification = {
        id: Math.random().toString(),
        message: `🚨 AI Match Alert: We found a potential match for your "${newReport.title}" with a published report "${bestMatch.title}" in ${bestMatch.city}!`,
        type: "match" as const
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Google Maps: Create markers from filtered reports
  const getMapMarkers = (): MapMarker[] => {
    return filteredReports
      .filter(r => r.status === "ACTIVE")
      .map(r => {
        // Deterministic mock lat/lng offsets based on city/district to simulate mapping coordinates
        let baseLat = 28.6139; // Delhi center
        let baseLng = 77.2090;

        if (r.city.toLowerCase().includes("mumbai")) {
          baseLat = 19.0760; baseLng = 72.8777;
        } else if (r.city.toLowerCase().includes("bengaluru") || r.city.toLowerCase().includes("bangalore")) {
          baseLat = 12.9716; baseLng = 77.5946;
        } else if (r.city.toLowerCase().includes("chennai")) {
          baseLat = 13.0827; baseLng = 80.2707;
        } else if (r.city.toLowerCase().includes("kolkata")) {
          baseLat = 22.5726; baseLng = 88.3639;
        } else if (r.city.toLowerCase().includes("hyderabad")) {
          baseLat = 17.3850; baseLng = 78.4867;
        } else if (r.city.toLowerCase().includes("pune")) {
          baseLat = 18.5204; baseLng = 73.8567;
        } else {
          // Custom deterministic offset from string hash
          const hash = r.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          baseLat = 28.6139 + ((hash % 100) - 50) / 1000;
          baseLng = 77.2090 + ((hash % 70) - 35) / 1000;
        }

        return {
          id: r.id,
          lat: baseLat,
          lng: baseLng,
          title: r.title,
          type: r.type,
          category: r.category,
          city: r.city
        };
      });
  };

  // Dynamic filter application
  const filteredReports = reports.filter(r => {
    const matchesCategory = !searchCategory || r.category === searchCategory;
    const matchesState = !searchState || r.state.toLowerCase() === searchState.toLowerCase();
    const matchesCity = !searchCity || r.city.toLowerCase().includes(searchCity.toLowerCase().trim());
    const matchesKeyword = !searchKeyword || 
      r.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      r.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesType = searchType === "ALL" || r.type === searchType;
    return matchesCategory && matchesState && matchesCity && matchesKeyword && matchesType && r.status !== "DELETED";
  });

  // AI Assistant query handler (Simulation and execution on local/cloud helper)
  const handleAiAssistantQuery = async () => {
    if (!aiInput.trim()) return;
    setAiAssistantLoading(true);
    setAiResponseText("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiInput })
      });
      const result = await response.json();
      
      setAiResponseText(result.reply);

      // Analyze intention from response
      if (result.intent === "LOST_FOUND_ASSISTANT") {
        const data = result.intentData || {};
        if (data.category) {
          setSearchCategory(data.category);
        }
        if (data.type) {
          setSearchType(data.type);
        }
        setActiveTab("browse");
      }
    } catch (e) {
      console.error("AI Assistant Lost & Found Query error:", e);
      // Fallback parser locally
      const inputLower = aiInput.toLowerCase();
      let matchedCat = "Wallet";
      if (inputLower.includes("phone")) matchedCat = "Mobile Phone";
      else if (inputLower.includes("aadhaar") || inputLower.includes("aadhar")) matchedCat = "Aadhaar Card";
      else if (inputLower.includes("pan")) matchedCat = "PAN Card";
      else if (inputLower.includes("license") || inputLower.includes("driving")) matchedCat = "Driving License";
      else if (inputLower.includes("child") || inputLower.includes("kids") || inputLower.includes("son")) matchedCat = "Child";
      else if (inputLower.includes("senior") || inputLower.includes("elderly") || inputLower.includes("grand")) matchedCat = "Senior Citizen";
      else if (inputLower.includes("dog") || inputLower.includes("pet") || inputLower.includes("cat")) matchedCat = "Pet";

      setSearchCategory(matchedCat);
      const isFound = inputLower.includes("found") || inputLower.includes("mila");
      setSearchType(isFound ? "FOUND" : "LOST");
      setActiveTab("browse");
      setAiResponseText(`Checked local active databases for "${matchedCat}" listings. Displaying matches for your query: "${aiInput}" on the screen.`);
    } finally {
      setAiAssistantLoading(false);
    }
  };

  // AI Smart Matching: Compare a specific report with all opposite candidates using Gemini API
  const handleSmartMatchingAnalysis = async (report: LostFoundReport) => {
    setSelectedReport(report);
    setMatchingLoader(true);
    setAiMatches([]);
    try {
      // Find opposite report candidates with similar categories
      const candidates = reports.filter(r => r.type !== report.type && r.status === "ACTIVE");
      
      const response = await fetch("/api/ai/match-lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, candidates })
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.matches)) {
        const enrichedMatches = data.matches.map((m: any) => {
          const matchedItem = candidates.find(c => c.id === m.candidateId);
          return {
            ...m,
            candidate: matchedItem
          };
        }).filter((m: any) => m.candidate !== undefined); // only keep existing reports
        
        setAiMatches(enrichedMatches);
      }
    } catch (e) {
      console.error("AI matching fetch failed:", e);
    } finally {
      setMatchingLoader(false);
    }
  };

  // Flag listings as fake
  const handleFlagReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, "lost_found", reportId);
      const reportObj = reports.find(r => r.id === reportId);
      if (reportObj) {
        const currentFlags = reportObj.reportFlags || 0;
        await updateDoc(reportRef, {
          reportFlags: currentFlags + 1
        });
        
        // Log action
        await addDoc(collection(db, "audit_logs"), {
          userId: user?.uid || "citizen",
          userEmail: user?.email || "anonymous@jeevansetu.org",
          action: "FLAG_LOST_FOUND_FAKE",
          details: `Flagged lost & found report: ${reportId} as fake. Total flags: ${currentFlags + 1}`,
          timestamp: new Date().toISOString()
        });

        alert("Listing flagged. Our administrators and volunteer team have been notified.");
        fetchReports();
      }
    } catch (e) {
      console.error("Flag report error:", e);
    }
  };

  // Privacy Protection Connection System
  const handleRequestConnection = async (report: LostFoundReport) => {
    if (!user) {
      alert("Please sign in to send connection requests.");
      return;
    }
    try {
      const reportRef = doc(db, "lost_found", report.id);
      const currentRequests = report.connectionRequests || [];
      if (currentRequests.includes(user.uid)) {
        alert("You have already requested connection details for this listing.");
        return;
      }

      const updatedRequests = [...currentRequests, user.uid];
      await updateDoc(reportRef, {
        connectionRequests: updatedRequests
      });

      alert("Connection request sent! Once the owner accepts your request, mutual contact details will be unlocked.");
      fetchReports();
    } catch (e) {
      console.error("Connection request error:", e);
    }
  };

  const handleAcceptConnection = async (report: LostFoundReport, requesterUid: string) => {
    try {
      const reportRef = doc(db, "lost_found", report.id);
      const currentAgreed = report.privacyAgreedUsers || [];
      const currentRequests = report.connectionRequests || [];

      const updatedAgreed = [...currentAgreed, requesterUid];
      const updatedRequests = currentRequests.filter(uid => uid !== requesterUid);

      await updateDoc(reportRef, {
        privacyAgreedUsers: updatedAgreed,
        connectionRequests: updatedRequests
      });

      alert("Connection approved! Contact details are now mutually unlocked.");
      fetchReports();
    } catch (e) {
      console.error("Approve connection error:", e);
    }
  };

  // Administrative Controls
  const handleModerateListing = async (reportId: string, action: "RESOLVED" | "DELETED" | "APPROVED") => {
    try {
      const reportRef = doc(db, "lost_found", reportId);
      
      if (action === "DELETED") {
        await deleteDoc(reportRef);
        alert("Listing deleted successfully.");
      } else {
        await updateDoc(reportRef, {
          status: action === "RESOLVED" ? "MATCHED" : "ACTIVE",
          reportFlags: 0 // Reset flags on approval
        });
        alert(`Listing status updated to ${action}.`);
      }

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: `MODERATE_LOST_FOUND_${action}`,
        details: `Moderated report ID ${reportId} to action ${action}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      fetchReports();
    } catch (e) {
      console.error("Error moderating listing:", e);
    }
  };

  // Helper placeholder generators to provide premium visual styling without fake images
  const getRandomPlaceholderImage = (category: string) => {
    switch (category) {
      case "Person":
      case "Child":
      case "Senior Citizen":
        return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80";
      case "Pet":
        return "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80";
      case "Mobile Phone":
        return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80";
      case "Wallet":
        return "https://images.unsplash.com/photo-1627124424074-765a6b6107b5?auto=format&fit=crop&w=500&q=80";
      case "Vehicle":
        return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80";
      case "Luggage":
        return "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=500&q=80";
      default:
        return "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=500&q=80";
    }
  };

  // Summary counts for dashboard metrics
  const activeLostCount = reports.filter(r => r.type === "LOST" && r.status === "ACTIVE").length;
  const activeFoundCount = reports.filter(r => r.type === "FOUND" && r.status === "ACTIVE").length;
  const successfulMatchesCount = reports.filter(r => r.status === "MATCHED").length;

  return (
    <div id="lost-found-root" className="space-y-6">
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </span>
            <h1 className="font-sans font-extrabold text-2xl tracking-tight">
              Lost & Found AI Recovery
            </h1>
          </div>
          <p className="text-xs text-indigo-200 font-sans">
            Secure, verified smart matching network for citizens, volunteers, and law enforcement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setActiveTab("dashboard"); setSelectedReport(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === "dashboard" ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab("browse"); setSelectedReport(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === "browse" ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Search & Maps
          </button>
          <button 
            onClick={() => { setActiveTab("report"); setSelectedReport(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center space-x-1 ${
              activeTab === "report" ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Claim</span>
          </button>
          
          {(profile?.role === "Admin" || profile?.role === "Police") && (
            <button 
              onClick={() => { setActiveTab("moderation"); setSelectedReport(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center space-x-1 ${
                activeTab === "moderation" ? "bg-red-500 text-white font-black" : "bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-950/60"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Moderation</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-amber-950 dark:text-amber-200 rounded-r-xl flex justify-between items-start gap-2 shadow-sm animate-bounce-short">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium leading-relaxed">{notif.message}</span>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Search Assistant Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              AI Query Assistant
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full font-bold">
            Gemini 3.5 Flash Grounding
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Tell JeevanSetu AI what you lost or found. It will automatically pre-classify, scan the active Firestore database, and open matching search listings or forms. Try saying: <span className="font-mono text-indigo-600 font-medium">"My black wallet is lost in Patna"</span> or <span className="font-mono text-indigo-600 font-medium">"I found a mobile phone"</span>.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="My Aadhaar card is lost..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && handleAiAssistantQuery()}
            />
            <button 
              onClick={handleAiAssistantQuery}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600"
              disabled={aiAssistantLoading}
            >
              <RefreshCw className={`w-4 h-4 ${aiAssistantLoading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
          <button 
            onClick={handleAiAssistantQuery}
            disabled={aiAssistantLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
          >
            <span>Ask AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {aiResponseText && (
          <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-950/40 rounded-xl text-xs text-slate-700 dark:text-indigo-200">
            <strong>Setu AI response: </strong>{aiResponseText}
          </div>
        )}
      </div>

      {/* RENDER ACTIVE TAB VIEW */}

      {/* 1. DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Counters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center space-x-4">
              <div className="p-3.5 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{activeLostCount}</span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans mt-0.5">Active Lost Reports</p>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{activeFoundCount}</span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans mt-0.5">Active Found Reports</p>
              </div>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center space-x-4">
              <div className="p-3.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{successfulMatchesCount}</span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans mt-0.5">Successful Matches</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Recent verified entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white font-sans flex items-center gap-1.5">
                  <ClockIcon className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Recently Verified Listings</span>
                </h2>
                <button 
                  onClick={() => setActiveTab("browse")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View All ({reports.length})
                </button>
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                  <span className="text-xs">Connecting recovery network...</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No claims listed yet on the recovery network. Use the button above to publish your report.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div 
                      key={report.id}
                      onClick={() => { setSelectedReport(report); handleSmartMatchingAnalysis(report); }}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 rounded-2xl flex items-start space-x-3.5 cursor-pointer transition-all hover:shadow-md"
                    >
                      <img 
                        src={report.photoUrl || getRandomPlaceholderImage(report.category)} 
                        alt={report.title} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                            report.type === "LOST" ? "bg-red-50 dark:bg-red-950/30 text-red-600" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                          }`}>
                            {report.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {report.title}
                        </h4>
                        <div className="flex items-center text-[10px] text-slate-400 gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{report.city}, {report.state}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: My private dashboard */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white font-sans flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-indigo-500" />
                <span>My Active Recovery Workspace</span>
              </h2>

              {!user ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-500">
                    Sign in to manage your active listings, view connection approvals, and perform smart AI comparisons.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* My listings */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">My Listings</h3>
                    {reports.filter(r => r.createdBy === user.uid).length === 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                        You haven't posted any reports yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {reports.filter(r => r.createdBy === user.uid).map((myReport) => (
                          <div key={myReport.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate">{myReport.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{myReport.category} | {myReport.type}</p>
                            </div>
                            <div className="flex space-x-1.5">
                              <button 
                                onClick={() => { setSelectedReport(myReport); handleSmartMatchingAnalysis(myReport); }}
                                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[10px] font-bold rounded-lg"
                              >
                                Match Analysis
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Incoming Connection Requests for Privacy Access */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Privacy Access Requests</span>
                    </h3>
                    {reports.filter(r => r.createdBy === user.uid && r.connectionRequests && r.connectionRequests.length > 0).length === 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                        No pending contact details requests.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reports.filter(r => r.createdBy === user.uid && r.connectionRequests && r.connectionRequests.length > 0).map((report) => (
                          <div key={report.id} className="p-3 border border-indigo-200/50 bg-indigo-50/20 dark:bg-indigo-950/5 rounded-xl space-y-2">
                            <div className="text-[11px]">
                              <p className="text-slate-500">A user has requested contact details for your listing:</p>
                              <p className="font-bold text-slate-800 dark:text-white mt-0.5">"{report.title}"</p>
                            </div>
                            <div className="flex space-x-2">
                              {report.connectionRequests?.map((requesterUid) => (
                                <button 
                                  key={requesterUid}
                                  onClick={() => handleAcceptConnection(report, requesterUid)}
                                  className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg"
                                >
                                  Approve Privacy Unlock
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BROWSE & SEARCH TAB */}
      {activeTab === "browse" && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Search Type</label>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="ALL">All Claims</option>
                <option value="LOST">Lost Claims</option>
                <option value="FOUND">Found Claims</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State</label>
              <select 
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City</label>
              <input 
                type="text"
                placeholder="e.g. New Delhi"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keyword</label>
              <input 
                type="text"
                placeholder="e.g. leather wallet"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Interactive Google Maps Display Mock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-sans flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Geographical GIS Recovery Map (Interactive)</span>
              </h3>
              <div className="flex space-x-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span> Lost</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Found</span>
              </div>
            </div>

            {/* Simulated Canvas Map */}
            <div className="h-64 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl relative overflow-hidden flex items-center justify-center">
              {/* Map background grid simulation */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
              
              {/* Vector abstract roads simulation */}
              <svg className="absolute inset-0 w-full h-full text-indigo-500/10" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="50" x2="100%" y2="80" stroke="currentColor" strokeWidth="2" />
                <line x1="100" y1="0" x2="120" y2="100%" stroke="currentColor" strokeWidth="2.5" />
                <line x1="0" y1="180" x2="100%" y2="150" stroke="currentColor" strokeWidth="1.5" />
                <line x1="400" y1="0" x2="350" y2="100%" stroke="currentColor" strokeWidth="2" />
              </svg>

              {/* Map Controls */}
              <div className="absolute top-2 right-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg flex flex-col gap-1 z-10 shadow-xs">
                <button onClick={() => setMapZoom(z => Math.min(z + 1, 15))} className="w-6 h-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded">-</button>
                <button onClick={() => setMapZoom(z => Math.max(z - 1, 5))} className="w-6 h-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded">+</button>
              </div>

              {/* Dynamic Map Pins */}
              {getMapMarkers().map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => setSelectedMapMarker(marker)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-lg transition-transform hover:scale-125 hover:z-20 ${
                    marker.type === "LOST" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                  }`}
                  style={{
                    left: `${((marker.lng % 0.1) * 1000 + 150) % 85}%`,
                    top: `${((marker.lat % 0.1) * 1000 + 100) % 75}%`
                  }}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              ))}

              {/* Default empty state marker guidance */}
              {getMapMarkers().length === 0 && (
                <p className="text-xs text-slate-400 font-sans z-10">
                  No listings found matching current filters.
                </p>
              )}

              {/* Marker Popover Info overlay */}
              {selectedMapMarker && (
                <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xl flex justify-between items-center z-10">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-full uppercase ${
                        selectedMapMarker.type === "LOST" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {selectedMapMarker.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{selectedMapMarker.category}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white mt-1">{selectedMapMarker.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedMapMarker.city}</p>
                  </div>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => {
                        const targetReport = reports.find(r => r.id === selectedMapMarker.id);
                        if (targetReport) {
                          setSelectedReport(targetReport);
                          handleSmartMatchingAnalysis(targetReport);
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg"
                    >
                      Inspect Detail
                    </button>
                    <button
                      onClick={() => setSelectedMapMarker(null)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const isCreator = user?.uid === report.createdBy;
              const hasPrivacyAgreement = report.privacyAgreedUsers?.includes(user?.uid || "") || isCreator || profile?.role === "Admin" || profile?.role === "Police";
              const connectionRequested = report.connectionRequests?.includes(user?.uid || "");

              return (
                <div 
                  key={report.id}
                  className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs transition-all hover:shadow-md space-y-4 flex flex-col justify-between ${
                    report.reportFlags && report.reportFlags > 0 ? "border-red-400/50 bg-red-50/10" : "border-slate-100 dark:border-slate-800/80"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        report.type === "LOST" ? "bg-red-50 dark:bg-red-950/30 text-red-600" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                      }`}>
                        {report.type}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {report.firNumber && (
                          <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <FileText className="w-2.5 h-2.5" /> FIR Attached
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(report.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                      <img 
                        src={report.photoUrl || getRandomPlaceholderImage(report.category)} 
                        alt={report.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {report.reward && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Award className="w-3.5 h-3.5" />
                          <span>Reward: {report.reward}</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-800 dark:text-white truncate">
                          {report.title}
                        </h3>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                          {report.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    {/* Location & Safe custody */}
                    <div className="space-y-1 text-[10px] border-t border-slate-50 dark:border-slate-800/60 pt-2.5">
                      <div className="flex items-center text-slate-400 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                        <span className="truncate font-bold text-slate-500">{report.lastSeenLocation || "Last seen near main center"} ({report.city})</span>
                      </div>
                      
                      {report.type === "FOUND" && report.safeCustodyDetails && (
                        <div className="flex items-center text-slate-400 gap-1.5">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                          <span className="truncate font-bold text-emerald-600">Custody: {report.safeCustodyDetails}</span>
                        </div>
                      )}

                      {/* Nearest Police station suggestion info */}
                      {report.nearestPoliceStation && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>Nearest Police: {report.nearestPoliceStation}</span>
                          <span className="font-mono text-indigo-600 font-bold">{report.nearestPoliceContact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Privacy Lock block */}
                  <div className="space-y-2.5 pt-3.5 border-t border-slate-50 dark:border-slate-800/80">
                    {hasPrivacyAgreement ? (
                      <div className="p-2.5 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-950/20 rounded-xl space-y-1.5">
                        <p className="text-[9px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Contact Details Unlocked
                        </p>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 font-mono">
                          <p className="font-bold flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {report.contactName}</p>
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {report.contactPhone}</p>
                          <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {report.contactEmail}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-center space-y-2">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact details hidden for privacy.</span>
                        </p>
                        {connectionRequested ? (
                          <button 
                            disabled
                            className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg"
                          >
                            Connection Request Pending...
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRequestConnection(report)}
                            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-lg transition-all"
                          >
                            Request Access to Connect
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleSmartMatchingAnalysis(report)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Matches</span>
                      </button>

                      <button 
                        onClick={() => handleFlagReport(report.id)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 rounded-xl text-[10px]"
                        title="Report Fake Listing"
                      >
                        Flag Fake
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 text-xs">
                No reports matched the specified filters. Try expanding your search queries or adding new listings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REPORT LOST & FOUND FORM */}
      {activeTab === "report" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-800 dark:text-white font-sans">
              Publish Recovery Claim
            </h2>
            <p className="text-xs text-slate-500">
              Your contact privacy will be strictly guarded. OTP Verification is required to post listings.
            </p>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setFormType("LOST")}
                className={`py-3.5 rounded-xl font-sans text-xs font-bold transition-all border ${
                  formType === "LOST" 
                    ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-500" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                I Lost Something
              </button>
              <button 
                type="button"
                onClick={() => setFormType("FOUND")}
                className={`py-3.5 rounded-xl font-sans text-xs font-bold transition-all border ${
                  formType === "FOUND" 
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-500" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                I Found Something
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category *</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title (Verbatim Label) *</label>
                <input 
                  type="text"
                  placeholder="e.g. Lost Black Leather Wallet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Details & Description *</label>
              <textarea 
                placeholder="Describe brand, colors, unique identifiers, serial numbers, names, markings..."
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time *</label>
                <input 
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Photo Upload (Simulated URL or Base64)</label>
                <input 
                  type="text"
                  placeholder="Paste direct image link, or leave empty for smart AI placeholders"
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State *</label>
                <select 
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City *</label>
                <input 
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Seen Landmark Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Sector 12 Market"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Suggested Police Info dynamically computed from database */}
            {suggestedPolice && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/20 rounded-xl flex items-center justify-between text-[11px] text-slate-600 dark:text-indigo-200 animate-fade-in">
                <span className="flex items-center gap-1.5 font-sans font-medium"><Building2 className="w-3.5 h-3.5 text-indigo-600" /> Suggested Nearest HQ: {suggestedPolice.stationName}</span>
                <span className="font-mono text-indigo-600 font-bold">{suggestedPolice.phone}</span>
              </div>
            )}

            {/* Police support: optional FIR details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl space-y-3">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Police Verification Support (Optional)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">FIR / DD Entry Number</label>
                  <input 
                    type="text"
                    placeholder="e.g. FIR-2026/0921"
                    value={formFirNumber}
                    onChange={(e) => setFormFirNumber(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Police Station Jurisdiction</label>
                  <input 
                    type="text"
                    placeholder="e.g. Connaught Place"
                    value={formFirPoliceStation}
                    onChange={(e) => setFormFirPoliceStation(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {formType === "LOST" ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cash Reward (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. ₹5,000 / Box of Chocolates"
                  value={formReward}
                  onChange={(e) => setFormReward(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Safe Custody Details *</label>
                <input 
                  type="text"
                  placeholder="e.g. Deposited with Sector 3 Police Station / Guard desk"
                  value={formSafeCustody}
                  onChange={(e) => setFormSafeCustody(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
            >
              Verify & Submit Listing
            </button>
          </form>
        </div>
      )}

      {/* 4. MODERATION TAB */}
      {activeTab === "moderation" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-950 dark:text-red-200 rounded-2xl">
            <h3 className="text-sm font-extrabold flex items-center gap-1.5"><ShieldAlert className="w-5 h-5" /> Administrative Security Console</h3>
            <p className="text-xs mt-1">Authorized roles (Police / Admin) can delete listings, verify claims, or handle reported items.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80">
                  <th className="p-4">Report Details</th>
                  <th className="p-4">Posted By</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={r.photoUrl || getRandomPlaceholderImage(r.category)} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white">{r.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.category} | {r.type} | {r.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      {r.contactEmail}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        r.reportFlags && r.reportFlags > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}>
                        {r.reportFlags || 0} Flags
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button 
                          onClick={() => handleModerateListing(r.id, "APPROVED")}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[10px] font-bold rounded-lg"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleModerateListing(r.id, "RESOLVED")}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold rounded-lg"
                        >
                          Mark Matched
                        </button>
                        <button 
                          onClick={() => handleModerateListing(r.id, "DELETED")}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 text-[10px] font-bold rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                      No reports active on the network.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATCH DETAILS MODAL (GEMINI AI ANALYSIS) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-w-2xl w-full rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-indigo-950 text-white">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">Target Inspection Claim</span>
                <h3 className="text-sm font-extrabold">{selectedReport.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img 
                  src={selectedReport.photoUrl || getRandomPlaceholderImage(selectedReport.category)} 
                  alt="" 
                  className="w-full h-44 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedReport.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      selectedReport.type === "LOST" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {selectedReport.type}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-sans">{selectedReport.description}</p>
                  <p className="text-slate-400 font-mono text-[10px]">Location: {selectedReport.lastSeenLocation || "Unknown"} ({selectedReport.city}, {selectedReport.state})</p>
                  
                  {selectedReport.firNumber && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-lg text-[10px] text-slate-500">
                      <strong>FIR Number: </strong>{selectedReport.firNumber} at {selectedReport.firPoliceStation}
                    </div>
                  )}
                </div>
              </div>

              {/* Smart AI Match suggest list */}
              <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black font-sans flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Gemini AI Match Insights</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Comparing candidates</span>
                </div>

                {matchingLoader ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                    <span>Gemini is comparing descriptions, locations & dates...</span>
                  </div>
                ) : aiMatches.length === 0 ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 text-center text-slate-400 rounded-xl leading-relaxed">
                    No matching противоположный entries found in database currently. Gemini will check again when new records are submitted.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiMatches.map((match) => (
                      <div key={match.candidateId} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-indigo-100/25 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-2.5">
                            <img 
                              src={match.candidate?.photoUrl || getRandomPlaceholderImage(match.candidate?.category || "Other")} 
                              alt="" 
                              className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-extrabold text-slate-800 dark:text-white">{match.candidate?.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{match.candidate?.city}, {match.candidate?.state}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              match.matchPercentage >= 75 ? "bg-emerald-500 text-white" : match.matchPercentage >= 50 ? "bg-amber-500 text-white" : "bg-slate-500 text-white"
                            }`}>
                              {match.matchPercentage}% Match
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-indigo-200 leading-relaxed font-sans bg-indigo-50/20 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100/10">
                          {match.matchExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 rounded-3xl shadow-xl space-y-4 text-xs text-center">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">OTP Claim Verification</h3>
              <p className="text-[11px] text-slate-500">
                To guarantee zero fake listings on JeevanSetu AI, verify your publishing claim with this instant one-time-password.
              </p>
            </div>

            {/* OTP presentation simulating real SMS/Email message */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-sans font-bold block text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Simulated SMS Delivery</span>
              "JeevanSetu: Your verification code is <span className="text-indigo-600 font-bold text-xs">{generatedOtp}</span>. Please do not share this."
            </div>

            <input 
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => { setShowOtpModal(false); setPendingReportData(null); }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerifyOtp}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
              >
                Verify & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple visual local icon helper
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
