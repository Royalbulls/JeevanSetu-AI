import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserCheck, 
  HeartHandshake, 
  PhoneCall, 
  MapPin, 
  Activity, 
  Calendar,
  AlertCircle,
  CheckCircle2, 
  ShieldCheck, 
  Map, 
  MessageSquare, 
  Info, 
  Award, 
  Heart, 
  Check, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  Share2, 
  Compass, 
  Eye, 
  EyeOff, 
  Lock, 
  Clock,
  Navigation,
  FileBadge,
  Sparkle
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { subscribeDonors, registerDonor } from "../lib/firestoreService";
import { Donor, BloodGroup } from "../types";

// Static Indian States list for dropdown
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

// Presets for donor avatars
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60"
];

export const BloodDonorSearch: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  
  // Real-time states
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"find" | "register" | "insights">("find");

  // Search Filters
  const [searchGroup, setSearchGroup] = useState<string>("All");
  const [searchState, setSearchState] = useState<string>("");
  const [searchCity, setSearchCity] = useState<string>("");
  const [searchPincode, setSearchPincode] = useState<string>("");
  const [searchAvailableOnly, setSearchAvailableOnly] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchDistance, setSearchDistance] = useState<number>(50); // in km

  // Registration Form States
  const [fullName, setFullName] = useState("");
  const [photo, setPhoto] = useState(AVATAR_PRESETS[0]);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.O_POS);
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [lastDonatedDate, setLastDonatedDate] = useState("");
  const [medicalEligibility, setMedicalEligibility] = useState(true);
  
  // Privacy Form Settings
  const [hidePhone, setHidePhone] = useState(false);
  const [hideLocation, setHideLocation] = useState(false);

  // OTP Verification Simulator States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState("");

  // Chat Sandbox States
  const [activeChatDonor, setActiveChatDonor] = useState<Donor | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<{ [key: string]: Array<{ sender: "user" | "donor"; text: string; time: string }> }>({});

  // Donation history & certificate states
  const [showCertificate, setShowCertificate] = useState(false);
  const [certDonor, setCertDonor] = useState<Donor | null>(null);

  // Load browser geolocation for local distance calculations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.log("Geolocation permission denied: fallback to manual distance checks.", err)
      );
    }
  }, []);

  // Listen for openDonorRegistration custom event from AI Assistant
  useEffect(() => {
    const handleOpenReg = () => {
      setActiveTab("register");
    };
    window.addEventListener("openDonorRegistration", handleOpenReg);
    return () => window.removeEventListener("openDonorRegistration", handleOpenReg);
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeDonors((data) => {
      setDonors(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Prepopulate form with logged in user profile details
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setBloodGroup((profile.bloodGroup as BloodGroup) || BloodGroup.O_POS);
      setCity(profile.location?.address || "");
      
      // Look up if user is already in the donors collection to load historical records
      const existingDonor = donors.find(d => d.id === user?.uid);
      if (existingDonor) {
        setPhoto(existingDonor.photo || AVATAR_PRESETS[0]);
        setGender(existingDonor.gender || "Male");
        setDob(existingDonor.dob || "");
        setAddress(existingDonor.address || "");
        setState(existingDonor.state || "");
        setDistrict(existingDonor.district || "");
        setPincode(existingDonor.pincode || "");
        setIsAvailable(existingDonor.isAvailable);
        setLastDonatedDate(existingDonor.lastDonatedDate || "");
        setMedicalEligibility(existingDonor.medicalEligibility !== false);
        setHidePhone(!!existingDonor.hidePhone);
        setHideLocation(!!existingDonor.hideLocation);
        setIsOtpVerified(!!existingDonor.isOtpVerified);
        if (existingDonor.location) {
          setGpsLat(existingDonor.location.lat);
          setGpsLng(existingDonor.location.lng);
        }
      }
    }
  }, [profile, donors, user]);

  // Haversine formula to compute spherical distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLng(pos.coords.longitude);
        alert(`Exact GPS verified: Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
      }, () => {
        alert("Failed to acquire location. Please enable location permissions.");
      });
    }
  };

  const triggerOtpSend = () => {
    if (!phone) {
      alert("Please enter a valid mobile number first.");
      return;
    }
    setOtpSent(true);
    setVerificationFeedback("Verifying...");
    setTimeout(() => {
      setVerificationFeedback("A 6-digit OTP has been dispatched to " + phone + ". (Simulated code is 123456)");
    }, 1000);
  };

  const verifyOtp = () => {
    if (otpCode === "123456") {
      setIsOtpVerified(true);
      setOtpSent(false);
      alert("Mobile number verified successfully!");
    } else {
      alert("Invalid code. Please enter 123456.");
    }
  };

  // Submit/Register Donor
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in using Google to register as a donor.");
      return;
    }

    try {
      const donorPayload: Omit<Donor, "id"> = {
        fullName,
        bloodGroup,
        city,
        phone,
        isAvailable,
        lastDonatedDate,
        location: gpsLat && gpsLng ? { lat: gpsLat, lng: gpsLng, address: city } : undefined,
        photo,
        gender,
        dob,
        email,
        address,
        state,
        district,
        pincode,
        hidePhone,
        hideLocation,
        medicalEligibility,
        isOtpVerified,
        donorVerificationStatus: profile?.donorVerificationStatus || "PENDING",
        isVerifiedDonor: profile?.isVerifiedDonor || false,
        bloodBankVerified: false,
        donationHistory: []
      };

      await registerDonor(donorPayload, user.uid);
      
      // Update primary user profile in Firestore 'users'
      await updateProfile({
        fullName,
        phone,
        bloodGroup,
        isDonor: true,
        location: {
          lat: gpsLat || 28.6139,
          lng: gpsLng || 77.2090,
          address: city + ", " + state
        }
      });

      alert("Donor Profile Sync Successful! You are registered in JeevanSetu's live network.");
      setActiveTab("find");
    } catch (err) {
      console.error(err);
      alert("Error saving registration details: " + err);
    }
  };

  // Chat actions
  const sendChatMessage = () => {
    if (!chatMessage.trim() || !activeChatDonor) return;
    const donorId = activeChatDonor.id;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = { sender: "user" as const, text: chatMessage, time: now };
    const currentList = chatLogs[donorId] || [];
    const updated = { ...chatLogs, [donorId]: [...currentList, newMsg] };
    setChatLogs(updated);
    setChatMessage("");

    // Simulated Donor Reply after 1.5s
    setTimeout(() => {
      const responses = [
        "Hello, I can help! Please share the hospital name and required units.",
        "Yes, I am available. Can you please call me so we can coordinate?",
        "I'm close by. I will contact the blood bank right away.",
        "Thank you for reaching out. Please send me the patient name and contact number."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      const replyMsg = { sender: "donor" as const, text: randomReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatLogs(prev => ({
        ...prev,
        [donorId]: [...(prev[donorId] || []), replyMsg]
      }));
    }, 1500);
  };

  // Next eligible donation calculation (3 months / 90 days rule)
  const getEligibilityInfo = (donor: Donor) => {
    if (!donor.lastDonatedDate) return { eligible: true, dateString: "Eligible Now" };
    const lastDate = new Date(donor.lastDonatedDate);
    const nextDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const isEligible = now >= nextDate;
    return {
      eligible: isEligible && donor.medicalEligibility !== false,
      dateString: nextDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  // Filter donors according to form criteria
  const filteredDonors = donors.filter(donor => {
    // Blood group match
    if (searchGroup !== "All" && donor.bloodGroup !== searchGroup) return false;
    // State match
    if (searchState && donor.state && !donor.state.toLowerCase().includes(searchState.toLowerCase())) return false;
    // City match
    if (searchCity && donor.city && !donor.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
    // Pincode match
    if (searchPincode && donor.pincode && donor.pincode !== searchPincode) return false;
    // Availability
    if (searchAvailableOnly && !donor.isAvailable) return false;
    // Geolocation / Distance search
    if (userLocation && donor.location?.lat && donor.location?.lng) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, donor.location.lat, donor.location.lng);
      if (dist > searchDistance) return false;
    }
    return true;
  });

  // Calculate insights
  const totalDonors = donors.length;
  const availableDonorsCount = donors.filter(d => d.isAvailable).length;
  const verifiedDonorsCount = donors.filter(d => d.isVerifiedDonor || d.donorVerificationStatus === "VERIFIED").length;
  const livesHelpedCount = donors.length * 3; // Simulated average multiplier
  const stateBreakdown = donors.reduce((acc, curr) => {
    if (curr.state) {
      acc[curr.state] = (acc[curr.state] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="space-y-6">
      {/* Upper Module Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-red-600 animate-pulse" />
            <span>National Voluntary Blood Donor Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time public donor network with privacy controls, location tracing, and direct contact routers</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab("find")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "find" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Find Donors
          </button>
          <button
            onClick={() => {
              if (!user) {
                alert("Please log in using Google to manage your donor registration.");
                return;
              }
              setActiveTab("register");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "register" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {profile?.isDonor ? "My Donor Profile" : "Register as Donor"}
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "insights" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Insights Dashboard
          </button>
        </div>
      </div>

      {/* VIEW 1: FIND DONORS */}
      {activeTab === "find" && (
        <div className="space-y-6">
          {/* Advanced Search Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-50 dark:border-slate-800 pb-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Multi-Criteria Live Filter Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* State Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">State</label>
                <select
                  value={searchState}
                  onChange={e => setSearchState(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">City / Town</label>
                <input
                  type="text"
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  placeholder="e.g. Bhopal, New Delhi"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Pincode Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pincode</label>
                <input
                  type="text"
                  value={searchPincode}
                  onChange={e => setSearchPincode(e.target.value)}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Distance Slider (Conditional on location) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center justify-between">
                  <span>Within Radius</span>
                  <span className="text-red-500 font-bold">{searchDistance} km</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={searchDistance}
                    onChange={e => setSearchDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Blood group pills and toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-50 dark:border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Blood Group Required</label>
                <div className="flex flex-wrap gap-1.5">
                  {["All", ...Object.values(BloodGroup)].map(g => (
                    <button
                      key={g}
                      onClick={() => setSearchGroup(g)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        searchGroup === g 
                          ? "bg-red-600 border-red-600 text-white shadow-xs" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={searchAvailableOnly}
                    onChange={e => setSearchAvailableOnly(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Available Donors Only</span>
                </label>

                <button
                  onClick={() => {
                    setSearchState("");
                    setSearchCity("");
                    setSearchPincode("");
                    setSearchGroup("All");
                    setSearchAvailableOnly(false);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Split: Grid on left, Map on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Donor Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-red-500" />
                  <span>Matching Voluntary Responders ({filteredDonors.length})</span>
                </h3>
                {userLocation && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    Distance routing active
                  </span>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                </div>
              ) : filteredDonors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDonors.map((donor) => {
                    const nextCheck = getEligibilityInfo(donor);
                    const distanceVal = userLocation && donor.location 
                      ? calculateDistance(userLocation.lat, userLocation.lng, donor.location.lat, donor.location.lng)
                      : null;
                    
                    return (
                      <div 
                        key={donor.id}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Profile Photo */}
                            <img 
                              src={donor.photo || AVATAR_PRESETS[0]} 
                              alt={donor.fullName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="font-sans font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {donor.fullName}
                                </p>
                                {/* Verified badge */}
                                {(donor.isVerifiedDonor || donor.donorVerificationStatus === "VERIFIED") && (
                                  <span title="Admin Approved" className="inline-flex shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                                  </span>
                                )}
                                {donor.isOtpVerified && (
                                  <span title="Phone OTP Verified" className="inline-flex shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{donor.city}, {donor.state || "India"}</span>
                                {distanceVal !== null && (
                                  <span className="font-bold text-red-500 ml-1">({distanceVal.toFixed(1)} km)</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center border border-red-100 dark:border-red-900/30">
                              {donor.bloodGroup}
                            </span>
                            <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded uppercase mt-1 ${donor.isAvailable ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                              {donor.isAvailable ? "Active" : "Away"}
                            </span>
                          </div>
                        </div>

                        {/* Middle: Details & Privacy representation */}
                        <div className="text-[10px] space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gender / Age:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{donor.gender || "Unspecified"} ({donor.dob ? (new Date().getFullYear() - new Date(donor.dob).getFullYear()) : "Unspecified"})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Last Donation:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{donor.lastDonatedDate ? new Date(donor.lastDonatedDate).toLocaleDateString() : "Never"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Next Eligibility:</span>
                            <span className={`font-semibold ${nextCheck.eligible ? "text-emerald-600" : "text-amber-500"}`}>
                              {nextCheck.dateString}
                            </span>
                          </div>
                        </div>

                        {/* Actions Router */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                          {donor.hidePhone ? (
                            <span className="text-[9px] text-slate-400 italic flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg flex-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Contact via Chat
                            </span>
                          ) : (
                            <a 
                              href={`tel:${donor.phone}`}
                              className="flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex-1 transition-all"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          )}

                          <a 
                            href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, "")}?text=Emergency%20Blood%20Requirement%20JeevanSetu`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex-1 transition-all"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>

                          <button 
                            onClick={() => setActiveChatDonor(donor)}
                            className="flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex-1 transition-all"
                          >
                            <Send className="w-3 h-3 text-red-500" />
                            <span>In-App Chat</span>
                          </button>

                          {/* Certificate view trigger (if verified) */}
                          {(donor.isVerifiedDonor || donor.donorVerificationStatus === "VERIFIED") && (
                            <button
                              onClick={() => {
                                setCertDonor(donor);
                                setShowCertificate(true);
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 rounded-lg"
                              title="Donor Certificate"
                            >
                              <Award className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No Match Found</p>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto">There are currently no voluntary donors matching your exact filtering parameters in the JeevanSetu database.</p>
                </div>
              )}
            </div>

            {/* Right: GPS Location Map Tracker */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-red-600" />
                    <span>Live Geolocation Tracer</span>
                  </h3>
                  <span className="text-[8px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded font-mono">MAP</span>
                </div>

                <div className="relative w-full h-64 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-grid-slate-900/40 pointer-events-none" />
                  
                  {/* Abstract lines to represent local grid mapping */}
                  <svg className="absolute inset-0 w-full h-full text-slate-800 opacity-60" fill="none" viewBox="0 0 300 200">
                    <path d="M 10 50 Q 80 10, 150 90 T 290 140" stroke="currentColor" strokeWidth="1" />
                    <path d="M 30 180 Q 150 20, 270 180" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M 150 10 L 150 190" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" />
                    <circle cx="150" cy="100" r="14" className="fill-red-500/10 text-red-500 animate-ping" />
                    <circle cx="150" cy="100" r="4.5" className="fill-red-600" />
                  </svg>

                  {/* Draw markers for each matching donor that allowed location sharing */}
                  <div className="absolute inset-0 pointer-events-none">
                    {filteredDonors.filter(d => !d.hideLocation && d.location?.lat).slice(0, 10).map((d, index) => {
                      const offsetLat = (d.location!.lat % 0.1) * 600 - 30; // Scale offsets visually
                      const offsetLng = (d.location!.lng % 0.1) * 600 - 30;
                      return (
                        <div 
                          key={d.id} 
                          className="absolute pointer-events-auto cursor-pointer"
                          style={{ top: `${Math.max(20, Math.min(220, 100 + offsetLat))}px`, left: `${Math.max(20, Math.min(260, 150 + offsetLng))}px` }}
                          title={d.fullName}
                          onClick={() => alert(`Donor Location: ${d.fullName} (${d.bloodGroup}) is located at approx. ${d.city}.`)}
                        >
                          <div className="flex flex-col items-center">
                            <span className="px-1.5 py-0.5 bg-slate-900 border border-red-500 text-[8px] text-white font-extrabold rounded shadow-sm">
                              {d.bloodGroup}
                            </span>
                            <MapPin className="w-4 h-4 text-red-600 -mt-1 fill-red-500/20" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative z-10 text-center space-y-1.5 bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-[85%] backdrop-blur-xs shadow-lg">
                    <Compass className="w-5 h-5 text-red-500 mx-auto animate-spin" />
                    <p className="font-sans font-bold text-[10px] text-white">Active Donors on Radar</p>
                    <p className="text-[8px] text-slate-400 font-mono">Displaying nearby lifesaving nodes who enabled GPS coordinate sharing</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>Privacy Safeguard Protocol</span>
                  </p>
                  <p>In alignment with voluntary protection standards, exact coordinates are approximate until coordinates are confirmed. Search using filters or click individual records to contact immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: REGISTER OR UPDATE DONOR PROFILE */}
      {activeTab === "register" && user && (
        <form onSubmit={handleRegisterSubmit} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserCheck className="w-5.5 h-5.5 text-red-600" />
              <span>Voluntary Blood Donor Registration</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Please populate the medical details accurately. Your volunteer profile preserves lives in times of national crisis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Section A: Basic Details */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-50 dark:border-slate-800 pb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span>1. Personal & Identity</span>
              </p>

              {/* Photo selector preset */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Profile Avatar</label>
                <div className="flex items-center space-x-2">
                  <img 
                    src={photo} 
                    alt="Current Selected Avatar" 
                    className="w-12 h-12 rounded-full object-cover border border-red-500"
                  />
                  <div className="grid grid-cols-6 gap-1 flex-1">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPhoto(av)}
                        className={`w-7 h-7 rounded-full overflow-hidden border ${photo === av ? "border-red-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        <img src={av} className="w-full h-full object-cover" alt="Preset choice" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Official Name"
                />
              </div>

              {/* Blood Group */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {Object.values(BloodGroup).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="contact@gmail.com"
                />
              </div>
            </div>

            {/* Section B: Contact & Coordinates */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-50 dark:border-slate-800 pb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>2. Contact & Geolocation</span>
              </p>

              {/* Phone with Verification Trigger */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center justify-between">
                  <span>Mobile Number</span>
                  {isOtpVerified ? (
                    <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> OTP Verified
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold">Unverified</span>
                  )}
                </label>
                <div className="flex space-x-1">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setIsOtpVerified(false); // require re-verification
                    }}
                    placeholder="+91 Mobile No"
                    className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={triggerOtpSend}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold"
                    >
                      Send OTP
                    </button>
                  )}
                </div>

                {/* Simulated Verification Sub-Modal inside form */}
                {otpSent && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-2 mt-2">
                    <p className="text-[9px] text-red-600 dark:text-red-400 leading-tight font-medium">{verificationFeedback}</p>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        placeholder="Enter 123456"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 text-xs font-bold rounded-lg border border-red-200 w-24 text-center"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* State and District */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">State</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="District"
                  />
                </div>
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="6 digits"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Complete Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Street No, Area, Landmark"
                />
              </div>

              {/* GPS coordinates detecting button */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Exact GPS coordinate mapping</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="flex items-center space-x-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold"
                  >
                    <Compass className="w-3.5 h-3.5 text-red-500" />
                    <span>Detect Location</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {gpsLat ? `${gpsLat.toFixed(4)}, ${gpsLng?.toFixed(4)}` : "Not detected (Optional)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Medical Records & Privacy */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-50 dark:border-slate-800 pb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>3. Medical & Privacy</span>
              </p>

              {/* Last Donation Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Last Blood Donation Date</label>
                <input
                  type="date"
                  value={lastDonatedDate}
                  onChange={e => setLastDonatedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[8px] text-slate-400 block font-mono">Leave blank if this is your first life-saving donation.</span>
              </div>

              {/* Medical Eligibility self check */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Basic Eligibility Assessment</p>
                <div className="space-y-1.5 text-[9px] text-slate-500">
                  <div className="flex items-start space-x-1">
                    <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <span>Donor age is between 18 and 65 years.</span>
                  </div>
                  <div className="flex items-start space-x-1">
                    <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <span>Weight is 45kg or higher.</span>
                  </div>
                  <div className="flex items-start space-x-1">
                    <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <span>No active historical infectious illnesses.</span>
                  </div>
                </div>

                <label className="flex items-center space-x-1.5 cursor-pointer pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={medicalEligibility}
                    onChange={e => setMedicalEligibility(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">I declare I am eligible.</span>
                </label>
              </div>

              {/* Status Toggle (Available / Away) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Availability Status</label>
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Available to donate now?</span>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${isAvailable ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {isAvailable ? "AVAILABLE" : "NOT AVAILABLE"}
                  </button>
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Privacy Safeguards</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePhone}
                      onChange={e => setHidePhone(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Hide phone number (Use in-app chat)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideLocation}
                      onChange={e => setHideLocation(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Hide exact location until rescue coordinate match</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("find")}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
            >
              {profile?.isDonor ? "Save Updates" : "Submit Voluntary Profile"}
            </button>
          </div>
        </form>
      )}

      {/* VIEW 3: INSIGHTS DASHBOARD */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Voluntary Registry</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalDonors}</p>
              <span className="text-[9px] text-emerald-500 font-bold block">100% active responders</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Available Right Now</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{availableDonorsCount}</p>
              <span className="text-[9px] text-slate-400 block">Ready for emergency coordination</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Verified Donors</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{verifiedDonorsCount}</p>
              <span className="text-[9px] text-blue-500 font-bold block">Gold badge credential verified</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Preserved Lives Saved</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{livesHelpedCount}</p>
              <span className="text-[9px] text-rose-500 font-bold block">Through real-time matching</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regional breakdown chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-white">Registry Regional Density Map</h4>
                <p className="text-[10px] text-slate-400">Voluntary responders sorted by Indian states</p>
              </div>

              <div className="space-y-3">
                {Object.keys(stateBreakdown).length > 0 ? (
                  Object.entries(stateBreakdown).slice(0, 5).map(([stateName, count]) => {
                    const percentage = totalDonors > 0 ? Math.round((Number(count) / totalDonors) * 100) : 0;
                    return (
                      <div key={stateName} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span>{stateName}</span>
                          <span className="font-mono font-bold">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No state data has been registered yet.</p>
                )}
              </div>
            </div>

            {/* Medical Blood compatibility index cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-white">Emergency Blood Group Compatibility</h4>
                <p className="text-[10px] text-slate-400">Critical match indicator index guide</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">
                <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100/30 rounded-xl space-y-1">
                  <p className="font-bold text-red-600">Universal Donor</p>
                  <p className="font-mono text-[11px] text-slate-900 dark:text-slate-100">O Negative (O-)</p>
                  <p>Can donate to all blood groups in emergency surgeries.</p>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 rounded-xl space-y-1">
                  <p className="font-bold text-blue-600">Universal Recipient</p>
                  <p className="font-mono text-[11px] text-slate-900 dark:text-slate-100">AB Positive (AB+)</p>
                  <p>Can receive blood transfusions from all blood groups safely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT SIMULATOR POPUP MODULE */}
      {activeChatDonor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-[450px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeChatDonor.photo || AVATAR_PRESETS[0]} 
                  alt={activeChatDonor.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-red-500"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>{activeChatDonor.fullName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </h4>
                  <p className="text-[9px] text-slate-400">{activeChatDonor.bloodGroup} Voluntary Donor</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatDonor(null)}
                className="text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold"
              >
                Close
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/40">
              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[10px] text-slate-500">
                <p className="font-semibold text-blue-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JeevanSetu Secure Routing Sandbox</span>
                </p>
                <p className="mt-0.5">Your conversation history with voluntary donors is fully encrypted. Please present the exact patient criteria politely.</p>
              </div>

              {(chatLogs[activeChatDonor.id] || []).map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs space-y-1 ${isUser ? "bg-red-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800 rounded-tl-none"}`}>
                      <p>{msg.text}</p>
                      <span className="text-[8px] opacity-75 block text-right font-mono">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your emergency query..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={sendChatMessage}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOLUNTARY DONOR CERTIFICATE POPUP MODULE */}
      {showCertificate && certDonor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border-4 border-amber-500 p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center relative overflow-hidden space-y-6">
            {/* Visual Gold Crest */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-xl opacity-30 pointer-events-none" />
            
            <div className="relative z-10 space-y-2">
              <Award className="w-12 h-12 text-amber-500 mx-auto drop-shadow-md animate-bounce" />
              <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white uppercase">
                Certificate of Life Saving Appreciation
              </h2>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">JeevanSetu National Voluntary Network</p>
            </div>

            <div className="border-y border-amber-200/50 py-6 space-y-4 my-4 max-w-lg mx-auto">
              <p className="text-xs text-slate-500 italic">This credential certifies that our voluntary health responder</p>
              <h3 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-wide underline decoration-amber-500 decoration-2 underline-offset-4">
                {certDonor.fullName}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                has selflessly registered with the **{certDonor.bloodGroup}** blood group, completed credentials validation, and stands available to coordinate live-saving rescue operations to preserve Indian citizen health in times of absolute emergency.
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono max-w-md mx-auto pt-4">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">GOVERNMENT CREDENTIAL ID</p>
                <p>JS-DONOR-{certDonor.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">AUTHORIZED STAMP</p>
                <p>JeevanSetu Core System AI</p>
              </div>
            </div>

            <div className="flex justify-center space-x-2 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Print Certificate
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
