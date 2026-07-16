import React, { useState } from "react";
import { User, Branch, UserRole, SparePart } from "../types";
import { Settings, Users, Building, ShieldCheck, Database, Download, Upload, Plus, Trash2, Wrench, FileSpreadsheet, Search } from "lucide-react";

interface AdminSettingsProps {
  users: User[];
  branches: Branch[];
  vehicleTypes: string[];
  models: string[];
  spareParts: SparePart[];
  onAddUser: (user: User) => void;
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch?: (branch: Branch) => void;
  onDeleteBranch?: (id: string) => void;
  onAddVehicleType: (name: string) => void;
  onDeleteVehicleType: (index: number) => void;
  onAddModel: (name: string) => void;
  onDeleteModel: (index: number) => void;
  onAddSparePart: (part: Omit<SparePart, "id">) => void;
  onUpdateSparePart?: (part: SparePart) => void;
  onDeleteSparePart?: (id: string) => void;
  onBulkUploadSpareParts?: (parts: Omit<SparePart, "id">[]) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  users,
  branches,
  vehicleTypes,
  models,
  spareParts = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddVehicleType,
  onDeleteVehicleType,
  onAddModel,
  onDeleteModel,
  onAddSparePart,
  onUpdateSparePart,
  onDeleteSparePart,
  onBulkUploadSpareParts,
}) => {
  const [activeTab, setActiveTab] = useState("users");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Inspector" as UserRole, branch: branches[0]?.name || "Downtown" });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<UserRole>("Inspector");
  const [editUserBranch, setEditUserBranch] = useState("");
  const [newBranch, setNewBranch] = useState({ name: "", city: "" });
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState("");
  const [editBranchCity, setEditBranchCity] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("");
  const [newModel, setNewModel] = useState("");

  // Spare Parts States
  const [newPart, setNewPart] = useState({ partName: "", partNumber: "", unit: "Pcs", estimatedCost: 0 });
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState("");
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editPartUnit, setEditPartUnit] = useState("Pcs");
  const [editPartCost, setEditPartCost] = useState(0);

  // Bulk Upload UI States
  const [isBulkUploadMode, setIsBulkUploadMode] = useState(false);
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkPreview, setBulkPreview] = useState<Omit<SparePart, "id">[]>([]);
  const [partsSearchQuery, setPartsSearchQuery] = useState("");

  const handleCreateSparePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.partName.trim() || !newPart.partNumber.trim()) return;
    onAddSparePart({
      partName: newPart.partName.trim(),
      partNumber: newPart.partNumber.trim(),
      unit: newPart.unit,
      estimatedCost: Number(newPart.estimatedCost) || 0
    });
    setNewPart({ partName: "", partNumber: "", unit: "Pcs", estimatedCost: 0 });
  };

  const handleSaveEditPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPartName.trim() || !editPartNumber.trim() || !editingPartId) return;
    if (onUpdateSparePart) {
      onUpdateSparePart({
        id: editingPartId,
        partName: editPartName.trim(),
        partNumber: editPartNumber.trim(),
        unit: editPartUnit,
        estimatedCost: Number(editPartCost) || 0
      });
    }
    setEditingPartId(null);
  };

  const handleEditPartClick = (part: SparePart) => {
    setEditingPartId(part.id);
    setEditPartName(part.partName);
    setEditPartNumber(part.partNumber);
    setEditPartUnit(part.unit);
    setEditPartCost(part.estimatedCost);
  };

  const handleParseBulkData = (text: string) => {
    try {
      const trimmed = text.trim();
      if (!trimmed) {
        setBulkPreview([]);
        setBulkError("Input is empty.");
        return;
      }

      // Try parsing as JSON first
      if (trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const valid: Omit<SparePart, "id">[] = parsed
            .filter((p: any) => p && (p.partName || p.part_name))
            .map((p: any) => ({
              partName: String(p.partName || p.part_name || "").trim(),
              partNumber: String(p.partNumber || p.part_number || "").trim() || `PN-${Math.floor(100000 + Math.random() * 900000)}`,
              unit: String(p.unit || "Pcs").trim(),
              estimatedCost: Number(p.estimatedCost || p.estimated_cost) || 0
            }));
          setBulkPreview(valid);
          setBulkError("");
          return;
        }
      }

      // Fallback: parse as CSV/TSV
      const lines = trimmed.split(/\r?\n/);
      const parsedParts: Omit<SparePart, "id">[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip truly empty lines or lines with only commas, tabs, or spaces
        if (!line || line.replace(/[,;\t\s]/g, "") === "") continue;

        // Detect and skip header row
        const lowerLine = line.toLowerCase();
        if (i === 0 && (lowerLine.includes("part") || lowerLine.includes("name") || lowerLine.includes("number") || lowerLine.includes("cost"))) {
          continue;
        }

        const delimiter = line.includes("\t") ? "\t" : ",";
        const columns = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ""));
        
        if (columns.length >= 1) {
          const partName = columns[0];
          // If partNumber is empty or missing, auto-generate one
          const partNumber = columns[1] || `PN-${Math.floor(100000 + Math.random() * 900000)}`;
          const unit = columns[2] || "Pcs";
          const estimatedCost = Number(columns[3]) || 0;

          if (partName) {
            parsedParts.push({ partName, partNumber, unit, estimatedCost });
          }
        }
      }

      if (parsedParts.length === 0) {
        setBulkError("Could not parse any valid rows. Please check that each row has 'Part Name' and 'Part Number' separated by commas or tabs.");
        setBulkPreview([]);
      } else {
        setBulkPreview(parsedParts);
        setBulkError("");
      }
    } catch (e: any) {
      setBulkError(`Error parsing input data: ${e.message}`);
      setBulkPreview([]);
    }
  };

  const handleBulkFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkTextInput(text);
      handleParseBulkData(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkUpload = () => {
    if (bulkPreview.length === 0) return;
    if (onBulkUploadSpareParts) {
      onBulkUploadSpareParts(bulkPreview);
    }
    setBulkTextInput("");
    setBulkPreview([]);
    setBulkError("");
    setIsBulkUploadMode(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    onAddUser({
      id: `usr-${Date.now()}`,
      ...newUser,
    });
    setNewUser({ name: "", email: "", role: "Inspector", branch: branches[0]?.name || "Downtown" });
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.city) return;
    onAddBranch({
      id: `br-${Date.now()}`,
      ...newBranch,
    });
    setNewBranch({ name: "", city: "" });
  };

  const handleCreateVehicleType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleType.trim()) return;
    onAddVehicleType(newVehicleType.trim());
    setNewVehicleType("");
  };

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim()) return;
    onAddModel(newModel.trim());
    setNewModel("");
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
          <p className="text-xs text-slate-400">Manage user roles, workshop branches, vehicle types, models, and system configuration</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "users" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("branches")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "branches" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Branches
          </button>
          <button
            onClick={() => setActiveTab("vehicle-types")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "vehicle-types" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Vehicle Types
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "models" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Models / Variants
          </button>
          <button
            onClick={() => {
              setActiveTab("spare-parts");
              setIsBulkUploadMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "spare-parts" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Spare Parts
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === "database" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Database
          </button>
        </div>
      </div>

      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Alex Mercer"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="alex@autoinspect.pro"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Inspector">Inspector / Technician</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Branch</label>
                <select
                  value={newUser.branch}
                  onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium shadow transition mt-2"
              >
                Create User
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">System Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Name & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Branch</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {users.map((u) => {
                    const isEditing = editingUserId === u.id;
                    const isSuspended = u.status === "Suspended";
                    return (
                      <tr key={u.id} className={isSuspended ? "opacity-60 bg-slate-950/40" : ""}>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                placeholder="Name"
                              />
                              <input
                                type="email"
                                value={editUserEmail}
                                onChange={(e) => setEditUserEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                placeholder="Email"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-white flex items-center space-x-2">
                                <span>{u.name}</span>
                                {isSuspended && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                                    Suspended
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400">{u.email}</div>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <select
                              value={editUserRole}
                              onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Supervisor">Supervisor</option>
                              <option value="Inspector">Inspector</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {isEditing ? (
                            <select
                              value={editUserBranch}
                              onChange={(e) => setEditUserBranch(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            >
                              {branches.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                              ))}
                            </select>
                          ) : (
                            u.branch
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateUser) {
                                      onUpdateUser({
                                        ...u,
                                        name: editUserName.trim() || u.name,
                                        email: editUserEmail.trim() || u.email,
                                        role: editUserRole,
                                        branch: editUserBranch || u.branch,
                                      });
                                    }
                                    setEditingUserId(null);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUserId(null)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateUser) {
                                      const nextStatus = isSuspended ? "Active" : "Suspended";
                                      onUpdateUser({ ...u, status: nextStatus });
                                    }
                                  }}
                                  className={`px-2 py-1 rounded text-xs font-semibold transition ${
                                    isSuspended
                                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                                  }`}
                                  title={isSuspended ? "Activate User" : "Suspend User"}
                                >
                                  {isSuspended ? "Activate" : "Suspend"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditUserName(u.name);
                                    setEditUserEmail(u.email);
                                    setEditUserRole(u.role);
                                    setEditUserBranch(u.branch);
                                  }}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 text-xs font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete user ${u.name}?`) && onDeleteUser) {
                                      onDeleteUser(u.id);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded border border-slate-800 transition"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "branches" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Add Workshop Branch</h2>
            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Southside Service Hub"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Metropolis"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium shadow transition mt-2"
              >
                Create Branch
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">Workshop Branches ({branches.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  {editingBranchId === b.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editBranchName}
                        onChange={(e) => setEditBranchName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        placeholder="Branch Name"
                      />
                      <input
                        type="text"
                        value={editBranchCity}
                        onChange={(e) => setEditBranchCity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        placeholder="City"
                      />
                      <div className="flex space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateBranch && editBranchName.trim() && editBranchCity.trim()) {
                              onUpdateBranch({ ...b, name: editBranchName.trim(), city: editBranchCity.trim() });
                              setEditingBranchId(null);
                            }
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBranchId(null)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-white text-sm">{b.name}</span>
                          <div className="text-xs text-slate-400 mt-0.5">City: {b.city}</div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBranchId(b.id);
                              setEditBranchName(b.name);
                              setEditBranchCity(b.city);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition text-xs"
                            title="Edit Branch"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete branch "${b.name}"?`) && onDeleteBranch) {
                                onDeleteBranch(b.id);
                              }
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vehicle-types" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Add Vehicle Type</h2>
            <form onSubmit={handleCreateVehicleType} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Vehicle Type Name</label>
                <input
                  type="text"
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Crossover / Hybrid"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium shadow transition mt-2"
              >
                Add Vehicle Type
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">Configured Vehicle Types ({vehicleTypes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicleTypes.map((vt, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{vt}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete vehicle type "${vt}"?`)) onDeleteVehicleType(idx);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Delete Vehicle Type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "models" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Add Model / Variant</h2>
            <form onSubmit={handleCreateModel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Model / Variant Name</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Ford F-150 / Honda Civic"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium shadow transition mt-2"
              >
                Add Model
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">Configured Models / Variants ({models.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {models.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{m}</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete model "${m}"?`)) onDeleteModel(idx);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Delete Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "spare-parts" && (
        <div className="space-y-6">
          {isBulkUploadMode ? (
            /* Bulk Upload mode */
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    <span>Bulk Upload Spare Parts</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Import lists of spare parts by uploading a JSON/CSV file or pasting standard comma/tab-separated rows.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsBulkUploadMode(false);
                    setBulkTextInput("");
                    setBulkPreview([]);
                    setBulkError("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-750 transition"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Upload JSON or CSV File
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-950/40 bg-slate-950 border-slate-800 hover:border-slate-700 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-xs text-slate-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">JSON or CSV (text formats)</p>
                        </div>
                        <input
                          type="file"
                          accept=".csv,.json,.txt"
                          onChange={handleBulkFileInputChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Or Paste Copy-Pasted Grid Data (CSV / Tab-Separated)
                      </label>
                      <button
                        onClick={() => {
                          const demo = `Part Name,Part Number,Unit,Estimated Cost\nBrake Caliper Front,BC-1092,Pcs,165\nOxygen Sensor O2,OS-504,Pcs,85\nFuel Injector Nozzle,FI-88,Pcs,75\nCabin Air Filter Carbon,AF-8812C,Pcs,52`;
                          setBulkTextInput(demo);
                          handleParseBulkData(demo);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium"
                      >
                        Insert Demo Data
                      </button>
                    </div>
                    <textarea
                      value={bulkTextInput}
                      onChange={(e) => {
                        setBulkTextInput(e.target.value);
                        handleParseBulkData(e.target.value);
                      }}
                      rows={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:border-blue-600 outline-none"
                      placeholder={`Format: Part Name,Part Number,Unit,Estimated Cost\ne.g.:\nWiper Blade Dual,WB-24,Pair,35\nTransmission Fluid 1L,TF-01,Litre,18`}
                    />
                  </div>

                  {bulkError && (
                    <div className="bg-rose-950/30 border border-rose-900/60 p-4 rounded-xl text-xs text-rose-400">
                      <strong>Parse Error:</strong> {bulkError}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col h-[400px]">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Parsed Import Preview ({bulkPreview.length})
                    </span>
                    {bulkPreview.length > 0 && (
                      <button
                        onClick={handleExecuteBulkUpload}
                        className="px-4 py-1.5 bg-emerald-605 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Import Parts</span>
                      </button>
                    )}
                  </div>

                  {bulkPreview.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                      <FileSpreadsheet className="w-12 h-12 text-slate-700 mb-2" />
                      <p className="text-xs font-semibold">No Data Parsed</p>
                      <p className="text-[10px] text-slate-600 max-w-[200px] mt-1">
                        Upload a file or paste text on the left to see parsing results.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-900">
                            <th className="pb-1.5 font-semibold">Part Name</th>
                            <th className="pb-1.5 font-semibold">Part Number</th>
                            <th className="pb-1.5 font-semibold">Unit</th>
                            <th className="pb-1.5 font-semibold text-right">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {bulkPreview.map((p, idx) => (
                            <tr key={idx} className="text-slate-300">
                              <td className="py-2 pr-2 font-medium text-white truncate max-w-[140px]">{p.partName}</td>
                              <td className="py-2 pr-2 font-mono text-[10px] text-slate-400">{p.partNumber}</td>
                              <td className="py-2 pr-2">{p.unit}</td>
                              <td className="py-2 text-right font-semibold text-emerald-400">${p.estimatedCost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Standard parts management view */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form Column */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-fit">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span>{editingPartId ? "Edit Spare Part" : "Add Spare Part"}</span>
                </h2>
                
                <form onSubmit={editingPartId ? handleSaveEditPart : handleCreateSparePart} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Part Name</label>
                    <input
                      type="text"
                      value={editingPartId ? editPartName : newPart.partName}
                      onChange={(e) => {
                        if (editingPartId) setEditPartName(e.target.value);
                        else setNewPart({ ...newPart, partName: e.target.value });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-600 outline-none"
                      placeholder="e.g. Wiper Blades (Pair)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Part Number / SKU</label>
                    <input
                      type="text"
                      value={editingPartId ? editPartNumber : newPart.partNumber}
                      onChange={(e) => {
                        if (editingPartId) setEditPartNumber(e.target.value);
                        else setNewPart({ ...newPart, partNumber: e.target.value });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-600 outline-none font-mono"
                      placeholder="e.g. WB-22"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Default Unit</label>
                      <input
                        type="text"
                        value={editingPartId ? editPartUnit : newPart.unit}
                        onChange={(e) => {
                          if (editingPartId) setEditPartUnit(e.target.value);
                          else setNewPart({ ...newPart, unit: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-600 outline-none"
                        placeholder="e.g. Pcs, Set, Pair"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Est. Unit Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingPartId ? editPartCost : newPart.estimatedCost}
                        onChange={(e) => {
                          if (editingPartId) setEditPartCost(Number(e.target.value) || 0);
                          else setNewPart({ ...newPart, estimatedCost: Number(e.target.value) || 0 });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-600 outline-none"
                        placeholder="e.g. 45"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium shadow transition"
                    >
                      {editingPartId ? "Save Changes" : "Create Part"}
                    </button>
                    {editingPartId && (
                      <button
                        type="button"
                        onClick={() => setEditingPartId(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Table Column */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>Spare Parts Catalog</span>
                      <span className="text-xs bg-blue-950 text-blue-400 border border-blue-900 font-semibold px-2 py-0.5 rounded-full ml-1">
                        {spareParts.length} Parts
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage parts inventory used during checklist inspections</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsBulkUploadMode(true);
                      setBulkTextInput("");
                      setBulkPreview([]);
                      setBulkError("");
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Bulk Upload Spares</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={partsSearchQuery}
                    onChange={(e) => setPartsSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-600"
                    placeholder="Search spare parts by name or part number..."
                  />
                </div>

                {/* Parts List Scroll */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 max-h-[500px] overflow-y-auto">
                  {spareParts.filter(p => 
                    p.partName.toLowerCase().includes(partsSearchQuery.toLowerCase()) || 
                    p.partNumber.toLowerCase().includes(partsSearchQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-1">
                      <p className="text-xs font-semibold text-slate-400">No spare parts found</p>
                      <p className="text-[10px] text-slate-600">Try refining your search query or add a new part to the catalog</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                          <th className="p-3 font-semibold">Part Name</th>
                          <th className="p-3 font-semibold">Part Number</th>
                          <th className="p-3 font-semibold">Unit</th>
                          <th className="p-3 font-semibold">Est. Cost</th>
                          <th className="p-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {spareParts
                          .filter(p => 
                            p.partName.toLowerCase().includes(partsSearchQuery.toLowerCase()) || 
                            p.partNumber.toLowerCase().includes(partsSearchQuery.toLowerCase())
                          )
                          .map((part) => (
                            <tr key={part.id} className="hover:bg-slate-900/35 transition text-slate-300">
                              <td className="p-3 font-semibold text-white">{part.partName}</td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">{part.partNumber}</td>
                              <td className="p-3">{part.unit}</td>
                              <td className="p-3 font-semibold text-emerald-400">${part.estimatedCost}</td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditPartClick(part)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition text-[10px] font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete "${part.partName}" from catalog?`) && onDeleteSparePart) {
                                        onDeleteSparePart(part.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "database" && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white">Database Backup & Restore</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Export a complete JSON snapshot of all inspection records, templates, users, and branches for secure archival or offline transfer.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/api/backup"
              download="autoinspect_backup.json"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (JSON)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
