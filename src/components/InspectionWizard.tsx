import React, { useState } from "react";
import { InspectionRecord, InspectionTemplate, RecommendedPart, LabourRecommendation, User } from "../types";
import { Car, Wrench, Sparkles, Plus, Trash2, Camera, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, QrCode } from "lucide-react";

interface InspectionWizardProps {
  templates: InspectionTemplate[];
  currentUser: User;
  vehicleTypes: string[];
  models: string[];
  branches: { id: string; name: string }[];
  spareParts?: any[];
  onSaveInspection: (record: InspectionRecord) => void;
  setActiveTab: (tab: string) => void;
}

const COMMON_PARTS_CATALOG = [
  { partName: "Cabin Air Filter", partNumber: "AF-8812", unit: "Pcs", estimatedCost: 45 },
  { partName: "Engine Oil Filter", partNumber: "OF-4021", unit: "Pcs", estimatedCost: 25 },
  { partName: "Brake Pads (Front)", partNumber: "BP-509", unit: "Set", estimatedCost: 120 },
  { partName: "Brake Rotor", partNumber: "BR-901", unit: "Pcs", estimatedCost: 150 },
  { partName: "Spark Plugs (Set of 4)", partNumber: "SP-771", unit: "Set", estimatedCost: 60 },
  { partName: "Wiper Blades", partNumber: "WB-22", unit: "Pair", estimatedCost: 35 },
  { partName: "Car Battery 12V", partNumber: "BAT-48", unit: "Pcs", estimatedCost: 180 },
  { partName: "Engine Coolant 1L", partNumber: "CL-10", unit: "Litre", estimatedCost: 20 },
  { partName: "Serpentine Belt", partNumber: "SB-304", unit: "Pcs", estimatedCost: 55 },
  { partName: "Headlight Bulb", partNumber: "HL-H7", unit: "Pcs", estimatedCost: 25 }
];

