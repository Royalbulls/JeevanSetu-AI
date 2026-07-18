import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertTriangle, 
  HeartHandshake, 
  ExternalLink, 
  HelpCircle,
  FileText,
  Clock,
  RefreshCw,
  CheckCircle,
  Navigation,
  BookOpen,
  Database,
  ArrowRight,
  Search,
  Activity,
  ShieldCheck,
  Stethoscope,
  Heart,
  ChevronRight,
  ThumbsUp,
  Globe,
  UserPlus,
  MapPin,
  Phone
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getKnowledgeBase, ensureKnowledgeBaseSeeded, unifiedSearch, UnifiedSearchResult } from "../lib/firestoreService";
import { KnowledgeBaseEntry } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: string;
  intentData?: any;
  sources?: Array<{ title: string; url: string }>;
  timestamp: string;
}

interface AiAssistantProps {
  setCurrentTab: (tab: string) => void;
  onSosTrigger: () => void;
  isSosTriggered: boolean;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ 
  setCurrentTab, 
  onSosTrigger,
  isSosTriggered 
}) => {
  const { user } = useAuth();
  
  // Navigation Tabs: 'triage' | 'chat' | 'handbook' | 'unified-search'
  const [activeSubTab, setActiveSubTab] = useState<"triage" | "chat" | "handbook" | "unified-search">("triage");

  // UNIFIED SEARCH STATES
  const [unifiedSearchQuery, setUnifiedSearchQuery] = useState("");
  const [unifiedSearchResults, setUnifiedSearchResults] = useState<UnifiedSearchResult | null>(null);
  const [unifiedSearchLoading, setUnifiedSearchLoading] = useState(false);
  const [unifiedSearchCategory, setUnifiedSearchCategory] = useState<"all" | "bloodBanks" | "hospitals" | "ngos" | "knowledgeBase">("all");

  // SEED & KNOWLEDGE BASE STATES
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseEntry[]>([]);
  const [kbCategory, setKbCategory] = useState<string>("all");
  const [kbSearch, setKbSearch] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseEntry | null>(null);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string>("Initializing secure DB...");

  // CHAT ASSISTANT STATES
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! Main JeevanSetu AI Chat Assistant hoon. Main emergency medical assistance, blood donors list, aur sarkari yojanaon ki verified jankari de sakta hoon.\n\nAap mujhse normal bhasha me pooch sakte hain, jaise:\n- 'Mujhe O Positive blood chahiye'\n- 'PM-JAY scheme ki details kya hain?'\n- 'Heat stroke me first aid kya hota hai?'",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // TRIAGE STATES
  const [symptoms, setSymptoms] = useState("");
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<{
    urgency: "EMERGENCY" | "CONSULT" | "HOME";
    urgencyLabel: string;
    urgencyColor: string;
    analysis: string;
    recommendations: string[];
    departments: string[];
    firstAidSteps: string[];
    disclaimer: string;
  } | null>(null);

  // Quick preset symptom descriptions
  const symptomPresets = [
    {
      label: "Heart Emergency (Chest Pain)",
      text: "Severe chest pain expanding to left arm, heavy breathing, sweating, and nausea. Happened suddenly 10 mins ago."
    },
    {
      label: "Fever & Platelets (Dengue Suspect)",
      text: "High fever (103°F) for 3 days with severe headache, joint pain, nausea, and laboratory showing platelets are dropping."
    },
    {
      label: "Mild Cold & Sneezing",
      text: "Slight cold, mild sneezing, throat irritation, no fever or breathlessness. Doing fine overall."
    }
  ];

  // Auto Scroll Chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeSubTab === "chat") {
      scrollToBottom();
    }
  }, [messages, chatLoading, activeSubTab]);

  // Sync Firestore DB on Mount
  useEffect(() => {
    const initializeDatabase = async () => {
      setDbLoading(true);
      try {
        setSyncStatus("Verifying medical knowledge base integrity...");
        // Auto seed if empty
        await ensureKnowledgeBaseSeeded();
        setSyncStatus("Cloud databases synchronized.");
        
        // Load articles
        const data = await getKnowledgeBase();
        setKbArticles(data);
        if (data.length > 0) {
          setSelectedArticle(data[0]);
        }
      } catch (err) {
        console.error("Database sync failed:", err);
        setSyncStatus("Offline-ready local backup activated.");
      } finally {
        setDbLoading(false);
      }
    };
    initializeDatabase();
  }, []);

  // Fetch updated list when category or search changes
  useEffect(() => {
    const fetchArticles = async () => {
      const categoryFilter = kbCategory === "all" ? undefined : kbCategory;
      const data = await getKnowledgeBase(categoryFilter, kbSearch);
      setKbArticles(data);
    };
    fetchArticles();
  }, [kbCategory, kbSearch]);

  // Handle Chat Submit
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || chatLoading) return;

    const userMsgText = inputText;
    setInputText("");
    
    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      text: userMsgText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText, chatHistory })
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        text: data.reply || "I am processing your emergency request.",
        intent: data.intent,
        intentData: data.intentData,
        sources: data.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        text: "Apologies, but there was an error processing your query. Please check your connectivity and try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const executeUnifiedSearch = async (queryStr: string) => {
    setUnifiedSearchLoading(true);
    try {
      const results = await unifiedSearch(queryStr);
      setUnifiedSearchResults(results);
    } catch (err) {
      console.error("Unified search execution failed:", err);
    } finally {
      setUnifiedSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "unified-search" && !unifiedSearchResults && !unifiedSearchLoading) {
      executeUnifiedSearch("");
    }
  }, [activeSubTab]);

  // Handle Triage Submit
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || triageLoading) return;

    setTriageLoading(true);
    setTriageError(null);
    setTriageResult(null);

    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms })
      });
      const data = await res.json();

      if (data.success && data.data) {
        setTriageResult(data.data);
      } else {
        throw new Error(data.error || "Failed to process triage analysis.");
      }
    } catch (err: any) {
      console.error(err);
      setTriageError(err.message || "Connection to emergency triage service lost. Seek nearby clinical evaluation.");
    } finally {
      setTriageLoading(false);
    }
  };

  // Handle Ask AI from Handbook
  const handleAskAIAboutArticle = (article: KnowledgeBaseEntry) => {
    const prompt = `Tell me more about the verified guidelines for: "${article.title}" and explain how to apply them.`;
    setInputText(prompt);
    setActiveSubTab("chat");
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Sync Status bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-xs text-slate-900 dark:text-white leading-none">
              JeevanSetu Cloud Sync
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${dbLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{syncStatus}</span>
            </p>
          </div>
        </div>
        
        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-stretch sm:self-auto gap-1">
          <button
            onClick={() => setActiveSubTab("triage")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === "triage" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-red-500" />
            <span>AI Symptom Triage</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("chat")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === "chat" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-500" />
            <span>AI Chat Assistant</span>
          </button>

          <button
            onClick={() => setActiveSubTab("handbook")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === "handbook" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Medical Handbook</span>
          </button>

          <button
            onClick={() => setActiveSubTab("unified-search")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === "unified-search" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4 text-emerald-500" />
            <span>Unified Search</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: AI SYMPTOM TRIAGE */}
      {activeSubTab === "triage" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-sans font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5.5 h-5.5 text-red-500" />
                <span>AI-Powered Emergency Symptom Triage</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe your symptoms in natural Hinglish or English. JeevanSetu AI interprets clinical indicators instantly to evaluate emergency levels and direct you to the appropriate medical departments.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Example Clinical Presets (Click to Load)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {symptomPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSymptoms(preset.text)}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between"
                  >
                    <span className="font-sans font-bold text-[11px] text-slate-800 dark:text-slate-200">{preset.label}</span>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic">"{preset.text}"</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Form */}
            <form onSubmit={handleTriageSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Symptoms Description</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={triageLoading}
                  rows={4}
                  placeholder="Describe how you are feeling (e.g. 'Mujhe chest me pain lag raha hai, left shoulder me bhi radiating pain hai, bahot sweating ho rahi hai' or 'I have a sore throat, runny nose, minor sneezing since this morning...')"
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  🚨 This tool does not replace professional emergency services.
                </span>
                <button
                  type="submit"
                  disabled={triageLoading || !symptoms.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md shadow-red-500/10 disabled:opacity-50"
                >
                  {triageLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Indicators...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      <span>Initiate AI Triage</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Triage error handler */}
            {triageError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-xs text-red-800 dark:text-red-400 font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <div className="space-y-1">
                  <p>Emergency Connection Failure</p>
                  <p className="text-[11px] font-medium opacity-90">{triageError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Triage Results Display */}
          {triageResult && (
            <div className="space-y-6 animate-fade-in">
              {/* Main status alert card */}
              <div className={`p-6 rounded-2xl border-2 shadow-lg space-y-4 ${
                triageResult.urgency === "EMERGENCY" 
                  ? "bg-red-50/50 dark:bg-red-950/15 border-red-500/80 shadow-red-500/5 animate-pulse" 
                  : triageResult.urgency === "CONSULT"
                    ? "bg-amber-50/50 dark:bg-amber-950/15 border-amber-500/80 shadow-amber-500/5"
                    : "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-500/80 shadow-emerald-500/5"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      triageResult.urgency === "EMERGENCY" 
                        ? "bg-red-600 text-white" 
                        : triageResult.urgency === "CONSULT"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                    }`}>
                      {triageResult.urgency === "EMERGENCY" ? (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      ) : triageResult.urgency === "CONSULT" ? (
                        <Stethoscope className="w-6 h-6 text-white" />
                      ) : (
                        <Heart className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
                        triageResult.urgency === "EMERGENCY" 
                          ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" 
                          : triageResult.urgency === "CONSULT"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        Urgency Level: {triageResult.urgency}
                      </span>
                      <h3 className="font-sans font-extrabold text-base md:text-lg text-slate-900 dark:text-white mt-1 leading-tight">
                        {triageResult.urgencyLabel}
                      </h3>
                    </div>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex gap-2">
                    {triageResult.urgency === "EMERGENCY" && (
                      <button
                        onClick={onSosTrigger}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-sans uppercase tracking-wider shadow-lg shadow-red-500/25 animate-bounce shrink-0"
                      >
                        {isSosTriggered ? "SOS Activated" : "Broadcast SOS Now"}
                      </button>
                    )}
                    {triageResult.urgency === "CONSULT" && (
                      <button
                        onClick={() => setCurrentTab("hospitals")}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold font-sans shrink-0"
                      >
                        Find Clinics & Beds
                      </button>
                    )}
                    {triageResult.urgency === "HOME" && (
                      <button
                        onClick={() => setCurrentTab("medicines")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans shrink-0"
                      >
                        Search Local Pharmacy
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white mb-1.5">AI Clinical Analysis:</p>
                  <p className="whitespace-pre-line">{triageResult.analysis}</p>
                </div>
              </div>

              {/* Grid: Recommended departments, next steps and first aid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Specialists and Departments */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Stethoscope className="w-4.5 h-4.5 text-blue-500" />
                      <span>Recommended Specialists</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Consider consulting medical practitioners in these clinical divisions:</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {triageResult.departments.map((dept, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 font-semibold"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentTab("hospitals")}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-center mt-4 transition-all"
                  >
                    Search Near Hospitals
                  </button>
                </div>

                {/* Direct Recommendations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Direct Action Guidelines</span>
                  </h4>
                  <ul className="space-y-2">
                    {triageResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 leading-normal">
                        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supportive First Aid */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <HeartHandshake className="w-4.5 h-4.5 text-red-500" />
                    <span>Immediate First Aid Measures</span>
                  </h4>
                  <ul className="space-y-2">
                    {triageResult.firstAidSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 leading-normal">
                        <span className="w-4.5 h-4.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-400 leading-normal">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Important Medical Advisory Disclaimer:</span>
                </p>
                <p>{triageResult.disclaimer || "JeevanSetu AI provides emergency triage estimates purely for informational and reference purposes. It is not an active clinical diagnostic tool. Users are strictly advised to consult with a certified medical doctor or visit the nearest emergency trauma center for any severe symptoms or medical issues."}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: AI CHAT ASSISTANT */}
      {activeSubTab === "chat" && (
        <div className="flex flex-col h-[65vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40 dark:bg-slate-950/20 scrollbar-thin">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                    isAi 
                      ? "bg-amber-500 text-white" 
                      : "bg-slate-900 dark:bg-slate-800 text-white"
                  }`}>
                    {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  <div className="space-y-2 max-w-[82%]">
                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xs border ${
                      isAi 
                        ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100" 
                        : "bg-slate-900 text-white border-slate-800 text-left"
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Intent Context widgets */}
                    {isAi && msg.intent === "EMERGENCY_SOS" && (
                      <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/20 text-xs space-y-3 animate-pulse">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Active Emergency Signal Detected</p>
                            <p className="text-slate-600 dark:text-slate-400 text-[10px]">Do you need to broadcast a national trauma beacon?</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={onSosTrigger}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] uppercase"
                          >
                            {isSosTriggered ? "SOS Active" : "Trigger SOS"}
                          </button>
                          <button 
                            onClick={() => setCurrentTab("sos")}
                            className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-[10px]"
                          >
                            Emergency Controls
                          </button>
                        </div>
                      </div>
                    )}

                    {isAi && msg.intent === "GOVERNMENT_SCHEMES" && (
                      <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/40 dark:bg-emerald-950/10 text-xs space-y-2">
                        <div className="flex items-start gap-1.5">
                          <FileText className="w-4.5 h-4.5 text-emerald-600" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Government Schemes Database</p>
                            <p className="text-slate-500 text-[10px]">View the official verified handbook of state medical programs.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentTab("schemes")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                        >
                          Open Schemes Handbook
                        </button>
                      </div>
                    )}

                    {isAi && msg.intent === "BLOOD_DONOR_SEARCH" && (
                      <div className="p-4 rounded-xl border border-red-100 dark:border-red-950/20 bg-red-50/40 dark:bg-red-950/10 text-xs space-y-3">
                        <div className="flex items-start gap-1.5">
                          <Heart className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Blood Donor Search Detected</p>
                            <p className="text-slate-500 text-[10px]">
                              Searching registry for group <span className="text-red-600 font-extrabold">{msg.intentData?.bloodGroup || "O+"}</span> 
                              {msg.intentData?.location && ` in ${msg.intentData.location}`}.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentTab("donors")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px]"
                          >
                            Go to Blood Registry
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentTab("donors");
                              setTimeout(() => {
                                const event = new CustomEvent("openDonorRegistration");
                                window.dispatchEvent(event);
                              }, 150);
                            }}
                            className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-800 rounded-lg font-bold text-[10px]"
                          >
                            Become a Blood Donor
                          </button>
                        </div>
                      </div>
                    )}

                    {isAi && msg.intent === "HOSPITAL_FINDER" && (
                      <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-950/20 bg-blue-50/40 dark:bg-blue-950/10 text-xs space-y-3">
                        <div className="flex items-start gap-1.5">
                          <Activity className="w-4.5 h-4.5 text-blue-600" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Hospital Bed Finder Active</p>
                            <p className="text-slate-500 text-[10px]">Real-time public bed availability tracks ICU, Oxygen, and General facilities.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentTab("hospitals")}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px]"
                        >
                          Find Hospitals & ICU Beds
                        </button>
                      </div>
                    )}

                    {isAi && msg.intent === "AMBULANCE_FINDER" && (
                      <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/40 dark:bg-rose-950/10 text-xs space-y-3">
                        <div className="flex items-start gap-1.5">
                          <Navigation className="w-4.5 h-4.5 text-rose-600" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Emergency Transport Navigator</p>
                            <p className="text-slate-500 text-[10px]">Direct click-to-call links for ACLS, BLS, and Cardiac Care transport drivers.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentTab("ambulance")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px]"
                        >
                          Find Emergency Ambulance
                        </button>
                      </div>
                    )}

                    {isAi && msg.intent === "MEDICINE_SEARCH" && (
                      <div className="p-4 rounded-xl border border-violet-100 dark:border-violet-950/20 bg-violet-50/40 dark:bg-violet-950/10 text-xs space-y-3">
                        <div className="flex items-start gap-1.5">
                          <Stethoscope className="w-4.5 h-4.5 text-violet-600" />
                          <div>
                            <p className="font-sans font-bold text-slate-900 dark:text-white">Local Pharmacy Stock Tracker</p>
                            <p className="text-slate-500 text-[10px]">Check drug indications, precautions, prices, and generic Jan Aushadhi alternatives.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentTab("medicines")}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-[10px]"
                        >
                          Search Medicines Stock
                        </button>
                      </div>
                    )}

                    {/* Grounding Sources */}
                    {isAi && msg.sources && msg.sources.length > 0 && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 max-w-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>Verified Ground Search References:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-3xs"
                            >
                              <ExternalLink className="w-3 h-3 text-red-500" />
                              <span className="truncate max-w-[150px]">{source.title || "Reference Guide"}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center space-x-2 shadow-xs">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input footer */}
          <form onSubmit={handleChatSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={chatLoading}
              placeholder="Ask anything about blood groups, ICU beds, schemes, or first aid..." 
              className="flex-1 px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button 
              type="submit"
              disabled={chatLoading || !inputText.trim()}
              className="px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 rounded-xl flex items-center justify-center shadow-xs disabled:opacity-40"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      )}

      {/* RENDER TAB 3: VERIFIED HANDBOOK (KNOWLEDGE BASE) */}
      {activeSubTab === "handbook" && (
        <div className="space-y-6">
          {/* Filters & Search Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 w-full md:w-auto">
              {[
                { id: "all", label: "All Topics" },
                { id: "first_aid", label: "First Aid 🩹" },
                { id: "condition", label: "Conditions 🩺" },
                { id: "scheme", label: "Govt Schemes 🏛️" },
                { id: "protocol", label: "Emergency Protocols ⚡" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setKbCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                    kbCategory === cat.id 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                placeholder="Search verified articles..."
                className="w-full px-4 py-2 pl-9 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Handbook Browser split screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Article List */}
            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Verified Knowledge Base Articles ({kbArticles.length})</p>
              
              {dbLoading ? (
                <div className="space-y-2.5">
                  <div className="h-16 bg-white dark:bg-slate-900 animate-pulse rounded-xl border border-slate-100 dark:border-slate-800" />
                  <div className="h-16 bg-white dark:bg-slate-900 animate-pulse rounded-xl border border-slate-100 dark:border-slate-800" />
                </div>
              ) : kbArticles.length > 0 ? (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
                  {kbArticles.map((article) => {
                    const isSelected = selectedArticle?.id === article.id;
                    return (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col items-start gap-1 ${
                          isSelected 
                            ? "bg-slate-50 dark:bg-slate-800/40 border-blue-500/50 shadow-xs" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          article.category === "first_aid" 
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400" 
                            : article.category === "condition"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                              : article.category === "scheme"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                                : "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                        }`}>
                          {article.category.replace('_', ' ')}
                        </span>
                        <span className="font-sans font-bold text-xs text-slate-900 dark:text-white leading-tight mt-1">
                          {article.title}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 italic">
                          {article.content.slice(0, 100)}...
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-slate-400 font-sans text-xs">
                  No matching verified articles found.
                </div>
              )}
            </div>

            {/* Right Column: Article Details Viewer */}
            <div className="lg:col-span-8">
              {selectedArticle ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                    <span className="text-[9px] font-extrabold tracking-widest uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                      Verified Reference Card
                    </span>
                    <h2 className="font-sans font-extrabold text-base md:text-lg text-slate-900 dark:text-white leading-tight">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-xl border border-slate-100 dark:border-slate-850/60 max-h-[50vh] overflow-y-auto scrollbar-thin">
                    {selectedArticle.content}
                  </div>

                  {/* Sources & Action bar */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[9px] text-slate-400 font-mono">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">Source: {selectedArticle.source}</p>
                      <p>Last Verified: {new Date(selectedArticle.lastUpdated).toLocaleDateString()} • Live Sync Active</p>
                    </div>

                    <button
                      onClick={() => handleAskAIAboutArticle(selectedArticle)}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 rounded-xl text-xs font-bold font-sans shadow-sm transition-all self-stretch sm:self-auto justify-center"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Ask AI About This</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl text-center text-slate-400">
                  Select an article from our handbook on the left to review verified parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 4: UNIFIED SEARCH */}
      {activeSubTab === "unified-search" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-sans font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5.5 h-5.5 text-emerald-500" />
                <span>Unified Jeevan Search Engine</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Query across all JeevanSetu Firestore databases instantly. Find blood banks, hospital ICU/oxygen beds, active NGOs, and emergency medical handbook articles simultaneously in one single search.
              </p>
            </div>

            {/* Quick Search Presets */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Common Searches (Click to Query)</h5>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "O+ Blood Bank", query: "O+" },
                  { label: "Red Cross NGO", query: "Red Cross" },
                  { label: "AIIMS Hospital", query: "AIIMS" },
                  { label: "CPR Guidelines", query: "CPR" },
                  { label: "Snake bite first aid", query: "Snake bite" },
                  { label: "Ayushman Scheme", query: "Ayushman" }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUnifiedSearchQuery(p.query);
                      executeUnifiedSearch(p.query);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-bold transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeUnifiedSearch(unifiedSearchQuery);
              }}
              className="flex gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={unifiedSearchQuery}
                  onChange={(e) => setUnifiedSearchQuery(e.target.value)}
                  placeholder="Enter medical query (e.g. O+ blood bank, AIIMS ventilator bed, Goonj NGO, CPR guide)..."
                  className="w-full px-4 py-3 pl-11 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={unifiedSearchLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md shadow-emerald-500/15"
              >
                {unifiedSearchLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search JeevanSetu</span>
              </button>
            </form>
          </div>

          {/* Results Block */}
          {unifiedSearchResults && (
            <div className="space-y-6">
              {/* Category Tab Row with badge numbers */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-none">
                {[
                  { id: "all", label: "All Records", count: (unifiedSearchResults.bloodBanks.length + unifiedSearchResults.hospitals.length + unifiedSearchResults.ngos.length + unifiedSearchResults.knowledgeBase.length) },
                  { id: "bloodBanks", label: "Blood Banks", count: unifiedSearchResults.bloodBanks.length, color: "bg-red-500 text-white" },
                  { id: "hospitals", label: "Hospitals & Beds", count: unifiedSearchResults.hospitals.length, color: "bg-blue-500 text-white" },
                  { id: "ngos", label: "NGOs", count: unifiedSearchResults.ngos.length, color: "bg-purple-500 text-white" },
                  { id: "knowledgeBase", label: "Medical Handbook", count: unifiedSearchResults.knowledgeBase.length, color: "bg-emerald-500 text-white" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUnifiedSearchCategory(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold font-sans transition-all whitespace-nowrap ${
                      unifiedSearchCategory === tab.id
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${tab.id === unifiedSearchCategory ? (tab.color || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300") : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Grid Layouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Blood Banks Section */}
                {(unifiedSearchCategory === "all" || unifiedSearchCategory === "bloodBanks") && (
                  <div className="md:col-span-2 space-y-3">
                    {unifiedSearchCategory === "all" && (
                      <h4 className="font-sans font-extrabold text-xs text-red-500 dark:text-red-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">
                        <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                        <span>Matching Blood Banks ({unifiedSearchResults.bloodBanks.length})</span>
                      </h4>
                    )}
                    
                    {unifiedSearchResults.bloodBanks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unifiedSearchResults.bloodBanks.map((bb: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-red-300 dark:hover:border-red-950/50 transition-all shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md">
                                  {bb.type || "Blood Bank"}
                                </span>
                                {bb.isVerified && (
                                  <span className="text-[8px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">Verified</span>
                                )}
                              </div>
                              <h5 className="font-sans font-bold text-xs text-slate-900 dark:text-white mt-1.5">{bb.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                <span>{bb.address}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 italic leading-normal">
                                {bb.details}
                              </p>
                            </div>
                            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Source: {bb.source}</span>
                              <div className="flex gap-1.5">
                                <a href={`tel:${bb.contact}`} className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg font-bold flex items-center gap-1 text-[9px]">
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                                <button
                                  onClick={() => {
                                    setCurrentTab("blood-requests");
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-bold text-[9px]"
                                >
                                  Request Blood
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      unifiedSearchCategory === "bloodBanks" && (
                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                          No matching verified blood banks found.
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* 2. Hospitals Section */}
                {(unifiedSearchCategory === "all" || unifiedSearchCategory === "hospitals") && (
                  <div className="md:col-span-2 space-y-3 mt-4 md:mt-2">
                    {unifiedSearchCategory === "all" && (
                      <h4 className="font-sans font-extrabold text-xs text-blue-500 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span>Matching Hospitals & Bed Allocations ({unifiedSearchResults.hospitals.length})</span>
                      </h4>
                    )}
                    
                    {unifiedSearchResults.hospitals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unifiedSearchResults.hospitals.map((h: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-950/50 transition-all shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md">
                                  Rating: {h.rating ? `⭐ ${h.rating}` : "N/A"}
                                </span>
                                {h.bloodBank && (
                                  <span className="text-[8px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">Has Blood Bank</span>
                                )}
                              </div>
                              <h5 className="font-sans font-bold text-xs text-slate-900 dark:text-white mt-1.5">{h.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                <span>{h.address}</span>
                              </p>
                              
                              <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                <div className="text-center">
                                  <p className="text-[8px] font-mono text-slate-400 uppercase">ICU Beds</p>
                                  <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">{h.icuBeds || "0"}</p>
                                </div>
                                <div className="text-center border-x border-slate-200 dark:border-slate-700">
                                  <p className="text-[8px] font-mono text-slate-400 uppercase">Oxygen</p>
                                  <p className="font-sans font-bold text-xs text-emerald-600 dark:text-emerald-400">{h.oxygenBeds || "0"}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] font-mono text-slate-400 uppercase">General</p>
                                  <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">{h.generalBeds || "0"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Registry: {h.source || "Govt Database"}</span>
                              <div className="flex gap-1.5">
                                <a href={`tel:${h.contact}`} className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg font-bold flex items-center gap-1 text-[9px]">
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                                <button
                                  onClick={() => setCurrentTab("hospitals")}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-bold text-[9px]"
                                >
                                  Book Bed
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      unifiedSearchCategory === "hospitals" && (
                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                          No matching verified hospitals found.
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* 3. NGOs Section */}
                {(unifiedSearchCategory === "all" || unifiedSearchCategory === "ngos") && (
                  <div className="md:col-span-2 space-y-3 mt-4 md:mt-2">
                    {unifiedSearchCategory === "all" && (
                      <h4 className="font-sans font-extrabold text-xs text-purple-500 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">
                        <HeartHandshake className="w-4 h-4 text-purple-500" />
                        <span>Matching Humanitarian NGOs & Volunteer Networks ({unifiedSearchResults.ngos.length})</span>
                      </h4>
                    )}
                    
                    {unifiedSearchResults.ngos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unifiedSearchResults.ngos.map((ngo: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-purple-300 dark:hover:border-purple-950/50 transition-all shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-md">
                                  Verified Civil Partner
                                </span>
                              </div>
                              <h5 className="font-sans font-bold text-xs text-slate-900 dark:text-white mt-1.5">{ngo.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                <span>{ngo.address}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 italic leading-normal">
                                {ngo.purpose}
                              </p>
                            </div>
                            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Source: {ngo.source}</span>
                              <div className="flex gap-1.5">
                                {ngo.website && ngo.website !== "https://jeevansetu.gov.in" && (
                                  <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold flex items-center gap-1 text-[9px] border border-slate-250 dark:border-slate-700">
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Website</span>
                                  </a>
                                )}
                                <a href={`tel:${ngo.contact}`} className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-lg font-bold flex items-center gap-1 text-[9px]">
                                  <Phone className="w-3 h-3" />
                                  <span>Call Contact</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      unifiedSearchCategory === "ngos" && (
                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                          No matching verified NGOs found.
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* 4. Knowledge Base Section */}
                {(unifiedSearchCategory === "all" || unifiedSearchCategory === "knowledgeBase") && (
                  <div className="md:col-span-2 space-y-3 mt-4 md:mt-2">
                    {unifiedSearchCategory === "all" && (
                      <h4 className="font-sans font-extrabold text-xs text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        <span>Matching Handbook Guides & First Aid Guidelines ({unifiedSearchResults.knowledgeBase.length})</span>
                      </h4>
                    )}
                    
                    {unifiedSearchResults.knowledgeBase.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unifiedSearchResults.knowledgeBase.map((kb: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-950/50 transition-all shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md">
                                  {kb.category ? kb.category.replace('_', ' ') : "Medical Guide"}
                                </span>
                              </div>
                              <h5 className="font-sans font-bold text-xs text-slate-900 dark:text-white mt-1.5">{kb.title}</h5>
                              <p className="text-[10px] text-slate-400 line-clamp-3 mt-2 italic leading-relaxed">
                                {kb.content}
                              </p>
                              
                              {kb.keywords && kb.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                  {kb.keywords.slice(0, 3).map((kw: string, kidx: number) => (
                                    <span key={kidx} className="text-[8px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                      #{kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Source: {kb.source}</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    // Direct to Medical handbook sub-tab
                                    setSelectedArticle(kb);
                                    setActiveSubTab("handbook");
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[9px] border border-slate-250 dark:border-slate-700"
                                >
                                  Read Full Guide
                                </button>
                                <button
                                  onClick={() => handleAskAIAboutArticle(kb)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 text-[9px]"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Ask AI</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      unifiedSearchCategory === "knowledgeBase" && (
                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                          No matching handbook articles found.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Action Fallbacks Area */}
              <div className="bg-slate-100 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-sans font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>Still Can't Find What You Need?</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Search the entire live internet via AI grounding or register yourself directly on JeevanSetu AI to build the national network.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 self-stretch md:self-auto text-center justify-center">
                  <button
                    onClick={() => {
                      setInputText(`Can you search the internet using Google Grounding for: ${unifiedSearchQuery || "JeevanSetu AI Emergency Services"}`);
                      setActiveSubTab("chat");
                      // Switch to chat input immediately
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Search Internet (AI)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("profile");
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Register on JeevanSetu</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
