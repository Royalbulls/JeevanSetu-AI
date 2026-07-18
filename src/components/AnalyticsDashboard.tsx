import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Heart, 
  ShieldAlert, 
  Building, 
  Activity, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  RefreshCw
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BloodRequest, UserProfile, Hospital } from "../types";
import { VERIFIED_HOSPITALS } from "../data/verifiedData";

export const AnalyticsDashboard: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<UserProfile[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Load requests
      let snapReqs;
      try {
        snapReqs = await getDocs(collection(db, "blood_requests"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "blood_requests");
        throw err;
      }
      const rList: BloodRequest[] = [];
      snapReqs.forEach(d => {
        rList.push({ id: d.id, ...d.data() } as BloodRequest);
      });
      setRequests(rList);

      // Load donors from donors collection
      let snapDonors;
      try {
        snapDonors = await getDocs(collection(db, "donors"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "donors");
        throw err;
      }
      const dList: UserProfile[] = [];
      snapDonors.forEach(d => {
        const data = d.data();
        dList.push({
          uid: d.id,
          fullName: data.fullName || "",
          donorVerificationStatus: data.donorVerificationStatus || "NONE",
          isDonor: true
        } as any);
      });
      setDonors(dList);

      // Load hospitals
      let snapHosp;
      try {
        snapHosp = await getDocs(collection(db, "hospitals"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "hospitals");
        throw err;
      }
      const hList: Hospital[] = [];
      snapHosp.forEach(d => {
        hList.push({ id: d.id, ...d.data() } as Hospital);
      });
      // Fallback to static verified hospitals if Firestore collection is empty
      setHospitals(hList.length > 0 ? hList : VERIFIED_HOSPITALS);
    } catch (e) {
      console.error("Error loading analytics:", e);
      setHospitals(VERIFIED_HOSPITALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Compute metrics
  const totalBloodRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === "FULFILLED").length;
  const pendingRequests = totalBloodRequests - fulfilledRequests;

  const totalRegisteredDonors = donors.length;
  const verifiedDonors = donors.filter(d => d.donorVerificationStatus === "VERIFIED").length;

  let totalIcuBeds = 0;
  let totalOxygenBeds = 0;
  let totalGeneralBeds = 0;

  hospitals.forEach(h => {
    if (h.bedsAvailable) {
      totalIcuBeds += h.bedsAvailable.icu || 0;
      totalOxygenBeds += h.bedsAvailable.oxygen || 0;
      totalGeneralBeds += h.bedsAvailable.general || 0;
    }
  });

  // Calculate percentages
  const fulfillmentRate = totalBloodRequests > 0 ? Math.round((fulfilledRequests / totalBloodRequests) * 100) : 0;
  const donorVerificationRate = totalRegisteredDonors > 0 ? Math.round((verifiedDonors / totalRegisteredDonors) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Platform Health & Inventory Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time aggregate analytics tracking critical healthcare assets, emergency blood requests, and responder availability indexes</p>
        </div>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Aggregating real-time hospital bed status and donor metrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Blood Requests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Blood Requests</span>
                <div className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalBloodRequests}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{fulfilledRequests} Fulfilled • {pendingRequests} Pending</span>
                </div>
              </div>
            </div>

            {/* Donor Registry */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Voluntary Donors</span>
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalRegisteredDonors}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{verifiedDonors} Verified • {donorVerificationRate}% verified rate</span>
                </div>
              </div>
            </div>

            {/* Critical Bed Inventory */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total ICU Beds</span>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalIcuBeds}</p>
                <div className="text-[10px] text-slate-400 mt-1">
                  <span>Across {hospitals.length} verified facilities</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Success Index */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Success Index</span>
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{fulfillmentRate}%</p>
                <div className="text-[10px] text-slate-400 mt-1">
                  <span>Aggregate blood request fulfillment rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Progress Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Bed Inventory Breakdown */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-5">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-4.5 h-4.5 text-blue-500" />
                  <span>Critical Hospital Bed Asset Allocations</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Live counts across all linked medical facilities</p>
              </div>

              <div className="space-y-4">
                {/* ICU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Intensive Care Unit (ICU) Beds</span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">{totalIcuBeds}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (totalIcuBeds / 100) * 100)}%` }} />
                  </div>
                </div>

                {/* Oxygen */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Oxygen-Equipped High Dependency Beds</span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">{totalOxygenBeds}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (totalOxygenBeds / 500) * 100)}%` }} />
                  </div>
                </div>

                {/* General */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">General Ward Care Beds</span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">{totalGeneralBeds}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totalGeneralBeds / 1000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Request Distribution */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Regional Demand Fulfilled Comparison</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Ratio of incoming emergency request response completions</p>
              </div>

              <div className="flex items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  {/* Custom SVG Circular Progress */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      className="text-slate-100 dark:text-slate-800 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      className="text-emerald-500 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - fulfillmentRate / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{fulfillmentRate}%</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fulfilled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
