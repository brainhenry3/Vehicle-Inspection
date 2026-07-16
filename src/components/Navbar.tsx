import React from "react";
import { UserRole, User } from "../types";
import { Wrench, ShieldCheck, FileText, BarChart3, Settings, PlusCircle, Wifi, WifiOff, Users, RefreshCw, LogOut, LogIn } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  isOnline: boolean;
  pendingSyncCount: number;
  onSync: () => void;
  onSignOut: () => void;
  onOpenSignIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  users,
  isOnline,
  pendingSyncCount,
  onSync,
  onSignOut,
  onOpenSignIn,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">AutoInspect Pro</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Enterprise v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === "dashboard" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("inspections")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === "inspections" || activeTab === "detail" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Inspections</span>
            </button>
            <button
              onClick={() => setActiveTab("new-inspection")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === "new-inspection" ? "bg-emerald-600 text-white shadow" : "text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Inspection</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === "templates" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Templates</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === "reports" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reports</span>
            </button>
            {currentUser?.role === "Admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === "admin" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Offline Status & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Offline indicator */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 hidden sm:inline">Offline Mode</span>
                </>
              )}
              {pendingSyncCount > 0 && (
                <button
                  onClick={onSync}
                  className="ml-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center space-x-1 text-[11px]"
                  title="Sync offline records"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* Current User / Sign In / Sign Out */}
            {currentUser ? (
              <div className="relative group">
                <div className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-medium text-white truncate max-w-[100px]">{currentUser.name}</div>
                    <div className="text-[10px] text-blue-400 font-semibold">{currentUser.role}</div>
                  </div>
                </div>

                {/* Dropdown for user switching & Sign out */}
                <div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700/60 mb-1 flex justify-between items-center">
                    <span>Signed in as</span>
                    <button
                      onClick={onSignOut}
                      className="text-rose-400 hover:text-rose-300 flex items-center space-x-1 lowercase font-semibold"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>sign out</span>
                    </button>
                  </div>
                  <div className="px-3 py-1.5 text-xs text-white font-medium border-b border-slate-700/40 mb-1">
                    <div>{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{currentUser.email}</div>
                  </div>
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                    Switch Account
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition ${
                        currentUser.id === u.id ? "bg-blue-600/20 text-blue-300 font-semibold" : "text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.branch}</div>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                        {u.role}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-700 mt-1 pt-1 px-2">
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded flex items-center space-x-1.5 font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-300 bg-slate-800"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("inspections")}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === "inspections" || activeTab === "detail" ? "bg-blue-600 text-white" : "text-slate-300 bg-slate-800"
            }`}
          >
            Inspections
          </button>
          <button
            onClick={() => setActiveTab("new-inspection")}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === "new-inspection" ? "bg-emerald-600 text-white" : "text-emerald-400 bg-emerald-950/40"
            }`}
          >
            + New
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === "templates" ? "bg-blue-600 text-white" : "text-slate-300 bg-slate-800"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === "reports" ? "bg-blue-600 text-white" : "text-slate-300 bg-slate-800"
            }`}
          >
            Reports
          </button>
          {currentUser.role === "Admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
                activeTab === "admin" ? "bg-blue-600 text-white" : "text-slate-300 bg-slate-800"
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
