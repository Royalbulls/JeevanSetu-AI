import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { BloodRequest, Donor, SosAlert, Campaign, KnowledgeBaseEntry, Hospital } from "../types";
import { VERIFIED_KNOWLEDGE_BASE, VERIFIED_HOSPITALS, VERIFIED_NGOS } from "../data/verifiedData";

// Collection references
const BLOOD_REQUESTS_COLL = "blood_requests";
const DONORS_COLL = "donors";
const SOS_ALERTS_COLL = "sos_alerts";
const CAMPAIGNS_COLL = "campaigns";
const KNOWLEDGE_BASE_COLL = "medical_knowledge";

// 1. Blood Requests Service
export async function addBloodRequest(request: Omit<BloodRequest, "id" | "createdAt" | "status">) {
  try {
    const docRef = await addDoc(collection(db, BLOOD_REQUESTS_COLL), {
      ...request,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding blood request to Firestore:", error);
    throw error;
  }
}

export async function getBloodRequests(): Promise<BloodRequest[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, BLOOD_REQUESTS_COLL), orderBy("createdAt", "desc")));
    const requests: BloodRequest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data
      } as BloodRequest);
    });
    return requests;
  } catch (error) {
    console.error("Error fetching blood requests from Firestore:", error);
    return []; // Return empty so the UI shows "No data available"
  }
}

// 2. Donors Service
export async function registerDonor(donor: Omit<Donor, "id">, userId: string) {
  try {
    await setDoc(doc(db, DONORS_COLL, userId), {
      ...donor
    }, { merge: true });
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error registering donor in Firestore:", error);
    throw error;
  }
}

export async function getDonors(): Promise<Donor[]> {
  try {
    const querySnapshot = await getDocs(collection(db, DONORS_COLL));
    const donors: Donor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donors.push({
        id: doc.id,
        ...data
      } as Donor);
    });
    return donors;
  } catch (error) {
    console.error("Error fetching donors from Firestore:", error);
    return [];
  }
}

export function subscribeDonors(callback: (donors: Donor[]) => void, onError?: (err: any) => void) {
  return onSnapshot(collection(db, DONORS_COLL), (snapshot) => {
    const list: Donor[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Donor);
    });
    callback(list);
  }, (err) => {
    console.error("subscribeDonors error:", err);
    if (onError) onError(err);
  });
}

export function subscribeBloodRequests(callback: (requests: BloodRequest[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, BLOOD_REQUESTS_COLL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const list: BloodRequest[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as BloodRequest);
    });
    callback(list);
  }, (err) => {
    console.error("subscribeBloodRequests error:", err);
    if (onError) onError(err);
  });
}

// 3. SOS Service
export async function triggerSosAlert(sos: Omit<SosAlert, "id" | "createdAt" | "status">) {
  try {
    const docRef = await addDoc(collection(db, SOS_ALERTS_COLL), {
      ...sos,
      createdAt: new Date().toISOString(),
      status: "ACTIVE"
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error triggering SOS alert in Firestore:", error);
    throw error;
  }
}

export async function getActiveSosAlerts(): Promise<SosAlert[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, SOS_ALERTS_COLL), orderBy("createdAt", "desc"), limit(20)));
    const alerts: SosAlert[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        ...data
      } as SosAlert);
    });
    return alerts;
  } catch (error) {
    console.error("Error fetching SOS alerts from Firestore:", error);
    return [];
  }
}

export async function resolveSosAlert(alertId: string) {
  try {
    const docRef = doc(db, SOS_ALERTS_COLL, alertId);
    await updateDoc(docRef, { status: "RESOLVED" });
    return { success: true };
  } catch (error) {
    console.error("Error resolving SOS alert in Firestore:", error);
    throw error;
  }
}

