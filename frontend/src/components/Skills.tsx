import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SKILL_CATEGORIES } from "../data";
import { 
  Server, 
  Database, 
  Layers, 
  Cpu, 
  Code, 
  ShieldCheck,
  Terminal,
  FileJson,
  Globe,
  Layout,
  Sparkles,
  Workflow,
  GitBranch,
  Compass,
  Box,
  Check,
  Terminal as TermIcon,
  Braces
} from "lucide-react";
import { getApiUrl } from "../lib/api";

// Helper to determine skill type dynamically for robust filtering
const getSkillType = (skillName: string, categoryName: string): "frontend" | "backend" | "tools" => {
  const cat = categoryName.toLowerCase();
  const name = skillName.toLowerCase();
  
  if (cat.includes("frontend")) return "frontend";
  if (cat.includes("database") || cat.includes("backend") || cat.includes("api")) return "backend";
  if (cat.includes("tool") || cat.includes("extra")) return "tools";
  
  // Explicit overrides
  if (["javascript", "html5 / css3", "tailwind css", "bootstrap", "angularjs"].includes(name)) return "frontend";
  if (["git / github", "postman", "wamp"].includes(name)) return "tools";
  return "backend"; // Languages default to backend
};

// Skill name to icon map helper
const getSkillIcon = (skillName: string) => {
  const name = skillName.toLowerCase();
  if (name.includes("python")) return <Terminal size={14} className="text-blue-400" />;
  if (name.includes("javascript") || name.includes("js")) return <Code size={14} className="text-yellow-400" />;
  if (name.includes("java") && !name.includes("script")) return <Cpu size={14} className="text-red-400" />;
  if (name.includes("php")) return <FileJson size={14} className="text-indigo-400" />;
  if (name.includes("c / c++") || name.includes("c++") || name.includes("c ")) return <Cpu size={14} className="text-blue-500" />;
  
  if (name.includes("django")) return <Server size={14} className="text-emerald-400" />;
  if (name.includes("api") || name.includes("rest")) return <Workflow size={14} className="text-purple-400" />;
  if (name.includes("jwt") || name.includes("auth") || name.includes("rbac")) return <ShieldCheck size={14} className="text-amber-400" />;
  
  if (name.includes("angular")) return <Layout size={14} className="text-red-500" />;
  if (name.includes("html") || name.includes("css")) return <Globe size={14} className="text-orange-400" />;
  if (name.includes("tailwind")) return <Sparkles size={14} className="text-cyan-400" />;
  if (name.includes("bootstrap")) return <Layers size={14} className="text-purple-500" />;
  
  if (
    name.includes("mysql") || 
    name.includes("sql") || 
    name.includes("sqlite") || 
    name.includes("db") || 
    name.includes("mongo")
  ) {
    return <Database size={14} className="text-teal-400" />;
  }
  
  if (name.includes("git")) return <GitBranch size={14} className="text-orange-500" />;
  if (name.includes("postman")) return <Compass size={14} className="text-orange-400" />;
  if (name.includes("node")) return <Server size={14} className="text-green-500" />;
  if (name.includes("express")) return <Workflow size={14} className="text-slate-300" />;
  if (name.includes("wamp")) return <Box size={14} className="text-pink-400" />;

  return <Box size={14} className="text-slate-400" />;
};

export default function Skills() {
  const [skillCategories, setSkillCategories] = useState(SKILL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<"all" | "frontend" | "backend" | "tools">("all");

  useEffect(() => {
    fetch(getApiUrl("/api/skills"))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkillCategories(data);
        }
      })
      .catch((err) => console.error("Error fetching skills dynamically:", err));
  }, []);

  // Flatten and process skills dynamically
  const allSkills = skillCategories.flatMap((cat) => 
    cat.skills.map((skill) => ({
      ...skill,
      categoryName: cat.category,
      type: getSkillType(skill.name, cat.category)
    }))
  );

  // Keep skill names unique (in case of overlaps)
  const uniqueSkillsMap = new Map<string, typeof allSkills[0]>();
  allSkills.forEach(skill => {
    if (!uniqueSkillsMap.has(skill.name)) {
      uniqueSkillsMap.set(skill.name, skill);
    }
  });
  const uniqueSkillsList = Array.from(uniqueSkillsMap.values());

  // Filter skills based on selected active category tab
  const filteredSkills = uniqueSkillsList.filter((skill) => {
    if (activeTab === "all") return true;
    return skill.type === activeTab;
  });

  const tabOptions: { id: "all" | "frontend" | "backend" | "tools"; label: string; icon: any }[] = [
    { id: "all", label: "All Skills", icon: Braces },
    { id: "frontend", label: "Frontend", icon: Layers },
    { id: "backend", label: "Backend", icon: Server },
    { id: "tools", label: "Tools & Git", icon: GitBranch },
  ];

  return (
    <section id="skills" className="py-24 px-6 relative z-10 w-full max-w-5xl mx-auto scroll-mt-20">
      {/* Section Headings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-900/30 text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-widest select-none">
          <ShieldCheck size={12} className="text-indigo-400" />
          <span>Technical Toolkit</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
          Skills & Core Architecture
        </h2>
        <p className="text-sm sm:text-base font-sans text-slate-300 max-w-2xl leading-relaxed mt-1">
          Explore a granular index of my tech stack, sorted by architecture. Select a header tab to filter skills instantly.
        </p>
        <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-1" />
      </motion.div>

      {/* Modern Filter Tab Selector Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-2xl mx-auto p-1.5 bg-[#070b16]/75 border border-slate-900/80 rounded-2xl shadow-xl backdrop-blur-md">
        {tabOptions.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider font-semibold uppercase rounded-xl transition-all duration-300 select-none cursor-pointer ${
                isActive 
                  ? "text-white" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSkillTab"
                  className="absolute inset-0 bg-indigo-950/35 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <IconComponent size={12} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fluid Filled-Pill Badges Skill list */}
      <motion.div 
        layout
        className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto min-h-[140px]"
      >
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, index) => {
            const skillLevel = skill.level || 80;
            const levelLabel = skillLevel >= 90 ? "Expert" : skillLevel >= 82 ? "Advanced" : "Proficient";
            
            return (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.015 }}
                className="bg-[#0f1426] hover:bg-[#141b34] border border-[#1e274a] hover:border-indigo-500/50 px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg shadow-black/30 select-none group hover:-translate-y-0.5"
              >
                {/* Skill Icon */}
                <div className="p-2 bg-[#060810] rounded-xl border border-slate-900/80 group-hover:scale-105 transition-transform duration-300 shrink-0 flex items-center justify-center">
                  {getSkillIcon(skill.name)}
                </div>

                {/* Skill Details */}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-100 font-sans tracking-wide">
                    {skill.name}
                  </span>
                  <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold tracking-wider mt-0.5">
                    {levelLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
