import React from "react";
import { motion } from "motion/react";
import { Award, BookOpen, GraduationCap, MapPin, Briefcase, Github, Linkedin, ExternalLink, Code, Cpu, Database, Activity } from "lucide-react";
import { RESUME_DATA } from "../data";

export default function About() {
  const stats = [
    { label: "Engineering", value: "4+ Years", icon: Cpu, desc: "BCA & MCA Applied" },
    { label: "Full-Stack Apps", value: "10+", icon: Code, desc: "APIs & Web Interfaces" },
    { label: "REST APIs", value: "100%", icon: Database, desc: "Secure Standards" },
    { label: "Uptime SLA", value: "99.9%", icon: Activity, desc: "Production Readiness" },
  ];

  return (
    <section id="about" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Headings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-2 mb-16 text-center md:text-left"
      >
        <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">
          01 // WHO IS RAVIRAJ?
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          The Developer Journey
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto md:mx-0 mt-2" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left Side: Animated Abstract Geometric Node and Stats Grid */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-5 flex flex-col gap-6"
        >
          {/* Animated SVG Abstract Shape */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-64 shadow-xl backdrop-blur-md select-none group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
            
            {/* Spinning vector geometry */}
            <motion.svg
              width="150"
              height="150"
              viewBox="0 0 100 100"
              className="text-blue-500/40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <motion.polygon
                points="50,20 75,65 25,65"
                stroke="#a855f7"
                strokeWidth="1"
                fill="none"
                animate={{ rotate: -360 }}
                style={{ transformOrigin: "50px 50px" }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              />
              <circle cx="50" cy="20" r="3" fill="#3b82f6" />
              <circle cx="75" cy="65" r="3" fill="#06b6d4" />
              <circle cx="25" cy="65" r="3" fill="#a855f7" />
            </motion.svg>

            <div className="mt-4 text-center">
              <span className="text-[10px] font-mono text-purple-400 tracking-wider block">KINETIC ENGINE</span>
              <span className="text-xs text-slate-400 mt-1 block font-mono">Dynamic Full-Stack Architectures</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, borderColor: "rgba(139, 92, 246, 0.4)" }}
                  className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-2 shadow-md backdrop-blur-md transition-all duration-300"
                >
                  <div className="p-2 w-fit bg-slate-900 border border-slate-800 rounded-lg text-blue-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-sans text-white block">
                      {stat.value}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 block font-semibold mt-0.5">
                      {stat.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {stat.desc}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Side: Professional Biography */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-7 flex flex-col gap-6"
        >
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-mono text-purple-400 flex items-center gap-2">
              <span>&gt; RAVIRAJ.md</span>
              <span className="w-1.5 h-4 bg-purple-500 animate-pulse inline-block" />
            </h3>

            <div className="text-slate-300 text-sm sm:text-base leading-relaxed flex flex-col gap-4">
              <p>
                Hello! I am <strong className="text-white">Raviraj Chauhan</strong>, a highly driven software engineer currently pursuing my Master of Computer Application (MCA) at CHARUSAT. I find absolute joy in writing neat, highly optimized backend code, architecting clean databases, and designing intuitive user interfaces that load instantly.
              </p>
              <p>
                My full-stack development journey has been defined by a deep curiosity for backend mechanics. Using <strong className="text-white">Python, Django, and Django REST Framework</strong>, I love building role-based web platforms containing secure API endpoints, robust JWT authentications, and optimized SQL search engines.
              </p>
              <p>
                A signature highlight of my project collection is <strong className="text-blue-400">EduTrack</strong> — a role-based learning management system featuring separated, responsive student/instructor workspaces, comprehensive homework submittals, grading feedback structures, and advanced database normalization.
              </p>
            </div>

            {/* Quick Profile Meta Rows */}
            <div className="flex flex-col gap-4 border-t border-slate-900 pt-6 mt-2 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <MapPin size={14} className="text-blue-400 shrink-0" />
                  <span>Botad, Gujarat, India</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <GraduationCap size={14} className="text-purple-400 shrink-0" />
                  <span>CHARUSAT, Anand (MCA)</span>
                </div>
              </div>

              {/* Interactive pages links */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 pt-4 border-t border-slate-900/40">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CONNECT CHANNELS:</span>
                <a
                  href={RESUME_DATA.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl transition-all"
                >
                  <Github size={12} className="text-slate-400" />
                  <span>GitHub</span>
                  <ExternalLink size={10} className="text-slate-600 group-hover:text-slate-300" />
                </a>
                <a
                  href={RESUME_DATA.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl transition-all"
                >
                  <Linkedin size={12} className="text-purple-400" />
                  <span>LinkedIn</span>
                  <ExternalLink size={10} className="text-slate-600 group-hover:text-slate-300" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
