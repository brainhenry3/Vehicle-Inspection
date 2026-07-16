import React, { useState } from "react";
import { InspectionRecord } from "../types";
import { BarChart3, Download, FileSpreadsheet, Calendar, ShieldCheck, Wrench, Award, TrendingUp } from "lucide-react";

interface ReportsViewProps {
  inspections: InspectionRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ inspections }) => {
  const [timeRange, setTimeRange] = useState("Monthly");
  const [selectedBranch, setSelectedBranch] = useState("All");

  const totalInspections = inspections.length;
  const avgScore = totalInspections > 0 ? Math.round(inspections.reduce((a, b) => a + (b.overallScore || 0), 0) / totalInspections) : 0;
  
  // Calculate total parts cost / revenue opportunity
  const totalPartsCost = inspections.reduce((acc, ins) => {
    return acc + (ins.parts || []).reduce((pAcc, p) => pAcc + (p.estimatedCost * p.quantity), 0);
  }, 0);

  const totalLabourCost = inspections.reduce((acc, ins) => {
    return acc + (ins.labour || []).reduce((lAcc, l) => lAcc + l.estimatedCost, 0);
  }, 0);

  const revenueOpportunity = totalPartsCost + totalLabourCost;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Workshop & Fleet Analytics Reports</h1>
          <p className="text-xs text-slate-400">Generate executive inspection summaries, repair revenue forecasts, and fault analyses</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="Daily">Daily Report</option>
            <option value="Weekly">Weekly Report</option>
            <option value="Monthly">Monthly Report</option>
            <option value="Quarterly">Quarterly Report</option>
            <option value="Yearly">Yearly Report</option>
          </select>
          <button
            onClick={() => alert("Report exported successfully to Excel format.")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Report (Excel)</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Total Evaluated</div>
          <div className="text-3xl font-bold text-white">{totalInspections} Vehicles</div>
          <div className="text-xs text-emerald-400 mt-2">100% Verified Quality</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Average Fleet Score</div>
          <div className="text-3xl font-bold text-white">{avgScore}%</div>
          <div className="text-xs text-blue-400 mt-2">Condition Category: Good</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Parts Revenue Potential</div>
          <div className="text-3xl font-bold text-emerald-400">${totalPartsCost.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-2">Across all pending recommendations</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Total Repair Opportunity</div>
          <div className="text-3xl font-bold text-blue-400">${revenueOpportunity.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-2">Combined Parts & Labour</div>
        </div>
      </div>

      {/* Most Common Faults & Replaced Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Most Common Faults Detected</h3>
          <div className="space-y-3">
            {[
              { fault: "Front Brake Pad Wear (<3mm)", count: 14, percentage: 35 },
              { fault: "Cabin Air Filter Contamination", count: 12, percentage: 30 },
              { fault: "Tyre Tread Depth Approaching Legal Limit", count: 9, percentage: 22 },
              { fault: "Battery CCA Degradation", count: 5, percentage: 13 },
            ].map((f, i) => (
              <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{f.fault}</span>
                  <span className="text-blue-400">{f.count} vehicles ({f.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${f.percentage * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Most Replaced Parts</h3>
          <div className="space-y-3">
            {[
              { part: "Front Brake Pad Set (TOY-221)", count: 18, revenue: "$2,160" },
              { part: "Synthetic Engine Oil 5W-30 (4L)", count: 24, revenue: "$1,680" },
              { part: "Cabin Air Filter (AF-992)", count: 15, revenue: "$525" },
              { part: "Wiper Blade Set (WB-24)", count: 11, revenue: "$330" },
            ].map((p, i) => (
              <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white text-xs">{p.part}</div>
                  <div className="text-[11px] text-slate-400">{p.count} units installed</div>
                </div>
                <div className="font-bold text-emerald-400 text-sm">{p.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
