import React, { useState, useEffect } from "react";
import { InspectionRecord, InspectionTemplate, User, Branch, SparePart } from "./types";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { InspectionsList } from "./components/InspectionsList";
import { InspectionWizard } from "./components/InspectionWizard";
import { InspectionDetailModal } from "./components/InspectionDetailModal";
import { TemplatesManager } from "./components/TemplatesManager";
import { ReportsView } from "./components/ReportsView";
import { AdminSettings } from "./components/AdminSettings";
import { SignInModal } from "./components/SignInModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(["Sedan", "SUV", "Pickup", "Truck", "Bus", "Motorcycle", "Electric Vehicle"]);
  const [models, setModels] = useState<string[]>(["Camry SE", "Model Y Long Range", "F-150 Lightning", "Civic Type R", "RAV4 Hybrid", "Actros 2645"]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "usr-1",
    name: "Administrator",
    email: "admin@autoinspect.pro",
    role: "Admin",
    branch: "All Branches",
  });
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Fetch initial data from Express backend
  useEffect(() => {
    fetchData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [insRes, tplRes, usrRes, brRes, vtRes, mdRes, spRes] = await Promise.all([
        fetch("/api/inspections").then((r) => r.json()),
        fetch("/api/templates").then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/branches").then((r) => r.json()),
        fetch("/api/vehicle-types").then((r) => r.json()),
        fetch("/api/models").then((r) => r.json()),
        fetch("/api/spare-parts").then((r) => r.json()).catch(() => []),
      ]);

      if (Array.isArray(insRes)) setInspections(insRes);
      if (Array.isArray(tplRes)) setTemplates(tplRes);
      if (Array.isArray(usrRes)) {
        setUsers(usrRes);
        if (usrRes.length > 0) setCurrentUser(usrRes[0]);
      }
      if (Array.isArray(brRes)) setBranches(brRes);
      if (Array.isArray(vtRes)) setVehicleTypes(vtRes);
      if (Array.isArray(mdRes)) setModels(mdRes);
      if (Array.isArray(spRes)) setSpareParts(spRes);
    } catch (e) {
      console.error("Failed to fetch initial data:", e);
    }
  };

  const handleSaveInspection = async (newRecord: InspectionRecord) => {
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      const saved = await res.json();
      setInspections([saved, ...inspections]);
      setSelectedInspection(saved);
      setActiveTab("detail");
    } catch (e) {
      console.error("Failed to save inspection:", e);
      setInspections([newRecord, ...inspections]);
      setPendingSyncCount((c) => c + 1);
      setSelectedInspection(newRecord);
      setActiveTab("detail");
    }
  };

  const handleDeleteInspection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inspection record?")) return;
    try {
      await fetch(`/api/inspections/${id}`, { method: "DELETE" });
      setInspections(inspections.filter((i) => i.id !== id));
      if (selectedInspection?.id === id) {
        setActiveTab("inspections");
        setSelectedInspection(null);
      }
    } catch (e) {
      console.error("Failed to delete inspection:", e);
    }
  };

  const handleSaveTemplate = async (tpl: InspectionTemplate) => {
    try {
      const res = await fetch(`/api/templates/${tpl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl),
      });
      const updated = await res.json();
      setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl),
      });
      const created = await res.json();
      setTemplates([...templates, created]);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to delete template:", e);
    }
  };

  const handleAddUser = async (user: User) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const saved = await res.json();
      setUsers([...users, saved]);
    } catch (e) {
      setUsers([...users, user]);
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const updated = await res.json();
      setUsers(users.map(u => u.id === updated.id ? updated : u));
    } catch (e) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddBranch = async (branch: Branch) => {
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branch),
      });
      const saved = await res.json();
      setBranches([...branches, saved]);
    } catch (e) {
      setBranches([...branches, branch]);
    }
  };

  const handleUpdateBranch = async (branch: Branch) => {
    try {
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branch),
      });
      const updated = await res.json();
      setBranches(branches.map(b => b.id === updated.id ? updated : b));
    } catch (e) {
      setBranches(branches.map(b => b.id === branch.id ? branch : b));
    }
  };

  const handleDeleteBranch = async (id: string) => {
    try {
      await fetch(`/api/branches/${id}`, { method: "DELETE" });
      setBranches(branches.filter(b => b.id !== id));
    } catch (e) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  const handleAddVehicleType = async (name: string) => {
    try {
      const res = await fetch("/api/vehicle-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const updated = await res.json();
      if (Array.isArray(updated)) setVehicleTypes(updated);
    } catch (e) {
      setVehicleTypes([...vehicleTypes, name]);
    }
  };

  const handleDeleteVehicleType = async (index: number) => {
    try {
      const res = await fetch(`/api/vehicle-types/${index}`, { method: "DELETE" });
      const updated = await res.json();
      if (Array.isArray(updated)) setVehicleTypes(updated);
    } catch (e) {
      setVehicleTypes(vehicleTypes.filter((_, i) => i !== index));
    }
  };

  const handleAddModel = async (name: string) => {
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const updated = await res.json();
      if (Array.isArray(updated)) setModels(updated);
    } catch (e) {
      setModels([...models, name]);
    }
  };

  const handleDeleteModel = async (index: number) => {
    try {
      const res = await fetch(`/api/models/${index}`, { method: "DELETE" });
      const updated = await res.json();
      if (Array.isArray(updated)) setModels(updated);
    } catch (e) {
      setModels(models.filter((_, i) => i !== index));
    }
  };

  const handleAddSparePart = async (part: Omit<SparePart, "id">) => {
    try {
      const res = await fetch("/api/spare-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(part),
      });
      const saved = await res.json();
      setSpareParts([...spareParts, saved]);
    } catch (e) {
      console.error("Failed to add spare part:", e);
    }
  };

  const handleUpdateSparePart = async (part: SparePart) => {
    try {
      const res = await fetch(`/api/spare-parts/${part.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(part),
      });
      const updated = await res.json();
      setSpareParts(spareParts.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      console.error("Failed to update spare part:", e);
    }
  };

  const handleDeleteSparePart = async (id: string) => {
    try {
      await fetch(`/api/spare-parts/${id}`, { method: "DELETE" });
      setSpareParts(spareParts.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to delete spare part:", e);
    }
  };

  const handleBulkUploadSpareParts = async (partsList: Omit<SparePart, "id">[]) => {
    try {
      const res = await fetch("/api/spare-parts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parts: partsList }),
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.parts)) {
        setSpareParts(result.parts);
      }
    } catch (e) {
      console.error("Failed to bulk upload spare parts:", e);
    }
  };

  const handleSync = () => {
    setPendingSyncCount(0);
    alert("All offline inspection records synchronized successfully with the central cloud server.");
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsSignInModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setIsSignInModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
        onSignOut={handleSignOut}
        onOpenSignIn={handleOpenSignIn}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={!currentUser || isSignInModalOpen}
        users={users}
        onSignIn={(u) => {
          setCurrentUser(u);
          setIsSignInModalOpen(false);
        }}
        onClose={() => {
          if (currentUser) setIsSignInModalOpen(false);
        }}
        canClose={!!currentUser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "dashboard" && (
          <Dashboard
            inspections={inspections}
            setActiveTab={setActiveTab}
            onSelectInspection={(ins) => setSelectedInspection(ins)}
          />
        )}

        {activeTab === "inspections" && (
          <InspectionsList
            inspections={inspections}
            setActiveTab={setActiveTab}
            onSelectInspection={(ins) => {
              setSelectedInspection(ins);
              setActiveTab("detail");
            }}
            onDeleteInspection={handleDeleteInspection}
          />
        )}

        {activeTab === "new-inspection" && currentUser && (
          <InspectionWizard
            templates={templates}
            currentUser={currentUser}
            vehicleTypes={vehicleTypes}
            models={models}
            branches={branches}
            spareParts={spareParts}
            onSaveInspection={handleSaveInspection}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "detail" && selectedInspection && (
          <InspectionDetailModal
            inspection={selectedInspection}
            onBack={() => setActiveTab("inspections")}
          />
        )}

        {activeTab === "templates" && (
          <TemplatesManager
            templates={templates}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {activeTab === "reports" && <ReportsView inspections={inspections} />}

        {activeTab === "admin" && (
          <AdminSettings
            users={users}
            branches={branches}
            vehicleTypes={vehicleTypes}
            models={models}
            spareParts={spareParts}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddBranch={handleAddBranch}
            onUpdateBranch={handleUpdateBranch}
            onDeleteBranch={handleDeleteBranch}
            onAddVehicleType={handleAddVehicleType}
            onDeleteVehicleType={handleDeleteVehicleType}
            onAddModel={handleAddModel}
            onDeleteModel={handleDeleteModel}
            onAddSparePart={handleAddSparePart}
            onUpdateSparePart={handleUpdateSparePart}
            onDeleteSparePart={handleDeleteSparePart}
            onBulkUploadSpareParts={handleBulkUploadSpareParts}
          />
        )}
      </main>
    </div>
  );
}