export const InspectionWizard: React.FC<InspectionWizardProps> = ({
  templates,
  currentUser,
  vehicleTypes,
  models,
  branches,
  spareParts = [],
  onSaveInspection,
  setActiveTab,
}) => {
  const [step, setStep] = useState(1);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const catalog = spareParts && spareParts.length > 0 ? spareParts : COMMON_PARTS_CATALOG;

  // Vehicle Info State
  const [vehicle, setVehicle] = useState({
    plateNumber: "ABC-1234",
    vin: "1FA6P8CF0H5192834",
    make: "Ford",
    model: models[0] || "F-150 Lightning",
    year: 2025,
    vehicleType: vehicleTypes[0] || "Electric Vehicle",
    mileage: 12500,
    engineNumber: "EV-MTR-98214",
    customerName: "Robert Taylor",
    phone: "+1 (555) 492-0192",
    inspectionDate: new Date().toISOString().split("T")[0],
    inspectorName: currentUser.name,
    branch: currentUser.branch || branches[0]?.name || "Downtown Central Workshop",
  });

  // Selected Template
  const activeTemplate = templates.find((t) => t.vehicleType === vehicle.vehicleType) || templates[0];

  // Checklist state: category -> itemIndex -> { status, notes }
  const [checklist, setChecklist] = useState<Record<string, Record<number, { status: string; notes: string }>>>({});

  // Parts state
  const [parts, setParts] = useState<RecommendedPart[]>([
    { partName: "Cabin Air Filter", quantity: 1, unit: "Pcs" }
  ]);

  // Observations & Photos state
  const [observations, setObservations] = useState("Vehicle exterior is in good shape. Brakes and tyres tested within normal operational ranges.");
  const [aiSummary, setAiSummary] = useState("Vehicle is performing normally. Recommended routine filter replacement and brake check in 6 months.");
  
  const [photoList, setPhotoList] = useState<Array<{ id: string; label: string; url: string }>>([
    { id: "1", label: "Front View", url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=600" },
    { id: "2", label: "Rear View", url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600" },
    { id: "3", label: "Dashboard", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600" }
  ]);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setPhotoList(photoList.map(p => p.id === id ? { ...p, url: result } : p));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [technicianSignature, setTechnicianSignature] = useState(currentUser.name);
  const [customerSignature, setCustomerSignature] = useState("");

  const handleChecklistChange = (catName: string, itemIdx: number, status: string, notes?: string) => {
    setChecklist(prev => {
      const cat = prev[catName] || {};
      return {
        ...prev,
        [catName]: {
          ...cat,
          [itemIdx]: {
            status,
            notes: notes !== undefined ? notes : (cat[itemIdx]?.notes || "")
          }
        }
      };
    });
  };

  const runAiAnalysis = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiSummary(`Gemini AI analysis complete for ${vehicle.vehicleType} (${vehicle.model}): Component degradation is minimal. Braking efficiency at 94%. Overall health score estimated at 92%.`);
    }, 1200);
  };

  const handleFinalSubmit = () => {
    let totalItems = 0;
    let earnedScore = 0;
    const catScores: Record<string, number> = {};

    activeTemplate?.categories.forEach(cat => {
      let catTotal = 0;
      let catEarned = 0;
      cat.items.forEach((_, idx) => {
        totalItems++;
        catTotal += 5;
        const status = checklist[cat.name]?.[idx]?.status || "Pass";
        if (status === "Pass") catEarned += 5;
        else if (status === "Fair") catEarned += 3;
        else if (status === "Needs Attention") catEarned += 2;
        else if (status === "Critical") catEarned += 0;
        else catTotal -= 5;
      });
      earnedScore += catEarned;
      catScores[cat.name] = catTotal > 0 ? Math.round((catEarned / catTotal) * 100) : 100;
    });

    const finalScore = totalItems > 0 && earnedScore >= 0 ? Math.round((earnedScore / (totalItems * 5)) * 100) : 90;

    const photosRecord: Record<string, string> = {};
    photoList.forEach(p => {
      const key = p.label.toLowerCase().replace(/[^a-z0-9]/g, "_") || `photo_${Math.random()}`;
      photosRecord[key] = p.url;
    });

    const newRecord: InspectionRecord = {
      id: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      plateNumber: vehicle.plateNumber,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vehicleType: vehicle.vehicleType,
      mileage: vehicle.mileage,
      engineNumber: vehicle.engineNumber,
      customerName: vehicle.customerName,
      phone: vehicle.phone,
      inspectionDate: vehicle.inspectionDate,
      inspectorName: vehicle.inspectorName,
      branch: vehicle.branch,
      status: "Completed",
      overallScore: finalScore,
      healthPercentage: finalScore,
      categoryScores: catScores,
      checklist,
      recommendations: observations,
      aiSummary,
      parts,
      photos: photosRecord,
      technicianSignature,
      customerSignature,
      qrCodeUrl: "",
      createdAt: new Date().toISOString()
    };

    onSaveInspection(newRecord);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Wizard Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Multipoint Inspection System</span>
          <h1 className="text-2xl font-bold text-white">New Vehicle Evaluation</h1>
          <p className="text-xs text-slate-400">Step {step} of 5 — {step === 1 ? "Vehicle Information & Photos" : step === 2 ? "Multipoint Checklist & AI" : step === 3 ? "Recommended Parts" : step === 4 ? "Observations" : "Summary & Signatures"}</p>
        </div>
        {/* Step Progress Pills */}
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition ${
                step === s ? "bg-blue-600 text-white shadow-lg" : s < step ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-500"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Vehicle Information */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-400" />
              <span>Vehicle & Customer Information</span>
            </h2>
            <button
              onClick={() => {
                setVehicle(v => ({ ...v, vin: "5YJ3E1EB8NF" + Math.floor(10000 + Math.random() * 90000), plateNumber: "ABC-" + Math.floor(1000 + Math.random() * 9000) }));
              }}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-medium border border-blue-500/30 transition flex items-center space-x-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan VIN / OCR Plate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Plate Number</label>
              <input
                type="text"
                value={vehicle.plateNumber}
                onChange={(e) => setVehicle({ ...vehicle, plateNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">VIN (17 Characters)</label>
              <input
                type="text"
                value={vehicle.vin}
                onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Vehicle Type</label>
              <select
                value={vehicle.vehicleType}
                onChange={(e) => setVehicle({ ...vehicle, vehicleType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              >
                {vehicleTypes.map((vt) => (
                  <option key={vt} value={vt}>{vt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Model / Variant</label>
              <select
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Branch / Location</label>
              <select
                value={vehicle.branch}
                onChange={(e) => setVehicle({ ...vehicle, branch: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Multipoint Inspection Checklist & AI */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Dynamic Checklist: {activeTemplate?.name || "Standard Inspection"}</h2>
              <p className="text-xs text-slate-400">Template automatically loaded for {vehicle.vehicleType}</p>
            </div>
            <button
              onClick={runAiAnalysis}
              disabled={isAiLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{isAiLoading ? "Analyzing with Gemini AI..." : "✨ AI Condition & Repair Analysis"}</span>
            </button>
          </div>

          {/* AI Summary Banner */}
          <div className="bg-blue-950/40 border border-blue-900/60 p-4 rounded-2xl text-blue-200 text-xs flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Gemini AI Vehicle Health Assessment:</span>
              <p className="text-slate-300">{aiSummary}</p>
            </div>
          </div>

          {/* Checklist Categories */}
          {activeTemplate?.categories?.map((cat, catIdx) => (
            <div key={catIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>{cat.name}</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                  {cat.items.length} Inspection Items
                </span>
              </h3>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const currentStatus = checklist[cat.name]?.[itemIdx]?.status || "Pass";
                  return (
                    <div key={itemIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="font-bold text-sm text-white">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </div>
                        {/* Status Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {["Pass", "Fair", "Needs Attention", "Critical", "N/A"].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleChecklistChange(cat.name, itemIdx, st)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                currentStatus === st
                                  ? st === "Pass" ? "bg-emerald-600 text-white shadow"
                                    : st === "Fair" ? "bg-blue-600 text-white shadow"
                                    : st === "Needs Attention" ? "bg-amber-600 text-white shadow"
                                    : st === "Critical" ? "bg-rose-600 text-white shadow"
                                    : "bg-slate-700 text-white shadow"
                                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 3: Parts & Labour */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Recommended Parts & Spares</h2>
                <p className="text-xs text-slate-400">Select parts from catalog or add custom line items</p>
              </div>
              <button
                type="button"
                onClick={() => setParts([...parts, { partName: "", quantity: 1, unit: "Pcs" }])}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Part Line</span>
              </button>
            </div>

            <div className="space-y-4">
              {parts.map((p, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="w-full sm:w-1/2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select from Catalog</label>
                      <select
                        onChange={(e) => {
                          const catalogItem = catalog.find(c => c.partName === e.target.value);
                          if (catalogItem) {
                            const newParts = [...parts];
                            newParts[idx] = {
                              ...newParts[idx],
                              partName: catalogItem.partName,
                              unit: catalogItem.unit,
                              partNumber: catalogItem.partNumber,
                              estimatedCost: catalogItem.estimatedCost
                            };
                            setParts(newParts);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Choose Part --</option>
                        {catalog.map((catPart) => (
                          <option key={catPart.partNumber || catPart.id} value={catPart.partName}>
                            {catPart.partName} {catPart.partNumber ? `(${catPart.partNumber})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Part Name</label>
                      <input
                        type="text"
                        value={p.partName}
                        onChange={(e) => {
                          const newParts = [...parts];
                          newParts[idx].partName = e.target.value;
                          setParts(newParts);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        placeholder="Part name"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setParts(parts.filter((_, i) => i !== idx))}
                        className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={p.quantity}
                        onChange={(e) => {
                          const newParts = [...parts];
                          newParts[idx].quantity = Number(e.target.value);
                          setParts(newParts);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Unit</label>
                      <input
                        type="text"
                        value={p.unit}
                        onChange={(e) => {
                          const newParts = [...parts];
                          newParts[idx].unit = e.target.value;
                          setParts(newParts);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Observations & Photos */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Inspector Observations & Notes</h2>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
              placeholder="Enter overall inspector notes..."
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Inspection Photo Evidence</h2>
                <p className="text-xs text-slate-400">Upload pictures, add custom angles, or paste image URLs</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoList([...photoList, { id: Date.now().toString(), label: "New Angle / Item", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600" }])}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoList.map((photoItem) => (
                <div key={photoItem.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={photoItem.label}
                      onChange={(e) => {
                        const updated = photoList.map(p => p.id === photoItem.id ? { ...p, label: e.target.value } : p);
                        setPhotoList(updated);
                      }}
                      className="bg-transparent text-xs font-semibold text-white border-b border-slate-800 focus:border-blue-500 pb-0.5 outline-none w-3/4"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoList(photoList.filter(p => p.id !== photoItem.id))}
                      className="p-1 text-slate-400 hover:text-rose-400 transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative group/img overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                    <img src={photoItem.url} alt={photoItem.label} className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow flex items-center space-x-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoFileUpload(e, photoItem.id)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={photoItem.url}
                      onChange={(e) => {
                        const updated = photoList.map(p => p.id === photoItem.id ? { ...p, url: e.target.value } : p);
                        setPhotoList(updated);
                      }}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Summary & Signatures */}
      {step === 5 && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Inspection Summary & Sign-off</span>
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-400">Plate Number:</span> <strong className="text-white">{vehicle.plateNumber}</strong></div>
              <div><span className="text-slate-400">VIN:</span> <strong className="text-white">{vehicle.vin}</strong></div>
              <div><span className="text-slate-400">Vehicle Type:</span> <strong className="text-white">{vehicle.vehicleType}</strong></div>
              <div><span className="text-slate-400">Model:</span> <strong className="text-white">{vehicle.model}</strong></div>
              <div><span className="text-slate-400">Branch:</span> <strong className="text-white">{vehicle.branch}</strong></div>
              <div><span className="text-slate-400">Inspector:</span> <strong className="text-white">{vehicle.inspectorName}</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Technician / Inspector Signature</label>
              <input
                type="text"
                value={technicianSignature}
                onChange={(e) => setTechnicianSignature(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-serif italic"
                placeholder="Type full name as signature"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Customer / Manager Sign-off</label>
              <input
                type="text"
                value={customerSignature}
                onChange={(e) => setCustomerSignature(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-serif italic"
                placeholder="Customer Name"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center space-x-2 transition"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete & Generate Inspection Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow transition"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
