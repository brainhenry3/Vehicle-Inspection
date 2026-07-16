import React, { useState } from "react";
import { InspectionRecord } from "../types";
import { Search, Filter, FileSpreadsheet, FileText, Printer, Eye, Trash2, PlusCircle, Download } from "lucide-react";

interface InspectionsListProps {
  inspections: InspectionRecord[];
  setActiveTab: (tab: string) => void;
  onSelectInspection: (ins: InspectionRecord) => void;
  onDeleteInspection: (id: string) => void;
}

export const InspectionsList: React.FC<InspectionsListProps> = ({
  inspections,
  setActiveTab,
  onSelectInspection,
  onDeleteInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");

  const branches = Array.from(new Set(inspections.map((i) => i.branch).filter(Boolean)));
  const types = Array.from(new Set(inspections.map((i) => i.vehicleType).filter(Boolean)));

  const filteredInspections = inspections.filter((ins) => {
    const matchSearch =
      searchTerm === "" ||
      ins.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === "All" || ins.vehicleType === filterType;
    const matchStatus = filterStatus === "All" || ins.status === filterStatus;
    const matchBranch = filterBranch === "All" || ins.branch === filterBranch;

    return matchSearch && matchType && matchStatus && matchBranch;
  });

  const exportCSV = () => {
    const headers = ["ID", "Plate Number", "VIN", "Vehicle", "Type", "Mileage", "Customer", "Inspector", "Branch", "Score", "Status", "Date"];
    const rows = filteredInspections.map((i) => [
      i.id,
      i.plateNumber,
      i.vin,
      `"${i.year} ${i.make} ${i.model}"`,
      i.vehicleType,
      i.mileage,
      `"${i.customerName}"`,
      `"${i.inspectorName}"`,
      `"${i.branch}"`,
      `${i.overallScore}%`,
      i.status,
      i.inspectionDate,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vehicle_inspections_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcelMultiSheet = () => {
    // Generate multi-sheet XML/HTML Excel format
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><title>AutoInspect Pro Report</title></head>
      <body>
        <h3>Sheet 1: Vehicle Details</h3>
        <table border="1">
          <tr><th>ID</th><th>Plate</th><th>VIN</th><th>Make</th><th>Model</th><th>Year</th><th>Type</th><th>Mileage</th><th>Customer</th><th>Score</th><th>Status</th></tr>
          ${filteredInspections.map(i => `
            <tr>
              <td>${i.id}</td><td>${i.plateNumber}</td><td>${i.vin}</td><td>${i.make}</td><td>${i.model}</td><td>${i.year}</td><td>${i.vehicleType}</td><td>${i.mileage}</td><td>${i.customerName}</td><td>${i.overallScore}%</td><td>${i.status}</td>
            </tr>
          `).join("")}
        </table>
        
        <h3>Sheet 2: Recommended Parts</h3>
        <table border="1">
          <tr><th>Inspection ID</th><th>Part Name</th><th>Part Number</th><th>Qty</th><th>Unit</th><th>Cost</th><th>Priority</th></tr>
          ${filteredInspections.flatMap(i => (i.parts || []).map((p: any) => `
            <tr><td>${i.id}</td><td>${p.partName}</td><td>${p.partNumber}</td><td>${p.quantity}</td><td>${p.unit}</td><td>$${p.estimatedCost}</td><td>${p.priority}</td></tr>
          `)).join("")}
        </table>

        <h3>Sheet 3: Labour & Repairs</h3>
        <table border="1">
          <tr><th>Inspection ID</th><th>Repair Description</th><th>Est Hours</th><th>Est Cost</th><th>Priority</th></tr>
          ${filteredInspections.flatMap(i => (i.labour || []).map((l: any) => `
            <tr><td>${i.id}</td><td>${l.repairDescription}</td><td>${l.estimatedHours}h</td><td>$${l.estimatedCost}</td><td>${l.priority}</td></tr>
          `)).join("")}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AutoInspect_MultiSheet_Report_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-white">Inspection Records</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage, filter, search, and export vehicle inspection reports</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportExcelMultiSheet}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Excel Multi-Sheet</span>
          </button>
          <button
            onClick={() => setActiveTab("new-inspection")}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow flex items-center justify-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by plate, VIN, customer, ID, inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Vehicle Type Filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Vehicle Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-6">Inspection ID / Plate</th>
                <th className="py-3 px-6">Vehicle (Make / Model)</th>
                <th className="py-3 px-6">Customer & Phone</th>
                <th className="py-3 px-6">Inspector / Branch</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredInspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{ins.id}</div>
                    <div className="text-xs text-blue-400 font-mono bg-blue-500/10 inline-block px-2 py-0.5 rounded mt-0.5 border border-blue-500/20">
                      {ins.plateNumber}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-200">
                      {ins.year} {ins.make} {ins.model}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{ins.vin}</div>
                    <div className="text-[11px] text-slate-500">{ins.mileage?.toLocaleString()} miles • {ins.vehicleType}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="font-medium">{ins.customerName}</div>
                    <div className="text-xs text-slate-400">{ins.phone}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="text-xs font-medium">{ins.inspectorName}</div>
                    <div className="text-[10px] text-slate-500">{ins.branch}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{ins.overallScore}%</div>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ins.overallScore >= 80 ? "bg-emerald-500" : ins.overallScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${ins.overallScore}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        ins.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : ins.status === "Pending Approval"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      {ins.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        onSelectInspection(ins);
                        setActiveTab("detail");
                      }}
                      className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteInspection(ins.id)}
                      className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    No matching inspection records found.
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
