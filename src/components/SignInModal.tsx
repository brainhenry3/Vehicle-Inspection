import React, { useState } from "react";
import { User } from "../types";
import { Wrench, LogIn, ShieldAlert, Search, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  users: User[];
  onSignIn: (user: User) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  users,
  onSignIn,
  onClose,
  canClose = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    if (user.status === "Suspended") {
      setErrorMsg(`Account for ${user.name} is suspended. Please contact your administrator.`);
      setSelectedUser(null);
      setPassword("");
      return;
    }
    setErrorMsg("");
    setSelectedUser(user);
    setPassword("");
    setShowPassword(false);
  };

  const handleConfirmSignIn = () => {
    if (!selectedUser) return;
    if (selectedUser.status === "Suspended") {
      setErrorMsg(`Account for ${selectedUser.name} is suspended.`);
      return;
    }
    if (selectedUser.password && password !== selectedUser.password) {
      setErrorMsg("Incorrect password. Please try again.");
      return;
    }
    onSignIn(selectedUser);
    setSelectedUser(null);
    setSearchTerm("");
    setPassword("");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AutoInspect Pro Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Select your staff account registered by your administrator to sign in
          </p>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs bg-slate-800 p-2 rounded-xl border border-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, role or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Users list */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/40">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No registered user accounts found matching your search.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              const isSuspended = u.status === "Suspended";
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSuspended
                      ? "opacity-50 bg-slate-950/20 border-slate-800/50 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-600/10 border-blue-500 text-white shadow-md"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-blue-400 border border-slate-700"
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{u.name}</span>
                        {isSuspended && (
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-medium">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Branch: <span className="text-slate-300 font-medium">{u.branch}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                      {u.role}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Password input for password-protected accounts */}
        {selectedUser && selectedUser.password && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Password Verification</span>
              </label>
              <span className="text-[10px] text-slate-500">
                Required for {selectedUser.name}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (e.g. gigmile@2024)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password) {
                    handleConfirmSignIn();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {selectedUser ? (
              <span>
                Selected: <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.role})
              </span>
            ) : (
              <span>Please select your account to continue</span>
            )}
          </div>
          <div className="flex space-x-2">
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirmSignIn}
              disabled={!selectedUser || (!!selectedUser.password && !password)}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg ${
                selectedUser && (!selectedUser.password || password)
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
