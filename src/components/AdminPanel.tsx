import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Key, LogOut, FolderPlus, Trash2, Edit3, Plus, Check, X, Mail, MessageSquare, 
  Layers, Award, ExternalLink, Calendar, RefreshCw, Eye, EyeOff, Save, Sliders, LayoutGrid
} from "lucide-react";
import { Project, SkillCategory, CertificationItem } from "../types";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "projects" | "skills" | "certifications">("messages");
  
  // Dynamic Lists states
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Modals / Editors states
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [newCert, setNewCert] = useState({ title: "", issuer: "", link: "" });

  useEffect(() => {
    if (token) {
      loadAllAdminData();
    }
  }, [token]);

  const loadAllAdminData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      // Load Messages (Private Admin API)
      const msgRes = await fetch("/api/admin/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.status === 401 || msgRes.status === 403) {
        handleLogout();
        return;
      }
      const msgData = await msgRes.json();
      if (Array.isArray(msgData)) setMessages(msgData);

      // Load Projects (Public API)
      const projRes = await fetch("/api/projects");
      const projData = await projRes.json();
      if (Array.isArray(projData)) setProjects(projData);

      // Load Skills (Public API)
      const skillRes = await fetch("/api/skills");
      const skillData = await skillRes.json();
      if (Array.isArray(skillData)) setSkills(skillData);

      // Load Certifications (Public API)
      const certRes = await fetch("/api/certifications");
      const certData = await certRes.json();
      if (Array.isArray(certData)) setCertifications(certData);

    } catch (err) {
      console.error("Error loading admin data:", err);
      showStatus("Failed to synchronize with remote server.", true);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text: string, error = false) => {
    setStatusMessage({ text, error });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!password) return;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setPassword("");
      } else {
        setLoginError(data.error || "Access denied. Invalid password.");
      }
    } catch (err) {
      setLoginError("A networking error occurred.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setMessages([]);
    showStatus("Logged out successfully.");
  };

  // --- Messages Operations ---
  const markMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
        showStatus("Message marked as read.");
      }
    } catch (err) {
      showStatus("Failed to update message.", true);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        showStatus("Message permanently deleted.");
      }
    } catch (err) {
      showStatus("Failed to delete message.", true);
    }
  };

  // --- Projects Operations ---
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.id || !editingProject.title || !editingProject.subtitle || !editingProject.description) {
      showStatus("Please fill in all required fields.", true);
      return;
    }

    try {
      const url = isNewProject ? "/api/admin/projects" : `/api/admin/projects/${editingProject.id}`;
      const method = isNewProject ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingProject)
      });

      if (res.ok) {
        showStatus(isNewProject ? "Project created successfully!" : "Project updated successfully!");
        setEditingProject(null);
        loadAllAdminData();
      } else {
        const err = await res.json();
        showStatus(err.error || "Failed to save project.", true);
      }
    } catch (err) {
      showStatus("Error transmitting project payload.", true);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This will remove it from your portfolio grid.")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showStatus("Project deleted successfully.");
        loadAllAdminData();
      }
    } catch (err) {
      showStatus("Failed to delete project.", true);
    }
  };

  // --- Skills Operations ---
  const addSkillToCategory = (catIdx: number) => {
    const name = prompt("Enter skill name (e.g., PostgreSQL):");
    if (!name) return;
    const updated = [...skills];
    updated[catIdx].skills.push({ name, level: 85 });
    saveSkills(updated);
  };

  const removeSkillFromCategory = (catIdx: number, skillIdx: number) => {
    const updated = [...skills];
    updated[catIdx].skills.splice(skillIdx, 1);
    saveSkills(updated);
  };

  const updateSkillLevel = (catIdx: number, skillIdx: number, level: number) => {
    const updated = [...skills];
    updated[catIdx].skills[skillIdx].level = level;
    // We update local state immediately for fast feedback, but save to database
    setSkills(updated);
  };

  const saveSkills = async (updatedList = skills) => {
    try {
      const res = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ categories: updatedList })
      });
      if (res.ok) {
        showStatus("Skills matrix synchronized successfully.");
        loadAllAdminData();
      } else {
        showStatus("Failed to synchronize skills matrix.", true);
      }
    } catch (err) {
      showStatus("Error updating skills.", true);
    }
  };

  const addSkillCategory = () => {
    const name = prompt("Enter new Skill Category Name (e.g., Cloud & DevOps):");
    if (!name) return;
    const updated = [...skills, { category: name, skills: [] }];
    saveSkills(updated);
  };

  const removeSkillCategory = (idx: number) => {
    if (!confirm(`Are you sure you want to delete the category "${skills[idx].category}" and all its skills?`)) return;
    const updated = [...skills];
    updated.splice(idx, 1);
    saveSkills(updated);
  };

  // --- Certifications Operations ---
  const saveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title || !newCert.issuer || !newCert.link) {
      showStatus("Please fill in Title, Issuer, and Link.", true);
      return;
    }

    try {
      const res = await fetch("/api/admin/certifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCert)
      });
      if (res.ok) {
        showStatus("Certification added successfully!");
        setNewCert({ title: "", issuer: "", link: "" });
        loadAllAdminData();
      } else {
        showStatus("Failed to save certification.", true);
      }
    } catch (err) {
      showStatus("Error communicating with certification API.", true);
    }
  };

  const deleteCertification = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Remove this certification from credentials pathway?")) return;
    try {
      const res = await fetch(`/api/admin/certifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showStatus("Certification deleted.");
        loadAllAdminData();
      }
    } catch (err) {
      showStatus("Error deleting certification.", true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070913]/98 overflow-y-auto font-sans flex flex-col selection:bg-purple-900 selection:text-white">
      {/* Top Banner Header */}
      <div className="border-b border-slate-900/80 bg-slate-950/80 px-6 py-4 sticky top-0 z-40 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-mono font-bold">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">Portfolio Workspace</h1>
            <p className="text-[10px] text-purple-400 font-mono">ADMINISTRATIVE INTERFACE // PORT: 3000</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <button
              onClick={loadAllAdminData}
              title="Refresh Workspace Data"
              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X size={12} />
            <span>CLOSE_WORKSPACE</span>
          </button>
        </div>
      </div>

      {/* Login Screen (If No Token Set) */}
      {!token ? (
        <div className="flex-1 flex items-center justify-center p-6 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="flex flex-col items-center gap-3 text-center mb-8">
              <div className="p-3 bg-purple-950/20 border border-purple-900/30 text-purple-400 rounded-2xl">
                <Lock size={22} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-mono">ADMIN CHALLENGE</h2>
              <p className="text-xs text-slate-500 max-w-xs">
                Provide the administrator password configured in your server runtime ecosystem to synchronize changes live.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">WORKSPACE PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-slate-900/60 border border-slate-850 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25 transition-all rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-xs font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3.5 py-2.5 rounded-xl">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs font-mono rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-purple-950/50 hover:scale-[1.01]"
              >
                AUTHORIZE & ENTER &rarr;
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        /* Workspace Main Body */
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
          
          {/* Left Sidebar Navigation */}
          <div className="lg:w-64 flex flex-col gap-4 flex-shrink-0 select-none">
            <div className="bg-slate-950 border border-slate-900/90 rounded-2xl p-4 flex flex-col gap-1.5 shadow-md">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest px-3 mb-2 font-bold block">NAVIGATION DECK</span>
              
              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "messages" 
                    ? "bg-blue-600 text-white font-semibold shadow shadow-blue-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={13} />
                  <span>CONTACT_INBOX</span>
                </div>
                {messages.filter(m => !m.read).length > 0 && (
                  <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    {messages.filter(m => !m.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "projects" 
                    ? "bg-purple-600 text-white font-semibold shadow shadow-purple-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <LayoutGrid size={13} />
                <span>PROJECTS_PORTFOLIO</span>
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "skills" 
                    ? "bg-pink-600 text-white font-semibold shadow shadow-pink-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Sliders size={13} />
                <span>SKILLS_MATRIX</span>
              </button>

              <button
                onClick={() => setActiveTab("certifications")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "certifications" 
                    ? "bg-emerald-600 text-white font-semibold shadow shadow-emerald-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Award size={13} />
                <span>CREDENTIALS_LIST</span>
              </button>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-950/10 hover:bg-red-950/20 border border-red-900/20 text-red-400 hover:text-red-300 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogOut size={13} />
              <span>LOGOUT_SESSION</span>
            </button>
          </div>

          {/* Right Main Panel Content Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Status alerts banner */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 text-xs font-mono p-3 rounded-xl border flex items-center gap-2 shadow-md ${
                    statusMessage.error 
                      ? "bg-red-950/20 border-red-900/40 text-red-400" 
                      : "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                  }`}
                >
                  <Check size={12} />
                  <span>{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Tab Contents */}
            <div className="bg-slate-950/30 border border-slate-900 rounded-3xl p-5 sm:p-6 flex-1 shadow-inner relative">
              {loading && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
                  <div className="flex flex-col items-center gap-2 text-slate-400 font-mono text-xs">
                    <RefreshCw size={24} className="animate-spin text-purple-500" />
                    <span>SYNCHRONIZING REMOTE METADATA...</span>
                  </div>
                </div>
              )}

              {/* 1. TAB: CONTACT MESSAGES */}
              {activeTab === "messages" && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <Mail size={14} className="text-blue-400" />
                        <span>RECEIVED_MESSAGES_LOG</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Inbox entries compiled from dynamic client-side forms.</p>
                    </div>
                    <span className="text-xs font-mono bg-blue-950/40 border border-blue-900/30 text-blue-400 px-2.5 py-1 rounded-lg">
                      COUNT: {messages.length}
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono border border-dashed border-slate-900 rounded-2xl">
                      <MessageSquare size={20} className="mb-2 text-slate-600" />
                      <span className="text-xs">No entries received. All channels quiet.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`border rounded-2xl p-4 flex flex-col gap-3 transition-colors ${
                            msg.read 
                              ? "bg-slate-950/20 border-slate-900/60" 
                              : "bg-blue-950/5 border-blue-900/20 shadow shadow-blue-950/10"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2">
                              {!msg.read && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                              )}
                              <span className="text-xs font-bold text-slate-200">{msg.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">(&lt;{msg.email}&gt;)</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans select-text whitespace-pre-wrap">
                            {msg.message}
                          </p>

                          <div className="flex items-center justify-end gap-2 border-t border-slate-900/40 pt-2.5 mt-1 select-none">
                            {!msg.read && (
                              <button
                                onClick={() => markMessageRead(msg.id)}
                                className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-900/30 border border-blue-900/30 text-blue-400 hover:text-blue-300 text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
                              >
                                MARK_READ
                              </button>
                            )}
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="px-2.5 py-1 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-400 hover:text-red-300 text-[10px] font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 size={9} />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. TAB: PROJECTS MANAGEMENT */}
              {activeTab === "projects" && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <FolderPlus size={14} className="text-purple-400" />
                        <span>ENGINEERING_PROJECTS_DB</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Control individual items within the Featured Works listing.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProject({
                          id: "project_" + Math.random().toString(36).substr(2, 5),
                          title: "",
                          subtitle: "",
                          tagline: "",
                          description: "",
                          features: [],
                          techStack: [],
                          year: new Date().getFullYear().toString(),
                          links: { github: "", live: "" },
                          metrics: ""
                        });
                        setIsNewProject(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow shadow-purple-950/20"
                    >
                      <Plus size={12} />
                      <span>ADD_PROJECT</span>
                    </button>
                  </div>

                  {editingProject ? (
                    /* Project Edit/Create Form Overlay View */
                    <form onSubmit={saveProject} className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 select-none">
                        <span className="text-xs font-mono font-bold text-purple-400">
                          {isNewProject ? "// NEW_PROJECT_RECORD" : `// EDIT_RECORD: ${editingProject.id}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">PROJECT ID (UNIQUE, NO SPACES)</label>
                          <input
                            type="text"
                            required
                            disabled={!isNewProject}
                            value={editingProject.id || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                            placeholder="my-cool-app"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">METRICS / HIGH-IMPACT OUTCOME</label>
                          <input
                            type="text"
                            value={editingProject.metrics || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, metrics: e.target.value })}
                            placeholder="99.9% Availability, 100% Normalized Schema"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">PROJECT TITLE</label>
                          <input
                            type="text"
                            required
                            value={editingProject.title || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            placeholder="EduTrack"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans font-bold focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">SUBTITLE / PRIMARY ACTION</label>
                          <input
                            type="text"
                            required
                            value={editingProject.subtitle || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                            placeholder="Student Assignment & Learning Management Portal"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">PORTFOLIO TAGLINE</label>
                          <input
                            type="text"
                            value={editingProject.tagline || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                            placeholder="A role-based learning platform supporting sound academic workflows."
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">FULL DESCRIPTION</label>
                          <textarea
                            rows={3}
                            required
                            value={editingProject.description || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                            placeholder="EduTrack is a robust role-based Learning Management System designed to handle courses, grading loops, and deadline telemetry..."
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans resize-none focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">KEY ARCHITECTURAL FEATURES (ONE PER LINE)</label>
                          <textarea
                            rows={3}
                            value={(editingProject.features || []).join("\n")}
                            onChange={(e) => setEditingProject({ ...editingProject, features: e.target.value.split("\n").filter(Boolean) })}
                            placeholder="Role-Based Access Control (RBAC) separated views&#10;Django REST Framework structured endpoints&#10;Highly indexed database schema design"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">TECH STACK (COMMA-SEPARATED)</label>
                          <input
                            type="text"
                            value={(editingProject.techStack || []).join(", ")}
                            onChange={(e) => setEditingProject({ ...editingProject, techStack: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                            placeholder="Python, Django, Angular, SQL"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">DEVELOPMENT YEAR</label>
                          <input
                            type="text"
                            value={editingProject.year || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                            placeholder="2025"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">GITHUB REPOSITORY URL</label>
                          <input
                            type="text"
                            value={editingProject.links?.github || ""}
                            onChange={(e) => setEditingProject({ 
                              ...editingProject, 
                              links: { ...(editingProject.links || {}), github: e.target.value } 
                            })}
                            placeholder="https://github.com/raviraj-chauhan/EduTrack"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">LIVE SITE / DEMO URL</label>
                          <input
                            type="text"
                            value={editingProject.links?.live || ""}
                            onChange={(e) => setEditingProject({ 
                              ...editingProject, 
                              links: { ...(editingProject.links || {}), live: e.target.value } 
                            })}
                            placeholder="https://example.com"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono transition-colors cursor-pointer"
                        >
                          ABORT
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow shadow-purple-900/30"
                        >
                          <Save size={12} />
                          <span>COMMIT_TO_REMOTE_DB</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Projects Listing View */
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
                      {projects.map((proj) => (
                        <div key={proj.id} className="bg-slate-950/45 border border-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono text-purple-400 font-semibold uppercase">{proj.year} // ID: {proj.id}</span>
                            <h4 className="text-sm font-bold text-slate-200 font-sans">{proj.title}</h4>
                            <p className="text-xs text-slate-400 leading-normal max-w-xl truncate">{proj.subtitle}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 select-none">
                            <button
                              onClick={() => {
                                setEditingProject(proj);
                                setIsNewProject(false);
                              }}
                              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-purple-400 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => deleteProject(proj.id)}
                              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. TAB: SKILLS MATRIX */}
              {activeTab === "skills" && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <Layers size={14} className="text-pink-400" />
                        <span>SKILLS_TAXONOMY_ENGINE</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Add skill categories and slide competency vectors on scale.</p>
                    </div>
                    <button
                      onClick={addSkillCategory}
                      className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow shadow-pink-950/20"
                    >
                      <Plus size={12} />
                      <span>ADD_CATEGORY</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 overflow-y-auto max-h-[500px] pr-2">
                    {skills.map((cat, catIdx) => (
                      <div key={catIdx} className="bg-slate-950/45 border border-slate-900 p-5 rounded-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-sm font-bold text-slate-200">{cat.category}</span>
                          <div className="flex items-center gap-2 select-none">
                            <button
                              onClick={() => addSkillToCategory(catIdx)}
                              className="px-2 py-1 bg-pink-950/20 hover:bg-pink-950/30 border border-pink-900/30 text-pink-400 hover:text-pink-300 rounded text-[9px] font-mono tracking-wider transition-all cursor-pointer"
                            >
                              + ADD_SKILL
                            </button>
                            <button
                              onClick={() => removeSkillCategory(catIdx)}
                              className="px-2 py-1 bg-red-950/10 hover:bg-red-950/20 border border-red-900/10 text-red-400 hover:text-red-300 rounded text-[9px] font-mono tracking-wider transition-all cursor-pointer"
                            >
                              DELETE_CAT
                            </button>
                          </div>
                        </div>

                        {cat.skills.length === 0 ? (
                          <p className="text-xs text-slate-500 font-mono py-2 italic text-center">No skills present. Add items to render.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.skills.map((skill, skillIdx) => (
                              <div key={skillIdx} className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex-1 flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-mono text-slate-300">{skill.name}</span>
                                    <span className="font-mono text-[10px] text-pink-400">{skill.level}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={skill.level}
                                    onChange={(e) => updateSkillLevel(catIdx, skillIdx, parseInt(e.target.value))}
                                    className="w-full accent-pink-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <button
                                  onClick={() => removeSkillFromCategory(catIdx, skillIdx)}
                                  className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {skills.length > 0 && (
                      <button
                        onClick={() => saveSkills()}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                      >
                        <Save size={13} className="text-pink-500" />
                        <span>SYNCHRONIZE_ENTIRE_SKILL_MATRIX</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 4. TAB: CERTIFICATIONS LIST */}
              {activeTab === "certifications" && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <Award size={14} className="text-emerald-400" />
                        <span>CREDENTIAL_REGISTRY_CATALOGUE</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Publish verify links for professional accreditations on credentials timeline.</p>
                    </div>
                  </div>

                  {/* Cert creation form */}
                  <form onSubmit={saveCertification} className="bg-slate-950/45 border border-slate-900 p-4 rounded-2xl mb-6 flex flex-col gap-4">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">// REGISTER_NEW_CREDENTIAL</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">TITLE</label>
                        <input
                          type="text"
                          required
                          value={newCert.title}
                          onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                          placeholder="Django App Development"
                          className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">ISSUER</label>
                        <input
                          type="text"
                          required
                          value={newCert.issuer}
                          onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                          placeholder="IBM (Coursera)"
                          className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">VERIFY URL</label>
                        <input
                          type="text"
                          required
                          value={newCert.link}
                          onChange={(e) => setNewCert({ ...newCert, link: e.target.value })}
                          placeholder="https://coursera.org/verify/..."
                          className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow shadow-emerald-950/20"
                    >
                      <Plus size={12} />
                      <span>REGISTER_CREDENTIAL</span>
                    </button>
                  </form>

                  {/* Cert list */}
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">{cert.issuer}</span>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{cert.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 select-none">
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink size={11} />
                          </a>
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
