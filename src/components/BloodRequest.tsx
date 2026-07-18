import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  HeartHandshake, 
  MapPin, 
  PhoneCall, 
  Calendar, 
  Plus, 
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getBloodRequests, addBloodRequest } from "../lib/firestoreService";
import { BloodRequest as BloodRequestType, BloodGroup } from "../types";

export const BloodRequest: React.FC = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<BloodRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReqForm, setShowReqForm] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<{
    bloodGroup: string;
    city: string;
    patientName: string;
  } | null>(null);

  // Form Fields
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.O_POS);
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [requiredBefore, setRequiredBefore] = useState("");
  const [emergencyLevel, setEmergencyLevel] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [reason, setReason] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getBloodRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    if (profile) {
      setContactNumber(profile.phone || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBloodRequest({
        patientName,
        bloodGroup,
        unitsRequired,
        hospitalName,
        hospitalAddress,
        city,
        state,
        contactNumber,
        requiredDate,
        requiredBefore,
        emergencyLevel,
        reason,
        createdBy: user?.uid || "anon"
      });

      setPostSuccess(true);
      setShowReqForm(false);
      
      // Setup the push notification simulation banner
      setNotificationBanner({
        bloodGroup,
        city,
        patientName
      });

      // Clear form
      setPatientName("");
      setUnitsRequired(1);
      setHospitalName("");
      setHospitalAddress("");
      setCity("");
      setState("");
      setRequiredDate("");
      setRequiredBefore("");
      setEmergencyLevel("High");
      setReason("");

      loadRequests();

      // Clear the notification simulation banner after 8 seconds
      setTimeout(() => {
        setNotificationBanner(null);
      }, 8000);

    } catch (err) {
      console.error(err);
    }
  };

  const activeReqs = requests.filter(r => r.status === "PENDING" || r.status === "URGENT");

  return (
    <div className="space-y-6 relative">
      {/* Real-time Simulated Push Notification Banner */}
      {notificationBanner && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900/95 dark:bg-slate-950/95 text-white border border-red-500/30 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] uppercase font-mono font-extrabold text-red-500 tracking-wider">🚨 Broadcast Notification Sent</p>
            <p className="text-xs font-bold text-slate-100">JeevanSetu emergency beacon triggered!</p>
            <p className="text-[11px] text-slate-300 leading-normal">
              Urgent request for <span className="font-extrabold text-red-400">{notificationBanner.bloodGroup}</span> blood for <span className="font-semibold text-white">{notificationBanner.patientName}</span> has been pushed to matching registered donors in <span className="font-semibold text-white">{notificationBanner.city}</span>.
            </p>
          </div>
          <button 
            onClick={() => setNotificationBanner(null)} 
            className="text-slate-400 hover:text-white font-bold text-xs shrink-0 self-start"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-red-600" />
            <span>Emergency Blood Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Post blood requirements or coordinate with patients in critical emergency need</p>
        </div>

        <button
          onClick={() => {
            setShowReqForm(!showReqForm);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Blood Request</span>
        </button>
      </div>

      {showReqForm && (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Emergency Patient Blood Request</h3>
            <span className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 rounded font-mono">Critical Need</span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Patient Full Name</label>
              <input 
                type="text" 
                required
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Patient's Name" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Required Blood Group</label>
              <select 
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {Object.values(BloodGroup).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Units Required (Pints)</label>
              <input 
                type="number" 
                min="1"
                required
                value={unitsRequired}
                onChange={e => setUnitsRequired(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Hospital Name</label>
              <input 
                type="text" 
                required
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                placeholder="Hospital Name" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Hospital Address & Landmark</label>
              <input 
                type="text" 
                required
                value={hospitalAddress}
                onChange={e => setHospitalAddress(e.target.value)}
                placeholder="Hospital Address" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">City</label>
              <input 
                type="text" 
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="City Name" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">State</label>
              <input 
                type="text" 
                required
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="e.g. Madhya Pradesh, Delhi" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Attendant Phone Number</label>
              <input 
                type="tel" 
                required
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="Attendant Contact" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Required Date</label>
              <input 
                type="date" 
                required
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Required Before (Time)</label>
              <input 
                type="text" 
                required
                value={requiredBefore}
                onChange={e => setRequiredBefore(e.target.value)}
                placeholder="e.g. 12:00 PM, ASAP" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Emergency Level</label>
              <select 
                value={emergencyLevel}
                onChange={e => setEmergencyLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Diagnosis / Reason</label>
              <input 
                type="text" 
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Major surgery, Dengue count" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setShowReqForm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Broadcast Request
              </button>
            </div>
          </form>
        </div>
      )}

      {postSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Your critical blood request has been broadcasted to our database network.</span>
        </div>
      )}

      {/* Active Requests List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            <span>Active Patient Requirements ({activeReqs.length})</span>
          </h3>
          <button 
            onClick={loadRequests}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-950 dark:hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-28 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          </div>
        ) : activeReqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReqs.map((req) => {
              // Custom Emergency Level Styling
              const badgeColors = {
                Critical: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900",
                High: "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900",
                Medium: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
                Low: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900",
              };
              const currentBadge = req.emergencyLevel || "High";
              const currentBadgeClass = badgeColors[currentBadge as keyof typeof badgeColors] || badgeColors.High;

              return (
                <div 
                  key={req.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border ${currentBadgeClass}`}>
                          {currentBadge}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white leading-tight mt-1.5">
                        Patient: {req.patientName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Reason: {req.reason}</p>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <span className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-base font-sans font-extrabold flex items-center justify-center shadow-xs">
                        {req.bloodGroup}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">{req.unitsRequired} Units</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold truncate">{req.hospitalName}, {req.city}{req.state ? `, ${req.state}` : ""}</span>
                    </div>
                    <div className="pl-5 text-[10px] text-slate-400">{req.hospitalAddress}</div>
                    
                    {req.requiredBefore && (
                      <div className="flex items-center space-x-1.5 pl-5 pt-1 text-[10px] text-rose-500 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>Required Before: {req.requiredBefore} ({new Date(req.requiredDate).toLocaleDateString()})</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400">Source: JeevanSetu Cloud DB</span>
                    <a 
                      href={`tel:${req.contactNumber}`}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Coordinate Rescue</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No data available</p>
            <p className="text-[10px] text-slate-400">There are currently no active patient blood requirements posted. Source: JeevanSetu Cloud DB.</p>
          </div>
        )}
      </div>
    </div>
  );
};
