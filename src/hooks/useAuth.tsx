import React, { useState, useEffect, createContext, useContext } from "react";
import { 
  User, 
  onAuthStateChanged, 
  loginWithGoogle, 
  logoutUser, 
  auth,
  db
} from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile, BloodGroup } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Firestore user profile
  const fetchProfile = async (uid: string, email: string, displayName: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial default profile
        const newProfile: UserProfile = {
          uid,
          fullName: displayName || "Setu User",
          email: email || "",
          phone: "",
          bloodGroup: "",
          allergies: "",
          chronicIllnesses: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          isDonor: false,
          role: "Citizen",
          isVerifiedDonor: false,
          donorVerificationStatus: "NONE"
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error loading profile from Firestore:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser.email || "", currentUser.displayName || "");
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      return loggedUser;
    } catch (e) {
      console.error("Google sign in failed:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const merged = { ...(profile || {}), ...updated } as UserProfile;
      await setDoc(docRef, merged, { merge: true });
      setProfile(merged);
    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
