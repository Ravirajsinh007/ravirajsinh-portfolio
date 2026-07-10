import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, LogOut, FolderPlus, Trash2, Edit3, Plus, Check, X, Mail, MessageSquare, 
  Layers, Award, ExternalLink, RefreshCw, Eye, EyeOff, Save, Sliders, LayoutGrid,
  TrendingUp, Sparkles, Send, Reply, CheckCheck, BarChart3, Activity, User, Upload,
  FileText, Image
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie, Legend 
} from "recharts";
import { Project, SkillCategory, CertificationItem, ContactMessage } from "../types";
import { getApiUrl } from "../lib/api";

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("admin_token"));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "messages" | "projects" | "skills" | "certifications" | "profile">("dashboard");
  
  // Dynamic Lists states
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [profile, setProfile] = useState<{ photoUrl: string; resumeUrl: string }>({ photoUrl: "", resumeUrl: "" });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingProjectPhoto, setUploadingProjectPhoto] = useState(false);
  const [uploadingCertPhoto, setUploadingCertPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Message Replies states
  const [replyTexts, setReplyTexts] = useState<{ [messageId: string]: string }>({});
  const [draftingMessageId, setDraftingMessageId] = useState<string | null>(null);
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);

  // Modals / Editors states
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [newCert, setNewCert] = useState({ title: "", issuer: "", link: "", imageUrl: "" });
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);

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
      const msgRes = await fetch(getApiUrl("/api/admin/messages"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.status === 401 || msgRes.status === 403) {
        handleLogout();
        return;
      }
      const msgData = await msgRes.json();
      if (Array.isArray(msgData)) setMessages(msgData);

      // Load Projects (Public API)
      const projRes = await fetch(getApiUrl("/api/projects"));
      const projData = await projRes.json();
      if (Array.isArray(projData)) setProjects(projData);

      // Load Skills (Public API)
      const skillRes = await fetch(getApiUrl("/api/skills"));
      const skillData = await skillRes.json();
      if (Array.isArray(skillData)) setSkills(skillData);

      // Load Certifications (Public API)
      const certRes = await fetch(getApiUrl("/api/certifications"));
      const certData = await certRes.json();
      if (Array.isArray(certData)) setCertifications(certData);

      // Load Profile Config
      const profileRes = await fetch(getApiUrl("/api/profile"));
      const profileData = await profileRes.json();
      if (profileData && typeof profileData === "object") {
        setProfile({
          photoUrl: profileData.photoUrl || "",
          resumeUrl: profileData.resumeUrl || ""
        });
      }

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

  const saveProfile = async (updatedProfile = profile) => {
    try {
      const res = await fetch(getApiUrl("/api/admin/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        showStatus("Profile details synced with database.");
        loadAllAdminData();
      } else {
        showStatus("Failed to save profile.", true);
      }
    } catch (err) {
      showStatus("Error saving profile.", true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "photoUrl" | "resumeUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "photoUrl" && !file.type.startsWith("image/")) {
      showStatus("Please upload a valid image file.", true);
      return;
    }
    
    if (field === "resumeUrl" && file.type !== "application/pdf" && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      showStatus("Please upload a valid PDF or Word document.", true);
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => {
      if (field === "photoUrl") setUploadingPhoto(true);
      else setUploadingResume(true);
    };
    
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch(getApiUrl("/api/admin/upload"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          showStatus(`${field === "photoUrl" ? "Photo" : "Resume"} uploaded successfully!`);
          const updatedProfile = { ...profile, [field]: data.url };
          setProfile(updatedProfile);
          await saveProfile(updatedProfile);
        } else {
          showStatus(data.error || "Failed to upload file.", true);
        }
      } catch (err) {
        showStatus("Error uploading file.", true);
      } finally {
        setUploadingPhoto(false);
        setUploadingResume(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProjectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showStatus("Please upload a valid image file.", true);
      return;
    }
    const reader = new FileReader();
    reader.onloadstart = () => setUploadingProjectPhoto(true);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch(getApiUrl("/api/admin/upload"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          showStatus("Project image uploaded successfully!");
          if (editingProject) {
            setEditingProject({ ...editingProject, imageUrl: data.url });
          }
        } else {
          showStatus(data.error || "Failed to upload project image.", true);
        }
      } catch (err) {
        showStatus("Error uploading project image.", true);
      } finally {
        setUploadingProjectPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCertPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showStatus("Please upload a valid image file.", true);
      return;
    }
    const reader = new FileReader();
    reader.onloadstart = () => setUploadingCertPhoto(true);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch(getApiUrl("/api/admin/upload"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          showStatus("Certification image uploaded successfully!");
          setNewCert(prev => ({ ...prev, imageUrl: data.url }));
        } else {
          showStatus(data.error || "Failed to upload certification image.", true);
        }
      } catch (err) {
        showStatus("Error uploading certification image.", true);
      } finally {
        setUploadingCertPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!password) return;

    try {
      const res = await fetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem("admin_token", data.token);
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
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setMessages([]);
    showStatus("Logged out successfully.");
  };

  // --- Messages Operations ---
  const markMessageRead = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/messages/${id}/read`), {
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
      const res = await fetch(getApiUrl(`/api/admin/messages/${id}`), {
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

  const draftAIReply = async (messageId: string) => {
    setDraftingMessageId(messageId);
    try {
      const res = await fetch(getApiUrl(`/api/admin/messages/${messageId}/draft`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setReplyTexts(prev => ({ ...prev, [messageId]: data.draft }));
        showStatus("AI response drafted with Gemini.");
      } else {
        showStatus(data.error || "Failed to draft AI response.", true);
      }
    } catch (err) {
      showStatus("Network error generating reply draft.", true);
    } finally {
      setDraftingMessageId(null);
    }
  };

  const sendReply = async (messageId: string) => {
    const text = replyTexts[messageId];
    if (!text || !text.trim()) {
      showStatus("Reply message cannot be empty.", true);
      return;
    }
    setReplyingMessageId(messageId);
    try {
      const res = await fetch(getApiUrl(`/api/admin/messages/${messageId}/reply`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage: text })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setReplyTexts(prev => ({ ...prev, [messageId]: "" }));
        
        if (data.emailSent) {
          if (data.previewUrl) {
            showStatus(`Reply saved! Sandbox test email ready at: ${data.previewUrl}`);
            window.open(data.previewUrl, "_blank");
          } else {
            showStatus("Reply saved & emailed successfully to recipient via Resend API!");
          }
        } else {
          showStatus("Reply saved locally, but email dispatch failed. Please verify credentials.", true);
        }
        
        loadAllAdminData();
      } else {
        showStatus(data.error || "Failed to transmit reply.", true);
      }
    } catch (err) {
      showStatus("Error transmitting reply.", true);
    } finally {
      setReplyingMessageId(null);
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
      const res = await fetch(getApiUrl(url), {
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
      const res = await fetch(getApiUrl(`/api/admin/projects/${id}`), {
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
    setSkills(updated);
  };

  const saveSkills = async (updatedList = skills) => {
    try {
      const res = await fetch(getApiUrl("/api/admin/skills"), {
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
      const isEdit = !!editingCert;
      const url = isEdit 
        ? getApiUrl(`/api/admin/certifications/${editingCert.id}`)
        : getApiUrl("/api/admin/certifications");
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCert)
      });
      if (res.ok) {
        showStatus(isEdit ? "Certification updated successfully!" : "Certification added successfully!");
        setNewCert({ title: "", issuer: "", link: "", imageUrl: "" });
        setEditingCert(null);
        loadAllAdminData();
      } else {
        showStatus(isEdit ? "Failed to update certification." : "Failed to save certification.", true);
      }
    } catch (err) {
      showStatus("Error communicating with certification API.", true);
    }
  };

  const startEditCertification = (cert: CertificationItem) => {
    setEditingCert(cert);
    setNewCert({
      title: cert.title,
      issuer: cert.issuer,
      link: cert.link,
      imageUrl: cert.imageUrl || ""
    });
  };

  const cancelEditCertification = () => {
    setEditingCert(null);
    setNewCert({ title: "", issuer: "", link: "", imageUrl: "" });
  };

  const deleteCertification = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Remove this certification from credentials pathway?")) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/certifications/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showStatus("Certification deleted.");
        if (editingCert?.id === id) {
          cancelEditCertification();
        }
        loadAllAdminData();
      }
    } catch (err) {
      showStatus("Error deleting certification.", true);
    }
  };

  // --- Recharts Helper Computations ---
  const getSkillsChartData = () => {
    return skills.map(cat => {
      const avgLevel = cat.skills.length > 0 
        ? Math.round(cat.skills.reduce((sum, s) => sum + s.level, 0) / cat.skills.length)
        : 0;
      return {
        category: cat.category.split(" ")[0], // abbreviate for display label
        "Avg Level": avgLevel,
        "Skills Count": cat.skills.length
      };
    });
  };

  const getTimelineData = () => {
    // Generate a reliable dataset grouped by recent dates or standard placeholder with live message count
    const baseDates = [
      { date: "July 1", inquiries: 1, views: 12 },
      { date: "July 2", inquiries: 2, views: 24 },
      { date: "July 3", inquiries: 0, views: 18 },
      { date: "July 4", inquiries: 4, views: 32 },
      { date: "July 5", inquiries: 3, views: 40 },
      { date: "July 6", inquiries: Math.max(1, messages.length), views: 52 }
    ];

    // If there is real message date grouping, let's inject it
    if (messages.length > 0) {
      const datesMap: { [key: string]: number } = {};
      messages.forEach(m => {
        try {
          const dateStr = new Date(m.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
          datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
        } catch (e) {}
      });
      const keys = Object.keys(datesMap).slice(-6);
      if (keys.length > 1) {
        return keys.map((key, index) => ({
          date: key,
          inquiries: datesMap[key],
          views: 15 + index * 10
        }));
      }
    }
    return baseDates;
  };

  return (
    <div id="admin_workspace_container" className="fixed inset-0 z-50 bg-[#060814]/98 overflow-y-auto font-sans flex flex-col selection:bg-purple-900 selection:text-white">
      {/* Top Banner Header */}
      <div id="admin_banner_header" className="border-b border-slate-900/80 bg-slate-950/80 px-6 py-4 sticky top-0 z-40 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-sans font-bold shadow-md shadow-indigo-950/20">
            R
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">Portfolio Control Center</h1>
            <p className="text-xs text-indigo-400 font-sans">Administrator Management Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <button
              id="refresh_data_btn"
              onClick={loadAllAdminData}
              title="Refresh Workspace Data"
              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : ""} />
            </button>
          )}
          <button
            id="close_workspace_btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-sans text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X size={12} />
            <span>Exit Workspace</span>
          </button>
        </div>
      </div>

      {/* Login Screen (If No Token Set) */}
      {!token ? (
        <div id="admin_login_box" className="flex-1 flex items-center justify-center p-6 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="flex flex-col items-center gap-3 text-center mb-8">
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 text-indigo-400 rounded-2xl">
                <Lock size={22} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-sans">Secure Admin Login</h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Unlock editing capabilities, live client inquiries inbox, skills control, and credentials pathway management.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans text-slate-400 font-medium tracking-wide">Enter Security Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/60 border border-slate-850 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/25 transition-all rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 font-sans focus:outline-none"
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
                <div className="text-xs font-sans text-red-400 bg-red-950/20 border border-red-900/30 px-3.5 py-2.5 rounded-xl">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold text-xs font-sans rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-950/50 hover:scale-[1.01]"
              >
                Log In &rarr;
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        /* Workspace Main Body */
        <div id="admin_main_body" className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
          
          {/* Left Sidebar Navigation */}
          <div className="lg:w-64 flex flex-col gap-4 flex-shrink-0 select-none">
            <div className="bg-slate-950 border border-slate-900/90 rounded-2xl p-4 flex flex-col gap-1.5 shadow-md">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider px-3 mb-2 font-bold block">Dashboard Modules</span>
              
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "dashboard" 
                    ? "bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={13} />
                  <span>Overview Dashboard</span>
                </div>
                <span className="text-[9px] text-slate-500 font-sans">Core</span>
              </button>

              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "messages" 
                    ? "bg-blue-600 text-white font-semibold shadow shadow-blue-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={13} />
                  <span>Inbound Messages</span>
                </div>
                {messages.filter(m => !m.read).length > 0 ? (
                  <span className="bg-red-500 text-white font-sans text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    {messages.filter(m => !m.read).length}
                  </span>
                ) : (
                  <span className="text-[9px] font-sans text-slate-500">{messages.length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "projects" 
                    ? "bg-purple-600 text-white font-semibold shadow shadow-purple-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <LayoutGrid size={13} />
                <span>Projects Portfolio</span>
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "skills" 
                    ? "bg-pink-600 text-white font-semibold shadow shadow-pink-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Sliders size={13} />
                <span>Skills Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab("certifications")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "certifications" 
                    ? "bg-emerald-600 text-white font-semibold shadow shadow-emerald-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Award size={13} />
                <span>Certifications</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "profile" 
                    ? "bg-amber-600 text-white font-semibold shadow shadow-amber-500/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <User size={13} />
                <span>Profile & Resume</span>
              </button>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-950/10 hover:bg-red-950/20 border border-red-900/20 text-red-400 hover:text-red-300 font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogOut size={13} />
              <span>Log Out</span>
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
                  className={`mb-4 text-xs font-sans p-3 rounded-xl border flex items-center gap-2 shadow-md ${
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
            <div className="bg-slate-950/30 border border-slate-900 rounded-3xl p-5 sm:p-6 flex-1 shadow-inner relative flex flex-col">
              {loading && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
                  <div className="flex flex-col items-center gap-2 text-slate-400 font-sans text-xs">
                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                    <span>Synchronizing remote database...</span>
                  </div>
                </div>
              )}

              {/* 0. TAB: SYSTEM CORE DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-6 flex-1">
                  {/* Dashboard Header */}
                  <div>
                    <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-sans">
                      <Activity size={14} className="text-indigo-400" />
                      <span>System Overview Dashboard</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time statistics aggregating dynamic data streams securely.</p>
                  </div>

                  {/* Summary Metric Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
                      <span className="text-[11px] font-sans text-slate-400 tracking-wider uppercase">Inbound Inquiries</span>
                      <span className="text-2xl font-bold font-mono text-indigo-400">{messages.length}</span>
                      <span className="text-[10px] text-slate-500 font-sans">All-time count</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
                      <span className="text-[11px] font-sans text-slate-400 tracking-wider uppercase">Action Needed</span>
                      <span className="text-2xl font-bold font-mono text-blue-400">
                        {messages.filter(m => !m.read).length}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">Unread messages</span>
                      {messages.filter(m => !m.read).length > 0 && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      )}
                    </div>

                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
                      <span className="text-[11px] font-sans text-slate-400 tracking-wider uppercase">Live Projects</span>
                      <span className="text-2xl font-bold font-mono text-purple-400">{projects.length}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Featured grid works</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
                      <span className="text-[11px] font-sans text-slate-400 tracking-wider uppercase">Credentials</span>
                      <span className="text-2xl font-bold font-mono text-emerald-400">{certifications.length}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Verified path items</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col gap-1 shadow-sm col-span-2 md:col-span-1">
                      <span className="text-[11px] font-sans text-slate-400 tracking-wider uppercase">Avg Skill Scale</span>
                      <span className="text-2xl font-bold font-mono text-pink-400">
                        {skills.length > 0 
                          ? Math.round(
                              skills.reduce((sum, cat) => 
                                sum + (cat.skills.length > 0 
                                  ? cat.skills.reduce((sSum, s) => sSum + s.level, 0) / cat.skills.length 
                                  : 0)
                              , 0) / skills.length
                            )
                          : 0}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">Technical matrix depth</span>
                    </div>
                  </div>

                  {/* Visual Recharts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-[250px]">
                    {/* Inquiry engagement timeline */}
                    <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col gap-2 min-h-[220px]">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[11px] font-sans text-indigo-400 font-semibold flex items-center gap-1.5">
                          <Activity size={10} />
                          <span>Contact Volume Timeline</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">Past 6 records</span>
                      </div>
                      <div className="flex-1 min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getTimelineData()} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} stroke="#1e293b" />
                            <YAxis tick={{ fill: "#64748b", fontSize: 9 }} stroke="#1e293b" />
                            <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "10px", color: "#e2e8f0" }} />
                            <Area type="monotone" dataKey="inquiries" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInquiries)" name="Inquiries" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Skill Category breadths */}
                    <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col gap-2 min-h-[220px]">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[11px] font-sans text-pink-400 font-semibold flex items-center gap-1.5">
                          <BarChart3 size={10} />
                          <span>Technical Matrices Competency</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">Averages by category</span>
                      </div>
                      <div className="flex-1 min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getSkillsChartData()} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 9 }} stroke="#1e293b" />
                            <YAxis tick={{ fill: "#64748b", fontSize: 9 }} stroke="#1e293b" max={100} />
                            <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "10px", color: "#e2e8f0" }} />
                            <Bar dataKey="Avg Level" fill="#ec4899" radius={[4, 4, 0, 0]} name="Competency %">
                              {getSkillsChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#ec4899" : "#6366f1"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Quick System Action shortcuts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
                    <div 
                      onClick={() => setActiveTab("messages")}
                      className="border border-slate-900/60 bg-slate-950/20 hover:bg-slate-900/30 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-950/20 border border-blue-900/30 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Reply to Inquiries</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Manage inbox & generate smart AI reply drafts.</p>
                        </div>
                      </div>
                      <span className="text-slate-600 group-hover:text-blue-400 font-mono text-xs transition-colors">&rarr;</span>
                    </div>

                    <div 
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
                        setActiveTab("projects");
                      }}
                      className="border border-slate-900/60 bg-slate-950/20 hover:bg-slate-900/30 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-950/20 border border-purple-900/30 text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
                          <FolderPlus size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Append Portfolio Project</h4>
                          <p className="text-[9px] text-slate-500 font-mono">Register new featured applications to client layout grids.</p>
                        </div>
                      </div>
                      <span className="text-slate-600 group-hover:text-purple-400 font-mono text-xs transition-colors">&rarr;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. TAB: CONTACT MESSAGES LOG WITH REPLIES */}
              {activeTab === "messages" && (
                <div className="flex flex-col h-full flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6 flex-shrink-0">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-sans">
                        <Mail size={14} className="text-blue-400" />
                        <span>Received Messages Inbox</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">Inbox entries compiled dynamically with database audit logs & AI replies.</p>
                    </div>
                    <span className="text-xs font-sans bg-blue-950/40 border border-blue-900/30 text-blue-400 px-2.5 py-1 rounded-lg">
                      Messages: {messages.length}
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono border border-dashed border-slate-900 rounded-2xl">
                      <MessageSquare size={20} className="mb-2 text-slate-600 animate-pulse" />
                      <span className="text-xs">No contact entries received. All lines quiet.</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 transition-colors ${
                            msg.read 
                              ? "bg-slate-950/20 border-slate-900/60" 
                              : "bg-blue-950/5 border-blue-900/20 shadow shadow-blue-950/10"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              {!msg.read && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                              )}
                              <span className="text-xs font-bold text-slate-200">{msg.name}</span>
                              <a href={`mailto:${msg.email}`} className="text-[10px] font-mono text-indigo-400 hover:underline">
                                &lt;{msg.email}&gt;
                              </a>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans select-text bg-slate-950/40 border border-slate-900/50 p-3 rounded-xl whitespace-pre-wrap">
                            {msg.message}
                          </p>

                          {/* Render Replies Thread Log if exists */}
                          {msg.replies && msg.replies.length > 0 && (
                            <div className="flex flex-col gap-2 bg-indigo-950/5 border border-indigo-900/10 p-3 sm:p-4 rounded-xl">
                              <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase flex items-center gap-1">
                                <CheckCheck size={10} />
                                <span>REPLY_COMMUNICATION_THREAD ({msg.replies.length})</span>
                              </span>
                              <div className="flex flex-col gap-3">
                                {msg.replies.map((rep) => (
                                  <div key={rep.id} className="border-l-2 border-indigo-500/30 pl-3 py-0.5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-mono text-slate-400">Raviraj Chauhan (Admin)</span>
                                      <span className="text-[8px] font-mono text-slate-500">{new Date(rep.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{rep.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reply formulation box */}
                          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Reply size={10} />
                                <span>COMPOSE_REPLY_TRANSMISSION</span>
                              </span>
                              
                              <button
                                type="button"
                                disabled={draftingMessageId !== null}
                                onClick={() => draftAIReply(msg.id)}
                                className="px-2 py-1 bg-indigo-950/30 hover:bg-indigo-900/30 border border-indigo-900/30 text-indigo-400 hover:text-indigo-300 rounded-lg text-[9px] font-mono flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                <Sparkles size={10} className={draftingMessageId === msg.id ? "animate-spin" : ""} />
                                <span>{draftingMessageId === msg.id ? "DRAFTING..." : "AI_DRAFT"}</span>
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={replyTexts[msg.id] || ""}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [msg.id]: e.target.value })}
                              placeholder={`Formulate dynamic response message to ${msg.name}...`}
                              className="w-full bg-slate-900/40 border border-slate-850/60 focus:border-indigo-500/40 rounded-lg px-3 py-2 text-xs text-slate-200 font-sans focus:outline-none resize-none leading-relaxed"
                            />

                            <div className="flex items-center justify-between select-none">
                              <span className="text-[8px] font-mono text-slate-500">Replies are appended to message logs.</span>
                              <div className="flex items-center gap-2">
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
                                  className="px-2.5 py-1 bg-red-950/10 hover:bg-red-900/30 border border-red-900/20 text-red-400 hover:text-red-300 text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
                                >
                                  DELETE
                                </button>
                                <button
                                  onClick={() => sendReply(msg.id)}
                                  disabled={replyingMessageId !== null || !replyTexts[msg.id]?.trim()}
                                  className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 border border-indigo-500/20 text-white text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow shadow-indigo-950/20"
                                >
                                  <Send size={10} className={replyingMessageId === msg.id ? "animate-pulse" : ""} />
                                  <span>{replyingMessageId === msg.id ? "SENDING..." : "DISPATCH_REPLY"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. TAB: PROJECTS MANAGEMENT */}
              {activeTab === "projects" && (
                <div className="flex flex-col h-full flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6 flex-shrink-0">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-sans">
                        <FolderPlus size={14} className="text-purple-400" />
                        <span>Portfolio Projects</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">Control individual items within the Featured Works listing.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProject({
                          id: "project_" + Math.random().toString(36).substring(2, 7),
                          title: "",
                          subtitle: "",
                          tagline: "",
                          description: "",
                          features: [],
                          techStack: [],
                          year: new Date().getFullYear().toString(),
                          category: "Web",
                          links: { github: "", live: "" },
                          metrics: ""
                        });
                        setIsNewProject(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow shadow-purple-950/20"
                    >
                      <Plus size={12} />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {editingProject ? (
                    /* Project Edit/Create Form Overlay View */
                    <form onSubmit={saveProject} className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1.5 scrollbar-thin">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 select-none flex-shrink-0">
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
                            placeholder="99.9% Uptime, 100% Normalized DB"
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2 bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">Project Image</label>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {editingProject.imageUrl ? (
                                <img src={editingProject.imageUrl} alt="Project photo" className="w-full h-full object-cover" />
                              ) : (
                                <Image size={18} className="text-slate-700" />
                              )}
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProjectPhotoUpload}
                                className="hidden"
                                id="project-photo-file-input"
                              />
                              <label
                                htmlFor="project-photo-file-input"
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer text-center inline-block w-fit"
                              >
                                {uploadingProjectPhoto ? "UPLOADING..." : editingProject.imageUrl ? "CHANGE_IMAGE" : "UPLOAD_IMAGE"}
                              </label>
                              <span className="text-[8px] font-mono text-slate-500">Provide an image illustrating this project's interface or outcome.</span>
                            </div>
                          </div>
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
                          <label className="text-[9px] font-mono text-slate-500 uppercase">PROJECT CATEGORY</label>
                          <select
                            value={editingProject.category || "Web"}
                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                            className="bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/40 cursor-pointer"
                          >
                            <option value="Web" className="bg-slate-950">Web</option>
                            <option value="App" className="bg-slate-950">App</option>
                          </select>
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

                      <div className="flex items-center gap-3 mt-4 justify-end flex-shrink-0">
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
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
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
                <div className="flex flex-col h-full flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6 flex-shrink-0">
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

                  <div className="flex-1 flex flex-col gap-6 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
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
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 flex-shrink-0"
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
                <div className="flex flex-col h-full flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6 flex-shrink-0">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <Award size={14} className="text-emerald-400" />
                        <span>CREDENTIAL_REGISTRY_CATALOGUE</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Publish verify links for professional accreditations on credentials timeline.</p>
                    </div>
                  </div>

                  {/* Cert creation form */}
                  <form onSubmit={saveCertification} className="bg-slate-950/45 border border-slate-900 p-4 rounded-2xl mb-6 flex flex-col gap-4 flex-shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {editingCert ? "// EDIT_EXISTING_CREDENTIAL" : "// REGISTER_NEW_CREDENTIAL"}
                    </span>
                    
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

                      <div className="flex flex-col gap-1 md:col-span-3 bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Certification Image/Photo</label>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {newCert.imageUrl ? (
                              <img src={newCert.imageUrl.startsWith("/") ? getApiUrl(newCert.imageUrl) : newCert.imageUrl} alt="Certification photo" className="w-full h-full object-cover" />
                            ) : (
                              <Award size={18} className="text-slate-700" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col gap-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCertPhotoUpload}
                              className="hidden"
                              id="cert-photo-file-input"
                            />
                            <label
                              htmlFor="cert-photo-file-input"
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer text-center inline-block w-fit"
                            >
                              {uploadingCertPhoto ? "UPLOADING..." : newCert.imageUrl ? "CHANGE_IMAGE" : "UPLOAD_IMAGE"}
                            </label>
                            <span className="text-[8px] font-mono text-slate-500">Provide an image demonstrating this credential (e.g. badge, logo, certificate scan).</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 self-end">
                      {editingCert && (
                        <button
                          type="button"
                          onClick={cancelEditCertification}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          CANCEL_EDIT
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`px-4 py-2 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow ${
                          editingCert 
                            ? "bg-purple-600 hover:bg-purple-500 shadow-purple-950/20" 
                            : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20"
                        }`}
                      >
                        {editingCert ? <Save size={12} /> : <Plus size={12} />}
                        <span>{editingCert ? "UPDATE_CREDENTIAL" : "REGISTER_CREDENTIAL"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Cert list */}
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg border border-slate-900 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {cert.imageUrl ? (
                              <img src={cert.imageUrl.startsWith("/") ? getApiUrl(cert.imageUrl) : cert.imageUrl} alt="Cert icon" className="w-full h-full object-cover" />
                            ) : (
                              <Award size={14} className="text-slate-700" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">{cert.issuer}</span>
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{cert.title}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 select-none">
                          <button
                            type="button"
                            onClick={() => startEditCertification(cert)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-purple-400 rounded-lg transition-all cursor-pointer"
                            title="Edit Certification"
                          >
                            <Edit3 size={11} />
                          </button>
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Verify Certification"
                          >
                            <ExternalLink size={11} />
                          </a>
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            title="Delete Certification"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TAB: PROFILE & ASSETS */}
              {activeTab === "profile" && (
                <div className="flex flex-col h-full flex-1">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-6 flex-shrink-0">
                    <div>
                      <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <User size={14} className="text-amber-400" />
                        <span>PROFILE_ASSETS_REPOSITORY</span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Manage and upload high-fidelity assets like profile picture and professional resume.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
                    {/* PROFILE PICTURE CARD */}
                    <div className="bg-slate-950/45 border border-slate-900 p-5 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                          <Image size={11} />
                          <span>// PROFILE_PICTURE_AVATAR</span>
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 transition-all relative group">
                        {profile.photoUrl ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <img
                                src={profile.photoUrl.startsWith("/") ? getApiUrl(profile.photoUrl) : profile.photoUrl}
                                alt="Profile Avatar"
                                referrerPolicy="no-referrer"
                                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/20 shadow-md shadow-amber-950/20"
                              />
                              <button
                                onClick={async () => {
                                  const updated = { ...profile, photoUrl: "" };
                                  setProfile(updated);
                                  await saveProfile(updated);
                                }}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-400 text-white rounded-full transition-all cursor-pointer shadow"
                                title="Remove Image"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 text-center break-all select-all px-2 bg-slate-950/40 py-1 rounded">
                              {profile.photoUrl}
                            </span>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer w-full py-4 text-center select-none">
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 text-amber-400 rounded-xl">
                              {uploadingPhoto ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                            </div>
                            <span className="text-xs text-slate-300 font-semibold">
                              {uploadingPhoto ? "Uploading Image..." : "Upload Profile Photo"}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">PNG, JPG or WEBP up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "photoUrl")}
                              disabled={uploadingPhoto}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">DIRECT PHOTO URL (FALLBACK)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/photo.jpg"
                            value={profile.photoUrl}
                            onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                            className="flex-1 bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/40 font-mono"
                          />
                          <button
                            onClick={() => saveProfile()}
                            className="px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer"
                          >
                            <Save size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RESUME DOCUMENT CARD */}
                    <div className="bg-slate-950/45 border border-slate-900 p-5 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1">
                          <FileText size={11} />
                          <span>// CURRICULUM_VITAE_RESUME</span>
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 transition-all relative group">
                        {profile.resumeUrl ? (
                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="p-3 bg-blue-950/20 border border-blue-900/30 text-blue-400 rounded-xl relative">
                              <FileText size={24} />
                              <button
                                onClick={async () => {
                                  const updated = { ...profile, resumeUrl: "" };
                                  setProfile(updated);
                                  await saveProfile(updated);
                                }}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-400 text-white rounded-full transition-all cursor-pointer shadow"
                                title="Remove Resume"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <span className="text-xs text-slate-200 font-bold max-w-xs text-center truncate">
                              {profile.resumeUrl.split("/").pop()}
                            </span>
                            <div className="flex gap-2">
                              <a
                                href={profile.resumeUrl.startsWith("/") ? getApiUrl(profile.resumeUrl) : profile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                              >
                                <ExternalLink size={10} />
                                <span>VIEW_DOC</span>
                              </a>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 text-center break-all select-all px-2 bg-slate-950/40 py-1 rounded">
                              {profile.resumeUrl}
                            </span>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer w-full py-4 text-center select-none">
                            <div className="p-3 bg-blue-950/20 border border-blue-900/30 text-blue-400 rounded-xl">
                              {uploadingResume ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                            </div>
                            <span className="text-xs text-slate-300 font-semibold">
                              {uploadingResume ? "Storing Document..." : "Upload Resume PDF"}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">PDF, DOC or DOCX up to 10MB</span>
                            <input
                              type="file"
                              accept="application/pdf,.docx,.doc"
                              onChange={(e) => handleFileUpload(e, "resumeUrl")}
                              disabled={uploadingResume}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">DIRECT RESUME URL (FALLBACK)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/resume.pdf"
                            value={profile.resumeUrl}
                            onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                            className="flex-1 bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/40 font-mono"
                          />
                          <button
                            onClick={() => saveProfile()}
                            className="px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer"
                          >
                            <Save size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
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
