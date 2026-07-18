import React, { useState, useEffect } from "react";
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Save, 
  ShieldCheck, 
  PhoneCall, 
  HeartHandshake, 
  AlertCircle,
  Sparkles,
  Info,
  RefreshCw,
  Award,
  CheckCircle,
  Building
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "./ThemeContext";
import { BloodGroup, UserRole } from "../types";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export const ProfileSettings: React.FC = () => {
  const { user, profile, updateProfile, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [allergies, setAllergies] = useState("");
  const [chronicIllnesses, setChronicIllnesses] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Citizen");
  const [isDonor, setIsDonor] = useState(false);
  const [donorVerificationStatus, setDonorVerificationStatus] = useState<"NONE" | "PENDING" | "VERIFIED" | "REJECTED">("NONE");
  const [hospitalVerificationStatus, setHospitalVerificationStatus] = useState<"NONE" | "PENDING" | "VERIFIED" | "REJECTED">("NONE");
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setBloodGroup(profile.bloodGroup || "");
      setAllergies(profile.allergies || "");
      setChronicIllnesses(profile.chronicIllnesses || "");
      setEmergencyContactName(profile.emergencyContactName || "");
      setEmergencyContactPhone(profile.emergencyContactPhone || "");
      setRole(profile.role || "Citizen");
      setIsDonor(profile.isDonor || false);
      setDonorVerificationStatus(profile.donorVerificationStatus || "NONE");
      setHospitalVerificationStatus((profile as any).hospitalVerificationStatus || "NONE");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        fullName,
        phone,
        bloodGroup,
        allergies,
        chronicIllnesses,
        emergencyContactName,
        emergencyContactPhone,
        role,
        isDonor,
        donorVerificationStatus,
        hospitalVerificationStatus: role === "Hospital" ? hospitalVerificationStatus : "NONE"
      } as any);
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDonorVerification = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        donorVerificationStatus: "PENDING"
      } as any);
      setDonorVerificationStatus("PENDING");
      // Add audit log
      const auditRef = collection(db, "audit_logs");
      await addDoc(auditRef, {
        userId: user.uid,
        userEmail: user.email || "",
        action: "REQUEST_DONOR_VERIFICATION",
        details: "User requested verification for blood donor status",
        timestamp: new Date().toISOString(),
        role: role
      });
    } catch (err) {
      console.error("Donor verification request failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestHospitalVerification = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        hospitalVerificationStatus: "PENDING"
      } as any);
      setHospitalVerificationStatus("PENDING");
      // Add audit log
      const auditRef = collection(db, "audit_logs");
      await addDoc(auditRef, {
        userId: user.uid,
        userEmail: user.email || "",
        action: "REQUEST_HOSPITAL_VERIFICATION",
        details: `User requested verification for hospital/facility role`,
        timestamp: new Date().toISOString(),
        role: role
      });
    } catch (err) {
      console.error("Hospital verification request failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-red-600" />
            <span>Profile & System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your voluntary health profiles, emergency contact details, and application interface themes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theme Settings Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-4.5 h-4.5 text-red-600" />
              <span>Theme Configuration</span>
            </h3>

            <div className="flex items-center justify-between">
              <div className="text-xs">
                <p className="font-sans font-bold text-slate-800 dark:text-slate-200">Application UI Theme Mode</p>
                <p className="text-slate-400 mt-0.5">Switch between Light or high-contrast eye-safe Dark interface</p>
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>
            </div>
          </div>

          {/* Health Profile Card */}
          {user ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-4.5 h-4.5 text-red-600" />
                <span>Voluntary Medical Emergency Profile</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your Name" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Your Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="10 digit phone number" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Blood Group</label>
                    <select 
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Blood Group</option>
                      {Object.values(BloodGroup).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">System Role</label>
                    <select 
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Citizen">Citizen</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Blood Bank">Blood Bank</option>
                      <option value="NGO">NGO</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Blood Donor Registry</label>
                    <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <input 
                        type="checkbox" 
                        id="isDonorCheckbox"
                        checked={isDonor}
                        onChange={e => setIsDonor(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <label htmlFor="isDonorCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Register as voluntary blood donor (Your contact details will be searchable by verified seekers)
                      </label>
                    </div>
                  </div>

                  {isDonor && (
                    <div className="space-y-1 md:col-span-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-red-800 dark:text-red-200 flex items-center gap-1">
                            <Award className="w-4 h-4 text-red-500" />
                            <span>Blood Donor Verification Status</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Verified status helps hospitals fast-track your requests</p>
                        </div>
                        <div>
                          {donorVerificationStatus === "NONE" && (
                            <button
                              type="button"
                              onClick={handleRequestDonorVerification}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              Request Donor Verification
                            </button>
                          )}
                          {donorVerificationStatus === "PENDING" && (
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-mono font-bold">
                              PENDING APPROVAL
                            </span>
                          )}
                          {donorVerificationStatus === "VERIFIED" && (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              VERIFIED DONOR
                            </span>
                          )}
                          {donorVerificationStatus === "REJECTED" && (
                            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-lg text-[10px] font-mono font-bold">
                              REJECTED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === "Hospital" && (
                    <div className="space-y-1 md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                            <Building className="w-4 h-4 text-blue-500" />
                            <span>Hospital Facility Verification</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Verify your facility credentials to publish real-time bed inventories</p>
                        </div>
                        <div>
                          {hospitalVerificationStatus === "NONE" && (
                            <button
                              type="button"
                              onClick={handleRequestHospitalVerification}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all"
                            >
                              Request Facility Verification
                            </button>
                          )}
                          {hospitalVerificationStatus === "PENDING" && (
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-mono font-bold">
                              PENDING APPROVAL
                            </span>
                          )}
                          {hospitalVerificationStatus === "VERIFIED" && (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              VERIFIED FACILITY
                            </span>
                          )}
                          {hospitalVerificationStatus === "REJECTED" && (
                            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-lg text-[10px] font-mono font-bold">
                              REJECTED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Emergency Contact Attendant Name</label>
                    <input 
                      type="text" 
                      required
                      value={emergencyContactName}
                      onChange={e => setEmergencyContactName(e.target.value)}
                      placeholder="Name of contact" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Emergency Contact Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={emergencyContactPhone}
                      onChange={e => setEmergencyContactPhone(e.target.value)}
                      placeholder="Emergency Mobile Phone" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Drug / Food Allergies</label>
                    <input 
                      type="text" 
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Sulfa" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Chronic Illnesses / Conditions</label>
                    <input 
                      type="text" 
                      value={chronicIllnesses}
                      onChange={e => setChronicIllnesses(e.target.value)}
                      placeholder="e.g. Diabetes, Hypertension" 
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Medical profile successfully saved to cloud.</span>
                    </span>
                  )}
                  <div className="flex-1" />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Medical Profile</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto opacity-75" />
              <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">Unauthenticated access</p>
              <p className="text-[10px] text-slate-400">Please register with your Google ID to secure your medical ID records.</p>
              <button 
                onClick={login}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>

        {/* Right: Digital Medical ID Card preview */}
        <div className="lg:col-span-4 space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Digital Emergency Medical ID Card</p>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white p-5 shadow-xl space-y-4">
            <div className="absolute top-0 right-0 p-3 flex items-center space-x-1 bg-white/10 text-amber-400 font-extrabold rounded-bl-xl uppercase text-[8px] font-mono tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>JeevanSetu</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-slate-400 uppercase">Emergency Medical ID</span>
              <h4 className="font-sans font-extrabold text-base leading-tight truncate">
                {fullName || "No Profile Set"}
              </h4>
              <p className="text-[9px] text-slate-500 font-mono">UID: {user?.uid.slice(0, 8) || "ANONYMOUS"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-400 uppercase">Blood Group</span>
                <p className="text-xs font-bold text-red-500">{bloodGroup || "Not Specified"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-400 uppercase">Attendant Call</span>
                <p className="text-xs font-bold text-slate-200">{emergencyContactPhone || "Not Specified"}</p>
              </div>
              <div className="space-y-0.5 md:col-span-2">
                <span className="text-[8px] font-mono text-slate-400 uppercase">Allergies / Notes</span>
                <p className="text-[10px] font-semibold text-slate-300 truncate">{allergies || "None declared"}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-500 font-mono">
              <span>Security: Cloud Encrypted</span>
              <span>2026 Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
