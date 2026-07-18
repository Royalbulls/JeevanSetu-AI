import React, { useState } from "react";
import { 
  Camera, 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  User, 
  Clock, 
  Printer, 
  Pill,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { DocumentScanResult } from "../types";

export const MedicalScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setScanResult(null);
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // Strip metadata from data URL (needed for Gemini base64)
      const base64Data = image.split(",")[1];

      const res = await fetch("/api/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, fileType })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setScanResult(json.data);
      } else {
        throw new Error(json.error || "Failed to scan document");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse document. Please upload a clear image of prescription or health card.");
    } finally {
      setLoading(false);
    }
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-red-600" />
            <span>AI Medical Document Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Upload doctor prescriptions, lab diagnostics, or health cards for automatic digital translation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload and Camera Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UploadCloud className="w-4.5 h-4.5 text-red-600" />
            <span>Upload Document Photo</span>
          </h3>

          <div className="space-y-4">
            {image ? (
              <div className="relative w-full h-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                <img src={image} alt="scanned prescription" className="object-contain max-h-full max-w-full" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold font-sans"
                >
                  Clear Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-center p-6">
                <Camera className="w-10 h-10 text-slate-300 mb-2.5 animate-bounce" />
                <span className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">Drag & Drop or Click to Scan</span>
                <span className="text-[10px] text-slate-400 mt-1">Supports PDF, JPEG, PNG prescriptions and medical reports</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {image && !scanResult && (
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans font-bold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 h-10"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>{loading ? "Analyzing Prescription..." : "Translate Document via AI"}</span>
              </button>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scanner translation Output */}
        <div className="lg:col-span-7">
          {scanResult ? (
            <div id="print-area" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                    {scanResult.documentType} Translation
                  </span>
                  <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    Digital Medical Record
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Date parsed: {scanResult.date || "Unknown"}</p>
                </div>

                <button 
                  onClick={printDocument}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Printer className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Extraction items */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Patient Name</span>
                    <p className="font-sans font-bold text-slate-900 dark:text-white">{scanResult.patientName || "Not Found"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Practitioner / Lab</span>
                    <p className="font-sans font-bold text-slate-900 dark:text-white">{scanResult.doctorOrLab || "Not Found"}</p>
                  </div>
                </div>

                {/* Medicines List */}
                {scanResult.medicines && scanResult.medicines.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Prescribed Formulations:</span>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                      {scanResult.medicines.map((med, idx) => (
                        <div key={idx} className="p-3 flex items-start justify-between">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className="font-sans font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <Pill className="w-4 h-4 text-red-500 shrink-0" />
                              <span>{med.name}</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Frequency: {med.frequency} • Duration: {med.duration}</p>
                          </div>
                          <span className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            {med.dosage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scanResult.diagnosesOrNotes && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Doctor Diagnosis & Notes</span>
                    <p className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                      {scanResult.diagnosesOrNotes}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/30 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-slate-500 leading-relaxed">
                    <strong>AI Scan Notice:</strong> This digital prescription represents an algorithmic transcription processed by Gemini OCR. Patients must verify all medical parameters directly against the doctor's hand-written physical copy before consuming any medications.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                <span>Source: JeevanSetu OCR Engine</span>
                <span>Verified 2026</span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/20">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200">No scanned results</p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">Upload and scan a prescription image to generate a digitally structured health card layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
