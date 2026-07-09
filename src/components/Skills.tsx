import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SKILL_CATEGORIES } from "../data";
import SkillOrb from "./SkillOrb";
import { Code, Server, Database, Settings, Sparkles, Terminal, Layers, Cpu } from "lucide-react";

export default function Skills() {
  const [skillCategories, setSkillCategories] = useState(SKILL_CATEGORIES);

  useEffect(() => {
    fetch("/api/skills")
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "languages":
        return <Cpu size={16} className="text-blue-400" />;
      case "backend & apis":
        return <Server size={16} className="text-purple-400" />;
      case "frontend":
        return <Layers size={16} className="text-pink-400" />;
      case "databases":
        return <Database size={16} className="text-emerald-400" />;
      default:
        return <Settings size={16} className="text-slate-400" />;
    }
  };

  const getCategoryGlow = (category: string) => {
    switch (category.toLowerCase()) {
      case "languages":
        return "group-hover:border-blue-500/40 shadow-blue-950/20";
      case "backend & apis":
        return "group-hover:border-purple-500/40 shadow-purple-950/20";
      case "frontend":
        return "group-hover:border-pink-500/40 shadow-pink-950/20";
      case "databases":
        return "group-hover:border-emerald-500/40 shadow-emerald-950/20";
      default:
        return "group-hover:border-slate-500/40 shadow-slate-950/20";
    }
  };

  return (
    <section id="skills" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Headings */}
      <div className="flex flex-col gap-2 mb-16 text-center">
        <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">
          02 // TECHNICAL STACK
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          Capabilities & Core Expertise
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: 3D Interactive Orb (Fibonacci Sphere) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center lg:sticky lg:top-24">
          <div className="w-full text-center lg:text-left mb-4">
            <h3 className="text-md font-bold text-slate-100 flex items-center justify-center lg:justify-start gap-2 font-sans">
              <Sparkles size={14} className="text-purple-400" />
              <span>3D Interactive Tech Cloud</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Drag or hover over the orb to spin and focus key skills in real-time 3D space.
            </p>
          </div>
          <div className="w-full max-w-xs sm:max-w-sm bg-slate-950/20 border border-slate-900/60 rounded-3xl p-3 backdrop-blur-sm shadow-xl">
            <SkillOrb />
          </div>
        </div>

        {/* Right Side: Rebuilt Category Cards with Scroll Reveal Animations */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, type: "spring", stiffness: 100 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`bg-slate-950/45 border border-slate-900/90 rounded-2xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 flex flex-col gap-4 group ${getCategoryGlow(
                  cat.category
                )}`}
              >
                {/* Card Title Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-900/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                      {cat.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold uppercase">
                    LVL_IDX: 0{idx + 1}
                  </span>
                </div>

                {/* Inline Skills List (No Progress Bars) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {cat.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 select-none cursor-default group/skill"
                    >
                      {/* Interactive indicator dot */}
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover/skill:bg-purple-400 group-hover/skill:animate-ping transition-colors duration-200" />
                      <span className="text-xs font-mono text-slate-300 group-hover/skill:text-white transition-colors">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Custom Interactive Terminal-like Prompt Card at the end */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: skillCategories.length * 0.08 }}
              className="bg-slate-950/30 border border-dashed border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between h-[160px] md:col-span-2 shadow-inner select-none"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <Terminal size={12} className="text-purple-400 animate-pulse" />
                <span>SHELL_INTERACTIVE_META</span>
              </div>
              <div className="text-xs text-slate-400 font-mono leading-relaxed max-w-xl pl-2 border-l border-purple-500/20 py-1">
                &gt;_ Raviraj specializes in full-lifecycle REST API development. By structuring normalized MySQL/SQLite databases and configuring token-based JWT and Role-Based Access Control, he builds rock-solid backends.
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>SYSTEM: READY</span>
                <span>COMPILATION: SUCCESSFUL</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

