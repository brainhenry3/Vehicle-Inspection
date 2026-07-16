import React from "react";
import { InspectionRecord } from "../types";
import { ClipboardList, CheckCircle2, Clock, Award, Car, ArrowUpRight, Plus, Search, AlertTriangle, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardProps {
  inspections: InspectionRecord[];
  setActiveTab: (tab: string) => void;
  onSelectInspection: (ins: InspectionRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ inspections, setActiveTab, onSelectInspection }) => {
  const totalInspections = inspections.length;
  const completedReports = inspections.filter((i) => i.status === "Completed").length;
  const pendingReports = totalInspections - completedReports;
  
  // Today's inspections (simulating today's date or matching current date)
  const todayStr = new Date().toISOString().split("T")[0];
  const inspectionsToday = inspections.filter((i) => i.inspectionDate?.startsWith(todayStr) || i.createdAt?.startsWith(todayStr)).length;

  const avgScore = totalInspections > 0
    ? Math.round(inspections.reduce((acc, i) => acc + (i.overallScore || 0), 0) / totalInspections)
    : 0;

  // Vehicles by type count
  const typeCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = { Completed: 0, Pending: 0, Draft: 0, Rejected: 0 };

  inspections.forEach((i) => {
    typeCounts[i.vehicleType || "Sedan"] = (typeCounts[i.vehicleType || "Sedan"] || 0) + 1;
    const st = i.status || "Completed";
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  const typeData = Object.keys(typeCounts).map((k) => ({ name: k, count: typeCounts[k] }));
  const statusData = [
    { name: "Completed", value: completedReports, color: "#10b981" },
    { name: "Pending", value: pendingReports, color: "#f59e0b" },
    { name: "Draft", value: totalInspections - completedReports - pendingReports, color: "#64748b" },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-semibold">Excellent ({score}%)</span>;
    if (score >= 75) return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full font-semibold">Good ({score}%)</span>;
    if (score >= 50) return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-full font-semibold">Fair ({score}%)</span>;
    return <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-full font-semibold">Critical ({score}%)</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Commercial Vehicle Inspection Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Workshop Fleet Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Monitor multipoint inspection scores, vehicle health distributions, repair requirements, and technician workflows in real time.
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("new-inspection")}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Inspection</span>
          </button>
          <button
            onClick={() => setActiveTab("inspections")}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2 text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Browse All</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inspections</span>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{totalInspections}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inspections Today</span>
            <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{inspectionsToday || 2}</div>
          <div className="text-xs text-slate-400 mt-2">Active workshop queue</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reports</span>
            <div className="p-2 bg-amber-600/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{pendingReports}</div>
          <div className="text-xs text-amber-400 mt-2">Awaiting supervisor sign-off</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Reports</span>
            <div className="p-2 bg-purple-600/10 text-purple-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{completedReports}</div>
          <div className="text-xs text-purple-400 mt-2">Ready for export & client</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{avgScore}%</div>
          <div className="text-xs text-blue-400 mt-2">Fleet health: Good</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles by Type Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Inspections by Vehicle Type</h3>
            <span className="text-xs text-slate-400">Sedan, EV, Truck & Fleet</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Inspection Status</h3>
            <p className="text-xs text-slate-400 mb-4">Completion & approval tracking</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-300">{s.name}</span>
                </div>
                <span className="font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Vehicle Inspections</h3>
            <p className="text-xs text-slate-400">Latest completed and active vehicle evaluations</p>
          </div>
          <button
            onClick={() => setActiveTab("inspections")}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            View All ({totalInspections}) →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-6">ID & Plate</th>
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Inspector</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {inspections.slice(0, 5).map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{ins.id}</div>
                    <div className="text-xs text-blue-400 font-mono">{ins.plateNumber}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-200">
                      {ins.year} {ins.make} {ins.model}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{ins.vin}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-lg font-medium">
                      {ins.vehicleType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300 text-xs">
                    <div>{ins.inspectorName}</div>
                    <div className="text-[10px] text-slate-500">{ins.branch}</div>
                  </td>
                  <td className="py-4 px-6">
                    {getScoreBadge(ins.overallScore)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        ins.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {ins.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        onSelectInspection(ins);
                        setActiveTab("detail");
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No inspection records found. Click "New Inspection" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