// 4. Crowdfunding Campaigns Service
export async function createCampaign(campaign: Omit<Campaign, "id" | "raisedAmount" | "status" | "lastUpdated">) {
  try {
    const docRef = await addDoc(collection(db, CAMPAIGNS_COLL), {
      ...campaign,
      raisedAmount: 0,
      status: "ACTIVE",
      lastUpdated: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating campaign in Firestore:", error);
    throw error;
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const querySnapshot = await getDocs(collection(db, CAMPAIGNS_COLL));
    const campaigns: Campaign[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      campaigns.push({
        id: doc.id,
        ...data
      } as Campaign);
    });
    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns from Firestore:", error);
    return [];
  }
}

export async function donateToCampaign(campaignId: string, amount: number) {
  try {
    const campaignRef = doc(db, CAMPAIGNS_COLL, campaignId);
    const campaignDoc = await getDoc(campaignRef);
    if (campaignDoc.exists()) {
      const currentRaised = campaignDoc.data().raisedAmount || 0;
      await updateDoc(campaignRef, {
        raisedAmount: currentRaised + amount,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    }
    throw new Error("Campaign not found");
  } catch (error) {
    console.error("Error donating to campaign in Firestore:", error);
    throw error;
  }
}

// 5. Medical Knowledge Base Service
export async function ensureKnowledgeBaseSeeded() {
  try {
    const qSnapshot = await getDocs(collection(db, KNOWLEDGE_BASE_COLL));
    if (qSnapshot.empty) {
      console.log("Firestore medical knowledge base is empty. Seeding verified data...");
      for (const entry of VERIFIED_KNOWLEDGE_BASE) {
        // Map the properties to exactly what's requested
        const structuredEntry = {
          id: entry.id,
          title: entry.title,
          category: entry.category,
          content: entry.content,
          source: entry.source,
          source_url: entry.id === "kb-ayushman" ? "https://dashboard.pmjay.gov.in/pmjayportal/" : "https://www.nhp.gov.in/",
          last_updated: entry.last_updated || (entry as any).lastUpdated || new Date().toISOString(),
          language: "en",
          keywords: entry.keywords || (entry as any).searchKeywords || ["medical", "first aid"]
        };
        await setDoc(doc(db, KNOWLEDGE_BASE_COLL, entry.id), structuredEntry);
      }
      console.log(`Seeded ${VERIFIED_KNOWLEDGE_BASE.length} verified medical articles successfully.`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error seeding medical knowledge base in Firestore:", error);
    throw error;
  }
}

export async function getKnowledgeBase(category?: string, queryStr?: string): Promise<KnowledgeBaseEntry[]> {
  try {
    const qSnapshot = await getDocs(collection(db, KNOWLEDGE_BASE_COLL));
    const entries: KnowledgeBaseEntry[] = [];
    qSnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        title: data.title || "",
        category: data.category || "first_aid",
        content: data.content || "",
        source: data.source || "",
        source_url: data.source_url || "https://www.nhp.gov.in/",
        last_updated: data.last_updated || new Date().toISOString(),
        language: data.language || "en",
        keywords: data.keywords || []
      } as KnowledgeBaseEntry);
    });

    let filtered = entries;
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    if (queryStr) {
      const lowerQuery = queryStr.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(lowerQuery) ||
        e.content.toLowerCase().includes(lowerQuery) ||
        e.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
      );
    }
    return filtered;
  } catch (error) {
    console.error("Error fetching medical knowledge base from Firestore:", error);
    // Return fallback local seed data with exact keys mapped
    const fallbackMapped = VERIFIED_KNOWLEDGE_BASE.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      content: e.content,
      source: e.source,
      source_url: e.id === "kb-ayushman" ? "https://dashboard.pmjay.gov.in/pmjayportal/" : "https://www.nhp.gov.in/",
      last_updated: e.last_updated || (e as any).lastUpdated || new Date().toISOString(),
      language: "en",
      keywords: e.keywords || (e as any).searchKeywords || ["medical", "first aid"]
    }));
    
    let filtered = fallbackMapped;
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    if (queryStr) {
      const lowerQuery = queryStr.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(lowerQuery) ||
        e.content.toLowerCase().includes(lowerQuery) ||
        e.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
      );
    }
    return filtered;
  }
}

