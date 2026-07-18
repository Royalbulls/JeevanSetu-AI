export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-"
}

export type UserRole = "Citizen" | "Volunteer" | "Police" | "Hospital" | "Blood Bank" | "Doctor" | "NGO" | "Admin" | "Super Admin";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup | "";
  allergies: string;
  chronicIllnesses: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isDonor: boolean;
  role: UserRole;
  isVerifiedDonor?: boolean;
  donorVerificationStatus?: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  hospitalVerificationStatus?: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  isOtpVerified?: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  state?: string;
  contactNumber: string;
  requiredDate: string;
  requiredBefore?: string;
  emergencyLevel?: "Low" | "Medium" | "High" | "Critical";
  reason: string;
  status: "URGENT" | "FULFILLED" | "PENDING";
  createdAt: string;
  createdBy: string;
  source?: string;
  lastUpdated?: string;
}

export interface Donor {
  id: string;
  fullName: string;
  bloodGroup: BloodGroup;
  city: string;
  phone: string;
  isAvailable: boolean;
  lastDonatedDate?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  donorVerificationStatus?: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  isVerifiedDonor?: boolean;
  photo?: string;
  gender?: "Male" | "Female" | "Other" | "";
  dob?: string;
  email?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  hidePhone?: boolean;
  hideLocation?: boolean;
  medicalEligibility?: boolean;
  isOtpVerified?: boolean;
  bloodBankVerified?: boolean;
  donationHistory?: Array<{
    id: string;
    date: string;
    location: string;
    units: number;
    notes?: string;
  }>;
}

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  bloodGroup?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: string;
  status: "ACTIVE" | "RESOLVED";
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contact: string;
  distance: string; // e.g. "1.2 km"
  bedsAvailable: {
    icu: number;
    oxygen: number;
    general: number;
  };
  bloodBank: boolean;
  hasAmbulance: boolean;
  source: string;
  lastUpdated: string;
  isVerified?: boolean;
  verificationStatus?: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  rating?: number;
}

export interface Ambulance {
  id: string;
  providerName: string;
  contact: string;
  type: "ACLS" | "BLS" | "Cardiac Care" | "Basic";
  chargePerHour: string;
  distance: string;
  status: "AVAILABLE" | "ON_TRIP";
  lastUpdated: string;
  source: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  indications: string;
  warnings: string;
  price: string;
  availableAt: string[]; // pharmacy names
  source: string;
  lastUpdated: string;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  applyUrl: string;
  source: string;
  lastUpdated: string;
}

export interface Campaign {
  id: string;
  patientName: string;
  hospitalName: string;
  targetAmount: number;
  raisedAmount: number;
  illness: string;
  description: string;
  upiId: string;
  contactPhone: string;
  status: "ACTIVE" | "COMPLETED";
  lastUpdated: string;
  source: string;
}

export interface DocumentScanResult {
  documentType: "Prescription" | "Lab Report" | "Health Card" | "Unknown";
  patientName?: string;
  date?: string;
  doctorOrLab?: string;
  medicines?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  diagnosesOrNotes?: string;
  keyParameters?: string;
  summary: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "SOS" | "BLOOD_REQ" | "SYSTEM";
  timestamp: string;
  read: boolean;
}

export interface KnowledgeBaseEntry {
  id: string;
  category: "condition" | "first_aid" | "scheme" | "protocol";
  title: string;
  content: string;
  source: string;
  source_url?: string;
  last_updated?: string;
  lastUpdated?: string;
  language?: string;
  keywords?: string[];
  searchKeywords?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  role?: string;
}

export interface LostFoundReport {
  id: string;
  type: "LOST" | "FOUND";
  category: string;
  title: string;
  description: string;
  photoUrl?: string;
  dateTime: string;
  lastSeenLocation: string;
  state: string;
  district: string;
  city: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reward?: string;
  safeCustodyDetails?: string;
  firNumber?: string;
  firPoliceStation?: string;
  nearestPoliceStation?: string;
  nearestPoliceContact?: string;
  createdBy: string;
  createdAt: string;
  isOtpVerified: boolean;
  status: "ACTIVE" | "MATCHED" | "FLAGGED_FAKE" | "DELETED";
  reportFlags?: number;
  privacyAgreedUsers?: string[]; // UIDs of users who have requested and been granted mutual contact info
  connectionRequests?: string[]; // UIDs of users requesting details
}

