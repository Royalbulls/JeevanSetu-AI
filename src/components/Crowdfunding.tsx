import React, { useState, useEffect } from "react";
import { 
  Coins, 
  PlusCircle, 
  HeartHandshake, 
  HelpCircle, 
  DollarSign, 
  CheckCircle, 
  UserCheck, 
  RefreshCw,
  AlertCircle,
  Plus
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getCampaigns, createCampaign, donateToCampaign } from "../lib/firestoreService";
import { Campaign } from "../types";

export const Crowdfunding: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [targetAmount, setTargetAmount] = useState(10000);
  const [illness, setIllness] = useState("");
  const [description, setDescription] = useState("");
  const [upiId, setUpiId] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({
        patientName,
        hospitalName,
        targetAmount,
        illness,
        description,
        upiId,
        contactPhone,
        source: "JeevanSetu Cloud DB"
      });

      setSuccessMsg("Medical crowdfunding campaign successfully launched!");
      setShowForm(false);
      
      // Clear form
      setPatientName("");
      setHospitalName("");
      setTargetAmount(10000);
      setIllness("");
      setDescription("");
      setUpiId("");
      setContactPhone("");

      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDonate = async (id: string, amount: number) => {
    try {
      await donateToCampaign(id, amount);
      loadCampaigns();
      alert(`Thank you for your generous support of ₹${amount}!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-red-600" />
            <span>Medical Crowdfunding Support</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Direct UPI-backed financial micro-donations to support critical ICU medical care expenses for families in poverty</p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Fundraiser Campaign</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Start Critical Medical Campaign</h3>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded font-mono">Micro-Finance</span>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Hospital Name</label>
              <input 
                type="text" 
                required
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                placeholder="Where patient is admitted" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Target Amount required (INR)</label>
              <input 
                type="number" 
                required
                min="5000"
                value={targetAmount}
                onChange={e => setTargetAmount(parseInt(e.target.value) || 5000)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Critical Diagnosis / Illness</label>
              <input 
                type="text" 
                required
                value={illness}
                onChange={e => setIllness(e.target.value)}
                placeholder="e.g. Brain hemorrhage, ICU recovery" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Recipient UPI ID (For Direct Payments)</label>
              <input 
                type="text" 
                required
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="patient@upi, or paytm" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Attendant Contact Mobile</label>
              <input 
                type="tel" 
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="10 digit phone number" 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Full Case Description & Treatment Cost Breakdowns</label>
              <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide comprehensive details supporting the need..." 
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-20"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Launch Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Campaigns list display */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <HeartHandshake className="w-4.5 h-4.5 text-red-500 animate-bounce" />
            <span>Active Financial Appeals ({campaigns.length})</span>
          </h3>
          <button 
            onClick={loadCampaigns}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => {
              const progressPercent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));
              return (
                <div 
                  key={camp.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                        {camp.illness}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">UPI: {camp.upiId}</span>
                    </div>

                    <h4 className="font-sans font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      Patient: {camp.patientName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">Admitted: {camp.hospitalName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed truncate-3-lines">
                      {camp.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-semibold">Raised: <strong className="text-slate-800 dark:text-slate-200">₹{camp.raisedAmount}</strong></span>
                      <span className="text-slate-400 font-semibold">Goal: <strong className="text-slate-800 dark:text-slate-200">₹{camp.targetAmount}</strong></span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-red-600 dark:text-red-400">{progressPercent}% Funded</span>
                  </div>

                  {/* Micro donate buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/85 flex items-center justify-between gap-2">
                    <span className="text-[8px] font-mono text-slate-400">Direct Financial Routing</span>
                    
                    <div className="flex space-x-1.5">
                      <button 
                        onClick={() => handleDonate(camp.id, 100)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-lg text-[10px] font-bold"
                      >
                        Donate ₹100
                      </button>
                      <button 
                        onClick={() => {
                          const amt = prompt("Enter custom donation amount (INR):");
                          const amtInt = parseInt(amt || "0");
                          if (amtInt > 0) {
                            handleDonate(camp.id, amtInt);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 rounded-lg text-[10px] font-bold"
                      >
                        Custom Donate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No data available</p>
            <p className="text-[10px] text-slate-400">There are currently no medical crowdfunding campaigns active. Source: JeevanSetu Cloud DB.</p>
          </div>
        )}
      </div>
    </div>
  );
};
