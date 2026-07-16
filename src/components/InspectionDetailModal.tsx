import React from "react";
import { InspectionRecord } from "../types";
import { ArrowLeft, Printer, FileText, QrCode, Wrench, CheckCircle2, ShieldCheck, Mail, Share2 } from "lucide-react";

interface InspectionDetailModalProps {
  inspection: InspectionRecord;
  onBack: () => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({ inspection, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const exportWord = () => {
    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Inspection Report ${inspection.id}</title><meta charset='utf-8'></head>
      <body>
        <h1>Vehicle Condition Report: ${inspection.id}</h1>
        <p><strong>Plate:</strong> ${inspection.plateNumber} | <strong>VIN:</strong> ${inspection.vin}</p>
        <p><strong>Vehicle:</strong> ${inspection.year} ${inspection.make} ${inspection.model} (${inspection.vehicleType})</p>
        <p><strong>Customer:</strong> ${inspection.customerName} (${inspection.phone})</p>
        <p><strong>Overall Score:</strong> ${inspection.overallScore}% (${inspection.status})</p>
        <h2>AI Summary</h2>
        <p>${inspection.aiSummary}</p>
        <h2>Recommended Parts</h2>
        <ul>
          ${(inspection.parts || []).map(p => `<li>${p.partName} - Qty: ${p.quantity} ${p.unit}</li>`).join("")}
        </ul>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspection_${inspection.id}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportWord}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Export Word</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30 font-mono font-bold">
                {inspection.id}
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                {inspection.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">Vehicle Condition Report</h1>
            <p className="text-xs text-slate-400">Inspection Date: {inspection.inspectionDate} | Branch: {inspection.branch}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-3xl font-extrabold text-white">{inspection.overallScore}%</div>
              <div className="text-xs text-slate-400 font-medium">Overall Health Score</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <img
                src={inspection.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${inspection.id}`}
                alt="QR Code"
                className="w-16 h-16"
              />
            </div>
          </div>
        </div>

        {/* Vehicle & Customer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div className="space-y-2">
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Vehicle Details</div>
            <div className="text-base font-bold text-white">{inspection.year} {inspection.make} {inspection.model}</div>
            <div className="text-xs text-slate-300">Vehicle Type: <span className="text-white font-medium">{inspection.vehicleType}</span></div>
            <div className="text-xs text-slate-300">Plate Number: <span className="font-mono text-blue-400 font-bold">{inspection.plateNumber}</span></div>
            <div className="text-xs text-slate-300">VIN: <span className="font-mono text-slate-400">{inspection.vin}</span></div>
            <div className="text-xs text-slate-300">Mileage: <span className="text-white">{inspection.mileage?.toLocaleString()} miles</span></div>
            <div className="text-xs text-slate-300">Engine No: <span className="font-mono text-slate-400">{inspection.engineNumber}</span></div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Customer & Inspector</div>
            <div className="text-sm font-bold text-white">{inspection.customerName}</div>
            <div className="text-xs text-slate-300">Phone: {inspection.phone}</div>
            <div className="text-xs text-slate-300">Inspector: <span className="text-white font-medium">{inspection.inspectorName}</span></div>
            <div className="text-xs text-slate-300">Workshop Branch: {inspection.branch}</div>
          </div>
        </div>

        {/* AI Summary */}
        {inspection.aiSummary && (
          <div className="bg-blue-950/30 border border-blue-900/50 p-5 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Condition Assessment & Summary</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{inspection.aiSummary}</p>
          </div>
        )}

        {/* Category Scores */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">Category Breakdown Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inspection.categoryScores && Object.entries(inspection.categoryScores).map(([cat, score]: [string, any]) => (
              <div key={cat} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{cat}</span>
                <span className="font-bold text-white text-sm bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Parts */}
        {inspection.parts && inspection.parts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Recommended Parts</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Part Name</th>
                    <th className="py-3 px-4">Quantity & Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {inspection.parts.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-medium text-white">{p.partName}</td>
                      <td className="py-3 px-4 text-slate-300">{p.quantity} {p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Observations */}
        {inspection.recommendations && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">General Observations & Advice</div>
            <p className="text-sm text-slate-300">{inspection.recommendations}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div>
            <div className="text-xs text-slate-400 mb-1">Technician Signature</div>
            <div className="font-serif italic text-blue-400 font-bold text-base">{inspection.technicianSignature || "Verified"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Customer Approval Signature</div>
            <div className="font-serif italic text-emerald-400 font-bold text-base">{inspection.customerSignature || "Approved"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