export interface UnifiedSearchResult {
  hospitals: Hospital[];
  bloodBanks: Array<Hospital | Donor | any>;
  ngos: Array<any>;
  knowledgeBase: KnowledgeBaseEntry[];
  query: string;
  timestamp: string;
}

export async function unifiedSearch(queryStr: string): Promise<UnifiedSearchResult> {
  const lowerQuery = (queryStr || "").toLowerCase().trim();
  const timestamp = new Date().toISOString();

  // 1. Gather all data sources in parallel from Firestore with local high-fidelity fallbacks
  let cloudHospitals: Hospital[] = [];
  let cloudDonors: Donor[] = [];
  let cloudNgoUsers: any[] = [];
  let cloudKb: KnowledgeBaseEntry[] = [];

  // Query Firestore Hospitals
  try {
    const qSnapshot = await getDocs(collection(db, "hospitals"));
    qSnapshot.forEach((doc) => {
      cloudHospitals.push({ id: doc.id, ...doc.data() } as Hospital);
    });
  } catch (err) {
    console.warn("Firestore hospitals fetch error (using local fallback list):", err);
  }

  // Query Firestore Donors
  try {
    const qSnapshot = await getDocs(collection(db, "donors"));
    qSnapshot.forEach((doc) => {
      cloudDonors.push({ id: doc.id, ...doc.data() } as Donor);
    });
  } catch (err) {
    console.warn("Firestore donors fetch error (using local fallback list):", err);
  }

  // Query Firestore Users with NGO/Blood Bank roles
  try {
    const qSnapshot = await getDocs(collection(db, "users"));
    qSnapshot.forEach((doc) => {
      const uData = doc.data();
      if (uData.role === "NGO" || uData.role === "Blood Bank") {
        cloudNgoUsers.push({ id: doc.id, ...uData });
      }
    });
  } catch (err) {
    console.warn("Firestore users fetch error (using local fallback list):", err);
  }

  // Query Medical Knowledge Base
  try {
    cloudKb = await getKnowledgeBase();
  } catch (err) {
    console.warn("Firestore knowledge base fetch error (using local fallback list):", err);
  }

  // 2. Merge Firestore data with static high-fidelity fallback data
  // Combine & de-duplicate hospitals
  const mergedHospitalsMap = new Map<string, Hospital>();
  VERIFIED_HOSPITALS.forEach(h => mergedHospitalsMap.set(h.id, h));
  cloudHospitals.forEach(h => mergedHospitalsMap.set(h.id || h.name, h));
  const allHospitals = Array.from(mergedHospitalsMap.values());

  // Combine & de-duplicate NGOs
  const mergedNgosMap = new Map<string, any>();
  VERIFIED_NGOS.forEach(n => mergedNgosMap.set(n.id, n));
  cloudNgoUsers.forEach(u => {
    if (u.role === "NGO") {
      mergedNgosMap.set(u.id, {
        id: u.id,
        name: u.fullName || u.name || "Humanitarian NGO Volunteer",
        purpose: u.purpose || `Civil humanitarian relief volunteer. Verified role: ${u.role}. Contact for local community support.`,
        address: u.address || u.city || "India",
        contact: u.phone || u.contact || "112",
        website: u.website || "https://jeevansetu.gov.in",
        source: "JeevanSetu Registered Member",
        lastUpdated: u.createdAt || timestamp
      });
    }
  });
  const allNgos = Array.from(mergedNgosMap.values());

  // Gather Blood Banks
  // Blood Banks can be:
  // a) Hospitals with bloodBank === true
  // b) Users with role === "Blood Bank"
  // c) Donors / Centers matching name "Blood Bank"
  const bloodBanksMap = new Map<string, any>();
  
  // Find from hospitals
  allHospitals.forEach(h => {
    if (h.bloodBank) {
      bloodBanksMap.set(`hosp-bb-${h.id}`, {
        id: h.id,
        name: `${h.name} (Blood Bank Division)`,
        address: h.address,
        contact: h.contact,
        type: "Hospital Blood Bank",
        details: "Critical hospital blood storage unit. 24/7 emergency cross-matching available.",
        source: h.source || "Government Health Registry",
        isVerified: h.isVerified !== false
      });
    }
  });

  // Find from users with role "Blood Bank"
  cloudNgoUsers.forEach(u => {
    if (u.role === "Blood Bank") {
      bloodBanksMap.set(`user-bb-${u.id}`, {
        id: u.id,
        name: u.fullName || u.name || "Verified Blood Bank Center",
        address: u.address || u.city || "India",
        contact: u.phone || u.contact || "112",
        type: "Registered Blood Bank",
        details: u.description || "JeevanSetu registered voluntary blood bank repository.",
        source: "JeevanSetu Network",
        isVerified: true
      });
    }
  });

  // Find from donors matching "blood bank" or "red cross" in name
  cloudDonors.forEach(d => {
    const dName = (d.fullName || "").toLowerCase();
    if (dName.includes("blood bank") || dName.includes("red cross") || dName.includes("charity") || dName.includes("foundation")) {
      bloodBanksMap.set(`donor-bb-${d.id}`, {
        id: d.id,
        name: d.fullName,
        address: d.city || "India",
        contact: d.phone,
        type: "Community Blood Repository",
        details: "Voluntary community-led blood collection and donation coordination center.",
        source: "JeevanSetu Donors",
        isVerified: d.isVerifiedDonor || false
      });
    }
  });

  const allBloodBanks = Array.from(bloodBanksMap.values());

  // Combine & de-duplicate Knowledge Base
  const mergedKbMap = new Map<string, KnowledgeBaseEntry>();
  VERIFIED_KNOWLEDGE_BASE.forEach(kb => {
    mergedKbMap.set(kb.id, {
      ...kb,
      last_updated: kb.last_updated || (kb as any).lastUpdated,
      keywords: kb.keywords || (kb as any).searchKeywords || []
    });
  });
  cloudKb.forEach(kb => {
    mergedKbMap.set(kb.id, {
      ...kb,
      last_updated: kb.last_updated || (kb as any).lastUpdated,
      keywords: kb.keywords || (kb as any).searchKeywords || []
    });
  });
  const allKb = Array.from(mergedKbMap.values());

  // 3. Perform Unified Search / Filtering based on query string
  // If query is empty, return everything (or a summary)
  if (!lowerQuery) {
    return {
      hospitals: allHospitals.slice(0, 5),
      bloodBanks: allBloodBanks.slice(0, 5),
      ngos: allNgos.slice(0, 5),
      knowledgeBase: allKb.slice(0, 5),
      query: "",
      timestamp
    };
  }

  const filteredHospitals = allHospitals.filter(h => 
    h.name.toLowerCase().includes(lowerQuery) ||
    h.address.toLowerCase().includes(lowerQuery) ||
    (h.contact && h.contact.includes(lowerQuery))
  );

  const filteredBloodBanks = allBloodBanks.filter(bb => 
    bb.name.toLowerCase().includes(lowerQuery) ||
    bb.address.toLowerCase().includes(lowerQuery) ||
    (bb.contact && bb.contact.includes(lowerQuery)) ||
    (bb.details && bb.details.toLowerCase().includes(lowerQuery))
  );

  const filteredNgos = allNgos.filter(n => 
    n.name.toLowerCase().includes(lowerQuery) ||
    n.purpose.toLowerCase().includes(lowerQuery) ||
    n.address.toLowerCase().includes(lowerQuery) ||
    (n.contact && n.contact.includes(lowerQuery))
  );

  const filteredKb = allKb.filter(kb => 
    kb.title.toLowerCase().includes(lowerQuery) ||
    kb.content.toLowerCase().includes(lowerQuery) ||
    (kb.keywords && kb.keywords.some(kw => kw.toLowerCase().includes(lowerQuery)))
  );

  return {
    hospitals: filteredHospitals,
    bloodBanks: filteredBloodBanks,
    ngos: filteredNgos,
    knowledgeBase: filteredKb,
    query: queryStr,
    timestamp
  };
}
