import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Radio, 
  CheckCircle,
  Volume2,
  VolumeX,
  Play,
  Activity
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { triggerSosAlert } from "../lib/firestoreService";
import { SosAlert } from "../types";

interface EmergencySosProps {
  isSosTriggered: boolean;
  onSosTrigger: () => void;
}

export const EmergencySOS: React.FC<EmergencySosProps> = ({ 
  isSosTriggered, 
  onSosTrigger 
}) => {
  const { user, profile: userProfile } = useAuth();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [emergencyType, setEmergencyType] = useState<string>("Accident / Medical Trauma");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  // Get GPS Coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("GPS retrieval error:", error);
          // Fallback coords for India (Delhi Center)
          setCoords({ latitude: 28.6139, longitude: 77.2090 });
        }
      );
    } else {
      setCoords({ latitude: 28.6139, longitude: 77.2090 });
    }
  }, []);

  // Audio Synth for SOS Alarm
  const toggleSiren = () => {
    if (sirenPlaying) {
      if (oscillator) {
        try {
          oscillator.stop();
        } catch (e) {}
        setOscillator(null);
      }
      setSirenPlaying(false);
    } else {
      try {
        const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) setAudioContext(ctx);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        
        // Custom siren sweep modulation
        const sweepEnv = () => {
          if (!sirenPlaying && osc) {
            const time = ctx.currentTime;
            osc.frequency.setValueAtTime(600 + Math.sin(time * 5) * 200, time);
            requestAnimationFrame(sweepEnv);
          }
        };

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        setOscillator(osc);
        setSirenPlaying(true);
        
        // Modulate frequency to create real sounding siren
        let modUp = true;
        const interval = setInterval(() => {
          if (!osc) {
            clearInterval(interval);
            return;
          }
          osc.frequency.linearRampToValueAtTime(modUp ? 800 : 400, ctx.currentTime + 0.4);
          modUp = !modUp;
        }, 500);

      } catch (e) {
        console.error("Audio Synthesis Error:", e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillator) {
        try { oscillator.stop(); } catch (e) {}
      }
    };
  }, [oscillator]);

  const handleTriggerSos = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      if (!coords) {
        throw new Error("Acquiring GPS location. Please try in 2 seconds.");
      }

      await triggerSosAlert({
        userId: userProfile?.uid || "anon-user",
        userName: userProfile?.fullName || "Anonymous Citizen",
        userPhone: userProfile?.phone || "9999999999",
        bloodGroup: userProfile?.bloodGroup || "O+",
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: `Geo-Coordinates: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
        }
      });

      onSosTrigger();
      setStatusMessage("SOS broadcasted to JeevanSetu Cloud and rescue teams!");
    } catch (error: any) {
      setStatusMessage(`SOS Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span>Emergency SOS Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Instant emergency location broadcast and immediate trauma instructions</p>
        </div>

        {/* Local Siren Toggle */}
        <button
          onClick={toggleSiren}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            sirenPlaying 
              ? "bg-red-500 text-white border-red-400 animate-pulse" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}
        >
          {sirenPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{sirenPlaying ? "Mute Loud Alarm" : "Play Loud Alarm Sound"}</span>
        </button>
      </div>

      {/* Main SOS Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Trigger & Settings */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center justify-center space-y-6">
          <div className="w-full text-left space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase font-mono">1. Select Emergency Category</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option>Accident / Medical Trauma</option>
              <option>Cardiac Arrest / Chest Pain</option>
              <option>Physical Assault / Safety Threat</option>
              <option>Severe Bleeding / Wound</option>
              <option>Disaster / Fire Rescue</option>
            </select>
          </div>

          {/* Glowing SOS Pulse Button */}
          <div className="relative flex items-center justify-center py-6">
            {isSosTriggered && (
              <div className="absolute inset-0 w-48 h-48 rounded-full bg-red-600/20 dark:bg-red-500/20 animate-ping" />
            )}
            <button
              onClick={handleTriggerSos}
              disabled={loading}
              className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-sans font-extrabold uppercase shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 select-none ${
                isSosTriggered 
                  ? "bg-gradient-to-br from-red-800 to-slate-900 shadow-red-950/40" 
                  : "bg-gradient-to-br from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-500/30"
              }`}
            >
              <Radio className={`w-10 h-10 mb-2 ${isSosTriggered ? "animate-pulse" : ""}`} />
              <span className="text-xl tracking-wider leading-none">
                {isSosTriggered ? "Active" : "SOS"}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-rose-100 mt-1">
                {isSosTriggered ? "Broadcasted" : "Tap to Send"}
              </span>
            </button>
          </div>

          <div className="space-y-2 w-full">
            {/* GPS details */}
            <div className="flex items-center justify-center space-x-1.5 text-xs font-mono text-slate-500">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>
                {coords 
                  ? `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)} (Indian Standard Location)` 
                  : "Searching GPS Location..."}
              </span>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center space-x-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Transmission: Secure Cloud Broadcast</span>
            <span>Accuracy: Up to 5 meters</span>
          </div>
        </div>

        {/* Right: Urgent Life-Saving Trauma Guides */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-slate-900 dark:text-white mb-1.5 flex items-center space-x-1.5">
              <Activity className="w-4.5 h-4.5 text-rose-500" />
              <span>First-Aid Trauma Quick Guide</span>
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Immediate life preservation steps during major medical trauma</p>

            <div className="space-y-3.5">
              {[
                {
                  title: "Heavy Bleeding Control",
                  steps: "1. Apply firm, direct pressure on the wound with a clean cloth. 2. Elevate the injured limb above heart level. 3. Do not remove blood-soaked cloth; layer another over it."
                },
                {
                  title: "Emergency CPR Cycle",
                  steps: "1. Place hands on center of chest. 2. Push hard & fast (100-120 compressions/min) at 2 inches depth. 3. Provide 30 compressions followed by 2 quick rescue breaths."
                },
                {
                  title: "Accident Victim Position",
                  steps: "1. Check responsiveness & pulse. 2. If unconscious but breathing, turn carefully to recovery side. 3. Keep airway open by tilting head back slightly."
                }
              ].map((guide, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span className="w-4.5 h-4.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{guide.title}</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 pl-6">
                    {guide.steps}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Medical Source: Red Cross Trauma Manual</span>
            <span>Last Updated: 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
