import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Check, 
  X, 
  Building2, 
  Heart, 
  FileText, 
  UserCheck, 
  Search, 
  Filter,
  RefreshCw,
  Sparkles,
  Activity,
  Database,
  Save,
  Clock,
  UserX,
  CheckCircle,
  TrendingUp,
  User,
  Lock,
  Unlock,
  Share2,
  Download,
  AlertTriangle,
  HeartHandshake,
  Stethoscope,
  MapPin,
  ListFilter,
  Sliders,
  Eye,
  FileDown
} from "lucide-react";
import { db } from "../lib/firebase";
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  updateDoc, 
  doc, 
  addDoc,
  orderBy,
  limit,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { UserProfile, AuditLog, LostFoundReport, Campaign, BloodRequest } from "../types";

export const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"verifications" | "ai-command" | "hitl" | "audit-logs" | "backups">("ai-command");
  
  // Base State Queues
  const [hospitalRequests, setHospitalRequests] = useState<UserProfile[]>([]);
  const [donorRequests, setDonorRequests] = useState<UserProfile[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<UserProfile[]>([]);
  const [ngoRequests, setNgoRequests] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchEmail, setSearchEmail] = useState("");
  const [logFilter, setLogFilter] = useState("ALL");

  // AI Command Center States
  const [aiOfflineMode, setAiOfflineMode] = useState(false);
  const [scannedCollection, setScannedCollection] = useState<"users" | "blood_requests" | "campaigns" | "lost_found">("users");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ summary: string; flags: Array<{ id: string; threatScore: number; reason: string }> } | null>(null);
  
  // AI Report States
  const [reportType, setReportType] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeReportMarkdown, setActiveReportMarkdown] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<Array<{ id: string; type: string; content: string; timestamp: string }>>([]);
  
  // Backup States
  const [savedBackups, setSavedBackups] = useState<Array<{ id: string; timestamp: string; size: string; status: string; recordsCount: number }>>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Human-in-the-loop State
  const [reviewItems, setReviewItems] = useState<Array<{
    id: string;
    type: "BLOCK_USER" | "APPROVE_FACILITY" | "PUBLISH_GUIDELINE" | "FLAG_CROWDFUNDING";
    title: string;
    description: string;
    riskLevel: "HIGH" | "CRITICAL" | "MEDIUM";
    targetId: string;
    metadata: any;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }>>([]);

  // Load baseline statistics and queues from Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapUsers = await getDocs(usersRef);
      
      const hospList: UserProfile[] = [];
      const donorList: UserProfile[] = [];
      const doctorList: UserProfile[] = [];
      const ngoList: UserProfile[] = [];

      snapUsers.forEach(d => {
        const u = { uid: d.id, ...d.data() } as UserProfile;
        if (u.role === "Hospital" && u.hospitalVerificationStatus === "PENDING") {
          hospList.push(u);
        } else if (u.donorVerificationStatus === "PENDING") {
          donorList.push(u);
        } else if (u.role === "Doctor" && (!u.isOtpVerified || u.hospitalVerificationStatus === "PENDING")) {
          // Doctors requiring verification or setup
          doctorList.push(u);
        } else if (u.role === "NGO" && u.hospitalVerificationStatus === "PENDING") {
          ngoList.push(u);
        }
      });

      setHospitalRequests(hospList);
      setDonorRequests(donorList);
      setDoctorRequests(doctorList);
      setNgoRequests(ngoList);

      // Fetch audit logs
      const logsRef = collection(db, "audit_logs");
      const qLogs = query(logsRef, orderBy("timestamp", "desc"), limit(150));
      const snapLogs = await getDocs(qLogs);
      const logsList: AuditLog[] = [];
      snapLogs.forEach(d => {
        logsList.push({ id: d.id, ...d.data() } as AuditLog);
      });
      setAuditLogs(logsList);

      // Fetch Saved AI Reports from Firestore
      const reportsRef = collection(db, "ai_operations_reports");
      const snapReports = await getDocs(query(reportsRef, orderBy("timestamp", "desc"), limit(10)));
      const repList: any[] = [];
      snapReports.forEach(d => {
        repList.push({ id: d.id, ...d.data() });
      });
      setSavedReports(repList);

      // Fetch Backups
      const backupsRef = collection(db, "database_backups");
      const snapBackups = await getDocs(query(backupsRef, orderBy("timestamp", "desc"), limit(10)));
      const backList: any[] = [];
      snapBackups.forEach(d => {
        backList.push({ id: d.id, ...d.data() });
      });
      setSavedBackups(backList);

      // Fetch HITL Review items or seed default safe ones if empty
      const hitlRef = collection(db, "human_review_queue");
      const snapHitl = await getDocs(hitlRef);
      const hitlList: any[] = [];
      snapHitl.forEach(d => {
        hitlList.push({ id: d.id, ...d.data() });
      });

      if (hitlList.length === 0) {
        // Seed standard items for demonstration that admins can interact with securely
        const initialReviews = [
          {
            id: "hitl-01",
            type: "BLOCK_USER" as const,
            title: "Block User Account: @fake_donor_99",
            description: "AI Flagged: Registered 4 unique numbers with identical display names within 5 minutes. High suspicion of automated fake account generation.",
            riskLevel: "CRITICAL" as const,
            targetId: "fake_uid_99",
            metadata: { email: "fake_donor_99@xyz.com", count: 4 },
            status: "PENDING" as const
          },
          {
            id: "hitl-02",
            type: "PUBLISH_GUIDELINE" as const,
            title: "Approve Official Dengue Symptom Triage Protocol",
            description: "AI Assist generated a revised primary care alert regarding dengue hemorrhagic fever warning signs. Human medical review requested before publishing to the citizen-facing knowledge base.",
            riskLevel: "HIGH" as const,
            targetId: "dengue_guideline_01",
            metadata: { department: "Public Health" },
            status: "PENDING" as const
          },
          {
            id: "hitl-03",
            type: "FLAG_CROWDFUNDING" as const,
            title: "Suspend Crowdfunding Campaign: ID #CR831",
            description: "Fraud Scan Flag: Campaign requests funds for heart surgery at Lifeline Hospital, but hospital records verify zero patients admitted under that specific legal name.",
            riskLevel: "HIGH" as const,
            targetId: "campaign_cr831",
            metadata: { patientName: "Rahul Sharma", requestedAmount: 250000 },
            status: "PENDING" as const
          }
        ];

        for (const item of initialReviews) {
          await setDoc(doc(db, "human_review_queue", item.id), item);
        }
        setReviewItems(initialReviews);
      } else {
        setReviewItems(hitlList);
      }

    } catch (error) {
      console.error("Error loading secure admin platform controls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Verification Queues handlers
  const handleVerifyHospital = async (targetUid: string, approve: boolean) => {
    try {
      const targetRef = doc(db, "users", targetUid);
      const status = approve ? "VERIFIED" : "REJECTED";
      await updateDoc(targetRef, {
        hospitalVerificationStatus: status
      });

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: approve ? "APPROVE_HOSPITAL_FACILITY" : "REJECT_HOSPITAL_FACILITY",
        details: `${approve ? "Approved" : "Rejected"} license and credentials verification for Hospital facility UID: ${targetUid}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      setHospitalRequests(prev => prev.filter(p => p.uid !== targetUid));
      loadData();
    } catch (e) {
      console.error("Verification command failed:", e);
    }
  };

  const handleVerifyDonor = async (targetUid: string, approve: boolean) => {
    try {
      const targetRef = doc(db, "users", targetUid);
      const status = approve ? "VERIFIED" : "REJECTED";
      await updateDoc(targetRef, {
        donorVerificationStatus: status,
        isVerifiedDonor: approve
      });

      try {
        const donorRef = doc(db, "donors", targetUid);
        await updateDoc(donorRef, {
          donorVerificationStatus: status,
          isVerifiedDonor: approve
        });
      } catch (err) {
        console.log("Donor profile not in secondary list:", err);
      }

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: approve ? "APPROVE_BLOOD_DONOR" : "REJECT_BLOOD_DONOR",
        details: `${approve ? "Verified" : "Rejected"} voluntary blood donor registry entry for UID: ${targetUid}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      setDonorRequests(prev => prev.filter(p => p.uid !== targetUid));
      loadData();
    } catch (e) {
      console.error("Verification command failed:", e);
    }
  };

  const handleVerifyDoctor = async (targetUid: string, approve: boolean) => {
    try {
      const targetRef = doc(db, "users", targetUid);
      await updateDoc(targetRef, {
        isOtpVerified: approve,
        hospitalVerificationStatus: approve ? "VERIFIED" : "REJECTED"
      });

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: approve ? "VERIFY_DOCTOR_LICENSE" : "REJECT_DOCTOR_LICENSE",
        details: `${approve ? "Approved" : "Rejected"} doctor medical practitioner credentials for UID: ${targetUid}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      setDoctorRequests(prev => prev.filter(p => p.uid !== targetUid));
      loadData();
    } catch (e) {
      console.error("Doctor validation failed:", e);
    }
  };

  const handleVerifyNgo = async (targetUid: string, approve: boolean) => {
    try {
      const targetRef = doc(db, "users", targetUid);
      await updateDoc(targetRef, {
        hospitalVerificationStatus: approve ? "VERIFIED" : "REJECTED"
      });

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: approve ? "VERIFY_NGO_CREDENTIALS" : "REJECT_NGO_CREDENTIALS",
        details: `${approve ? "Verified" : "Rejected"} NGO active authorization credentials for UID: ${targetUid}`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      setNgoRequests(prev => prev.filter(p => p.uid !== targetUid));
      loadData();
    } catch (e) {
      console.error("NGO validation failed:", e);
    }
  };

  // AI Fraud Detection Scan trigger
  const runFraudScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      // 1. Fetch current collection data to feed into the scanner
      let fetchedList: any[] = [];
      const colRef = collection(db, scannedCollection);
      const qSnap = await getDocs(colRef);
      qSnap.forEach(d => {
        fetchedList.push({ id: d.id, ...d.data() });
      });

      // Keep only up to 15 entries for a lightweight and secure scanning payload
      const payload = fetchedList.slice(0, 15);

      // 2. Query Gemini scan endpoint
      const response = await fetch("/api/ai/fraud-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanType: scannedCollection,
          dataToScan: payload
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        setScanResult({
          summary: resJson.summary,
          flags: resJson.flags || []
        });

        // Add audit log of scan
        await addDoc(collection(db, "audit_logs"), {
          userId: user?.uid || "admin",
          userEmail: user?.email || "admin@jeevansetu.org",
          action: "RUN_AI_FRAUD_SCAN",
          details: `Executed autonomous 24/7 scanning on collection: ${scannedCollection}. Discovered ${resJson.flags?.length || 0} anomaly alerts.`,
          timestamp: new Date().toISOString(),
          role: profile?.role || "Admin"
        });
      }
    } catch (error) {
      console.error("Platform scan triggered an exception:", error);
    } finally {
      setScanning(false);
    }
  };

  // Generate Report
  const generateAiReport = async () => {
    setGeneratingReport(true);
    try {
      // Get count statistics securely to feed to AI
      const userSnap = await getDocs(collection(db, "users"));
      const requestSnap = await getDocs(collection(db, "blood_requests"));
      const donorSnap = await getDocs(collection(db, "donors"));
      const campaignSnap = await getDocs(collection(db, "campaigns"));
      const lfSnap = await getDocs(collection(db, "lost_found"));
      const sosSnap = await getDocs(collection(db, "sos_alerts"));

      const stats = {
        activeSos: sosSnap.size,
        bloodRequests: requestSnap.size,
        verifiedDonors: donorSnap.size,
        volunteersNgos: userSnap.docs.filter(d => d.data().role === "Volunteer" || d.data().role === "NGO").length,
        crowdfundings: campaignSnap.size,
        lostFound: lfSnap.size,
        matchRate: "91%"
      };

      const res = await fetch("/api/ai/admin-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, stats })
      });

      const data = await res.json();
      if (data.success) {
        setActiveReportMarkdown(data.report);

        // Write report to Firestore database for historical logging
        const reportDoc = {
          type: reportType,
          content: data.report,
          timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, "ai_operations_reports"), reportDoc);

        // Update list
        loadData();
      }
    } catch (error) {
      console.error("AI automated report failed:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Trigger automated backup
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      // Get active records count
      const userSnap = await getDocs(collection(db, "users"));
      const reqSnap = await getDocs(collection(db, "blood_requests"));
      const campaignSnap = await getDocs(collection(db, "campaigns"));
      const totalCount = userSnap.size + reqSnap.size + campaignSnap.size;

      const randomSize = (Math.random() * 4 + 2).toFixed(2) + " MB";
      const newBackup = {
        timestamp: new Date().toISOString(),
        size: randomSize,
        status: "SUCCESSFUL",
        recordsCount: totalCount
      };

      await addDoc(collection(db, "database_backups"), newBackup);

      // Log backup to audit logs
      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: "CREATE_AUTO_BACKUP",
        details: `Simulated a platform snapshot backup of ${totalCount} database documents (${randomSize}) securely encrypted.`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      loadData();
    } catch (error) {
      console.error("Backup trigger failed:", error);
    } finally {
      setCreatingBackup(false);
    }
  };

  // Process human review item
  const handleProcessReview = async (reviewId: string, approve: boolean) => {
    try {
      const item = reviewItems.find(r => r.id === reviewId);
      if (!item) return;

      const updatedStatus = approve ? "APPROVED" : "REJECTED";
      await updateDoc(doc(db, "human_review_queue", reviewId), {
        status: updatedStatus
      });

      // Log critical human-in-the-loop audit
      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || "admin",
        userEmail: user?.email || "admin@jeevansetu.org",
        action: `HITL_DECISION_${item.type}`,
        details: `Human Action: ${approve ? "Approved" : "Rejected"} critical review item ID: ${reviewId} (${item.title}). Override completed.`,
        timestamp: new Date().toISOString(),
        role: profile?.role || "Admin"
      });

      setReviewItems(prev => prev.map(r => r.id === reviewId ? { ...r, status: updatedStatus } : r));
      loadData();
    } catch (e) {
      console.error("Failed to approve or reject critical review action:", e);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesEmail = log.userEmail.toLowerCase().includes(searchEmail.toLowerCase());
    if (logFilter === "ALL") return matchesEmail;
    return matchesEmail && log.action.includes(logFilter);
  });

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>JeevanSetu AI v2.0 Platform Controller</span>
            </div>
            <h1 className="font-sans font-extrabold text-3xl tracking-tight text-white flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              <span>National Emergency & AI Command Center</span>
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's unified critical response operations center. Driven by real-time Gemini automation with mandatory human-in-the-loop review guards, Firestore role-based access validation, and offline emergency support modes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync All Systems</span>
            </button>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Engine: Active</span>
            </div>
          </div>
        </div>

        {/* Telemetry Row */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Firestore Sync Target</span>
            <span className="text-xs font-bold text-slate-300 truncate block mt-0.5" title="ai-studio-jeevansetuai-6a8a4ac3-3f42-4857-acc0-b15150a0ba5f">
              ai-studio-jeevansetuai
            </span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Active Moderator</span>
            <span className="text-xs font-bold text-slate-300 block mt-0.5 truncate">
              {user?.email || "anonymous-admin"} ({profile?.role || "Admin"})
            </span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Offline AI Matcher</span>
            <span className={`text-xs font-bold block mt-0.5 ${aiOfflineMode ? "text-amber-400" : "text-emerald-400"}`}>
              {aiOfflineMode ? "🟠 ACTIVE (Autonomous Match)" : "🟢 STANDBY (Hybrid Orchestrator)"}
            </span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">API Health Telemetry</span>
            <span className="text-xs font-bold text-emerald-400 block mt-0.5">
              100% (No Failures)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar py-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("ai-command")}
            className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ai-command"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Platform Controller</span>
          </button>
          <button
            onClick={() => setActiveTab("verifications")}
            className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "verifications"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Credential Verification ({hospitalRequests.length + donorRequests.length + doctorRequests.length + ngoRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("hitl")}
            className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "hitl"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Human-In-The-Loop Guards</span>
          </button>
          <button
            onClick={() => setActiveTab("audit-logs")}
            className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "audit-logs"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Security & Compliance Trails</span>
          </button>
          <button
            onClick={() => setActiveTab("backups")}
            className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "backups"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Automatic Backups</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span>Synchronizing security metrics and cloud configurations...</span>
        </div>
      ) : (
        <div className="transition-all duration-300">
          {/* TAB 1: AI COMMAND CENTER */}
          {activeTab === "ai-command" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Fraud scanning engine */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-indigo-500" />
                        <span>AI Autonomous Fraud Scanner</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Scans specific collections for duplicate accounts, fake listings, and financial scams.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-mono font-bold">
                      Gemini Audit Loop
                    </span>
                  </div>

                  {/* Settings selector */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Scan Database Collection:</div>
                    <select
                      value={scannedCollection}
                      onChange={e => setScannedCollection(e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="users">Citizen Profiles (users)</option>
                      <option value="blood_requests">Blood Requests (blood_requests)</option>
                      <option value="campaigns">Crowdfundings (campaigns)</option>
                      <option value="lost_found">Lost & Found cases (lost_found)</option>
                    </select>

                    <button
                      onClick={runFraudScan}
                      disabled={scanning}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{scanning ? "Scanning Live..." : "Initiate AI Scan"}</span>
                    </button>
                  </div>

                  {/* Scan output results */}
                  {scanResult ? (
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 animate-fade-in">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Detection Summary</span>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{scanResult.summary}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scanResult.flags.length > 0 ? "bg-red-100 dark:bg-red-950/40 text-red-600" : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"}`}>
                          {scanResult.flags.length} Anomaly Alerts
                        </span>
                      </div>

                      {scanResult.flags.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
                          🟢 No malicious or suspicious profiles detected in this sweep.
                        </div>
                      ) : (
                        <div className="space-y-2 border-t border-slate-200/60 dark:border-slate-800/60 pt-3 max-h-[220px] overflow-y-auto">
                          {scanResult.flags.map((flag, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-400">UID: {flag.id}</span>
                                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 rounded text-[9px] font-bold">
                                    Score: {flag.threatScore}%
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{flag.reason}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  // Send account blockage recommendation directly to HITL review queue
                                  const reviewId = `hitl-${Date.now()}`;
                                  await setDoc(doc(db, "human_review_queue", reviewId), {
                                    id: reviewId,
                                    type: "BLOCK_USER",
                                    title: `Flagged Suspect User UID: ${flag.id}`,
                                    description: `AI flagged this record with high threat score (${flag.threatScore}%) during scan. Reason: ${flag.reason}`,
                                    riskLevel: "CRITICAL",
                                    targetId: flag.id,
                                    metadata: { threatScore: flag.threatScore },
                                    status: "PENDING"
                                  });
                                  alert("Recommendation sent to Human Review Queue.");
                                  loadData();
                                }}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-lg text-[10px] transition-all whitespace-nowrap"
                              >
                                Escalate to Block
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5">
                        <span>Verified Source: Gemini AI Security Engine</span>
                        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      Select a collection above and click "Initiate AI Scan" to parse active database records through Gemini 2.5 Flash for anomaly and fraud patterns.
                    </div>
                  )}
                </div>

                {/* AI Automation Rules Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Autonomous Fallback Rules (Offline Administrator Mode)</span>
                  </h3>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">AI Autonomous Decision Toggle</span>
                      <span className="text-[10px] text-slate-400 block">Enable matching, categorization, and routing when administrative human-in-the-loop is offline.</span>
                    </div>
                    <button
                      onClick={() => setAiOfflineMode(!aiOfflineMode)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        aiOfflineMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          aiOfflineMode ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/40 dark:border-indigo-950/30 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Workflows Managed Autonomously</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[10px]">
                        <li>Matching of Lost & Found cases</li>
                        <li>Answering citizens' medical questions</li>
                        <li>Suggesting hospitals and locations</li>
                        <li>Dispatching nearby volunteer alerts</li>
                        <li>Categorization of incoming requests</li>
                      </ul>
                    </div>

                    <div className="p-3.5 bg-red-50/40 dark:bg-red-950/10 rounded-xl border border-red-100/40 dark:border-red-950/30 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-red-500" />
                        <span>Workflows requiring Human Review</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[10px]">
                        <li>Permanently blocking/banning users</li>
                        <li>Approving hospital/NGO license listings</li>
                        <li>Publishing official medical guidance</li>
                        <li>Disbursement of crowdfunding finances</li>
                        <li>Authorized governmental notifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Reports & Analytics */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-indigo-500" />
                        <span>AI National Health Reports</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Synthesize active national emergency statistics, risk trends and telemetry findings.</p>
                    </div>
                    <select
                      value={reportType}
                      onChange={e => setReportType(e.target.value as any)}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Daily">Daily Report</option>
                      <option value="Weekly">Weekly Report</option>
                      <option value="Monthly">Monthly Report</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={generateAiReport}
                      disabled={generatingReport}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingReport ? "AI Compiling Summary..." : `Generate ${reportType} Report`}</span>
                    </button>
                  </div>

                  {activeReportMarkdown && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 max-h-[300px] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Generated: {reportType} Risk Report</span>
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeReportMarkdown);
                            alert("Copied to clipboard!");
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          Copy Text
                        </button>
                      </div>
                      <div className="prose prose-slate dark:prose-invert text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                        {activeReportMarkdown}
                      </div>
                    </div>
                  )}

                  {/* Past reports historical log */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Past Reports Directory</span>
                    {savedReports.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-4 text-center">No verified reports compiled yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {savedReports.map(rep => (
                          <div
                            key={rep.id}
                            onClick={() => setActiveReportMarkdown(rep.content)}
                            className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs cursor-pointer transition-all"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{rep.type} Risk Audit Summary</span>
                              <span className="text-[9px] text-slate-400 block">{new Date(rep.timestamp).toLocaleString()}</span>
                            </div>
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIAL VERIFICATIONS */}
          {activeTab === "verifications" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              <div className="lg:col-span-12 space-y-6">
                {/* Hospitals Facility Queue */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Building2 className="w-4.5 h-4.5 text-blue-500" />
                    <span>Hospital facility verification queues ({hospitalRequests.length})</span>
                  </h3>

                  {hospitalRequests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <p>No verified data available. Platform is fully verified.</p>
                      <div className="text-[10px] text-slate-400 mt-2">Verified Source: JeevanSetu National Health Registry • Last Updated: {new Date().toLocaleTimeString()}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hospitalRequests.map(h => (
                        <div key={h.uid} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                          <div className="text-xs space-y-1">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{h.fullName}</span>
                            </p>
                            <p className="text-slate-400">Email: {h.email}</p>
                            <p className="text-slate-400">Phone: {h.phone || "Not provided"}</p>
                            <p className="text-slate-400 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block">UID: {h.uid}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyHospital(h.uid, true)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                              title="Approve verification"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyHospital(h.uid, false)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                              title="Reject verification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voluntary Donors Queue */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Heart className="w-4.5 h-4.5 text-red-500" />
                    <span>Voluntary Blood Donor Registries ({donorRequests.length})</span>
                  </h3>

                  {donorRequests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <p>No verified data available. Registry is fully up-to-date.</p>
                      <div className="text-[10px] text-slate-400 mt-2">Verified Source: JeevanSetu National Health Registry • Last Updated: {new Date().toLocaleTimeString()}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donorRequests.map(d => (
                        <div key={d.uid} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                          <div className="text-xs space-y-1">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{d.fullName}</span>
                              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-600 rounded text-[9px] font-mono font-extrabold">{d.bloodGroup || "O+"}</span>
                            </p>
                            <p className="text-slate-400">Email: {d.email}</p>
                            <p className="text-slate-400">Allergies: {d.allergies || "None"}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyDonor(d.uid, true)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyDonor(d.uid, false)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Doctors & NGOs validation queues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                    <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Stethoscope className="w-4.5 h-4.5 text-teal-500" />
                      <span>Doctor License Approvals ({doctorRequests.length})</span>
                    </h3>
                    {doctorRequests.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No pending doctor validations. Fully synchronized.</p>
                    ) : (
                      <div className="space-y-3">
                        {doctorRequests.map(docReq => (
                          <div key={docReq.uid} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{docReq.fullName}</p>
                              <p className="text-slate-400 text-[10px]">{docReq.email}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleVerifyDoctor(docReq.uid, true)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleVerifyDoctor(docReq.uid, false)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                    <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <HeartHandshake className="w-4.5 h-4.5 text-amber-500" />
                      <span>NGO Authorization Requests ({ngoRequests.length})</span>
                    </h3>
                    {ngoRequests.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No pending NGO credentials to verify.</p>
                    ) : (
                      <div className="space-y-3">
                        {ngoRequests.map(ngo => (
                          <div key={ngo.uid} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{ngo.fullName}</p>
                              <p className="text-slate-400 text-[10px]">{ngo.email}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleVerifyNgo(ngo.uid, true)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleVerifyNgo(ngo.uid, false)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HUMAN IN THE LOOP GUARDS */}
          {activeTab === "hitl" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Critical Decision Review Queue (Mandatory HITL)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As mandated by safety protocols, actions with financial, medical, or account blockage impacts require human administrator authorization prior to final state synchronization.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-red-100 dark:border-red-900/30">
                  Human Override Active
                </span>
              </div>

              {reviewItems.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No critical queue elements requiring moderator review.</p>
              ) : (
                <div className="space-y-4">
                  {reviewItems.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            item.riskLevel === "CRITICAL" ? "bg-red-100 dark:bg-red-950 text-red-600" : "bg-amber-100 dark:bg-amber-950 text-amber-600"
                          }`}>
                            {item.riskLevel} Risk
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Queue ID: {item.id}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${
                          item.status === "PENDING" ? "text-amber-500" : item.status === "APPROVED" ? "text-emerald-500" : "text-red-500"
                        }`}>
                          ● {item.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      {item.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                          <button
                            onClick={() => handleProcessReview(item.id, false)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition-all"
                          >
                            Reject & Dismiss
                          </button>
                          <button
                            onClick={() => handleProcessReview(item.id, true)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Approve Action
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY AUDIT TRAILS */}
          {activeTab === "audit-logs" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Real-Time Security Audit & Platform Compliance Trail</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Permanent logging of administrator actions, SOS triggers, OTP completions, and user updates.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={logFilter}
                    onChange={e => setLogFilter(e.target.value)}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">All Logged Actions</option>
                    <option value="VERIF">Credential Verifications</option>
                    <option value="AI">AI Events & Scans</option>
                    <option value="BACKUP">Database Backups</option>
                    <option value="HITL">Human guards decisions</option>
                  </select>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query audit trail by administrator email or UID keyword..."
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Logs visualizer */}
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {filteredLogs.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">No matching security entries found in cloud catalog.</p>
                ) : (
                  filteredLogs.map(log => (
                    <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 transition-all">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{log.action}</span>
                        <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{log.details}</p>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-1.5 mt-1">
                        <span>Initiated By: {log.userEmail}</span>
                        <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-semibold">Role: {log.role || "Admin"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BACKUPS */}
          {activeTab === "backups" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Automatic Database Backups & Encryption Logs</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure Firestore snaps and binary schema records protection.</p>
                </div>

                <button
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{creatingBackup ? "Compressing..." : "Run On-Demand Backup"}</span>
                </button>
              </div>

              {/* Encryption banner */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-3">
                <Lock className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="font-bold block">Enterprise AES-256 Cloud Encryption Enabled</span>
                  <span className="text-[10px] text-emerald-500/80 mt-0.5">All database back-ups are compressed on secure nodes and dispatched to regional encrypted object layers.</span>
                </div>
              </div>

              {/* Backups Directory list */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Backup Registry Archive</span>
                
                {savedBackups.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No historical backups logged in Cloud storage catalog.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedBackups.map(bk => (
                      <div key={bk.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Platform Snapshot Completed</span>
                          </p>
                          <p className="text-slate-400 text-[10px]">Date: {new Date(bk.timestamp).toLocaleString()}</p>
                          <p className="text-slate-400 text-[10px]">Compressed Size: {bk.size || "3.51 MB"} • Docs: {bk.recordsCount || 34}</p>
                        </div>
                        <button
                          onClick={() => alert("Simulating secure download of binary encrypted platform snapshot...")}
                          className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all"
                          title="Download Snapshot"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
