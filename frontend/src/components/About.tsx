import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, BookOpen, GraduationCap, MapPin, Briefcase, Github, Linkedin, ExternalLink, Code, Cpu, Database, Activity, FileDown, Heart, Flame, Shield, Terminal, Zap, CheckCircle2 } from "lucide-react";
import { RESUME_DATA } from "../data";
import { getApiUrl } from "../lib/api";

export default function About() {
  const [profile, setProfile] = useState<{ photoUrl: string; resumeUrl: string } | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/profile"))
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.photoUrl || data.resumeUrl)) {
          setProfile(data);
        }
      })
      .catch((err) => console.error("Error fetching profile inside About.tsx:", err));
  }, []);

  const corePrinciples = [
    {
      icon: <Zap className="text-amber-400" size={16} />,
      title: "API Performance",
      description: "Designing low-latency Python/Django REST API payloads with lightweight caching and rapid responses."
    },
    {
      icon: <Database className="text-blue-400" size={16} />,
      title: "Data Normalization",
      description: "Writing high-fidelity database structures with strict foreign key constraints, index tracking, and clean relations."
    },
    {
      icon: <Shield className="text-purple-400" size={16} />,
      title: "Robust Security",
      description: "Implementing secure JWT bearer state controls, safe environment routing, and strict role-based access logs."
    }
  ];

  return (
    <section id="about" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Section Headings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center md:items-start gap-4.5 mb-16 text-center md:text-left"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/45 border border-blue-900/35 text-[10px] font-mono font-bold uppercase text-blue-400 tracking-widest select-none">
          <Terminal size={12} className="text-blue-400 animate-pulse" />
          <span>About Me Overview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
          Who is Raviraj?
        </h2>
        <p className="text-sm sm:text-base font-sans text-slate-300 max-w-2xl leading-relaxed mt-1">
          A diligent software engineer combining strong theoretical foundations from Charusat University with verified full-stack implementation expertise.
        </p>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto md:mx-0 mt-1" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
        {/* Left Column: Glassmorphic ID Card style */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 flex"
        >
          <div className="relative w-full bg-slate-950/45 border border-slate-900/95 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden group">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />

            <div className="flex flex-col gap-6 relative z-10">
              {/* Profile Card Header with live indicator */}
              <div className="flex items-center gap-4 border-b border-slate-900 pb-5">
                <div className="relative">
                  {/* Glowing background ring */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-85 transition-opacity duration-300" />
                  {profile?.photoUrl ? (
                    <img
                      src={profile.photoUrl.startsWith("/") ? getApiUrl(profile.photoUrl) : profile.photoUrl}
                      alt="Raviraj Chauhan"
                      referrerPolicy="no-referrer"
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-800 shadow-md"
                    />
                  ) : (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-xl sm:text-2xl shadow-inner">
                      RC
                    </div>
                  )}
                  {/* Pulse online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                </div>

                <div>
                  <h3 className="text-md sm:text-lg font-bold text-white tracking-wide font-sans">
                    Raviraj Chauhan
                  </h3>
                  <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mt-0.5">
                    MCA Student
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    CHARUSAT University
                  </p>
                </div>
              </div>

              {/* Bio Details List */}
              <div className="flex flex-col gap-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-900/60 rounded-lg text-blue-400 mt-0.5 border border-slate-800/60 shrink-0">
                    <MapPin size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Location</span>
                    <span className="text-xs text-slate-300 font-sans font-medium">Botad, Gujarat, India</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-900/60 rounded-lg text-emerald-400 mt-0.5 border border-slate-800/60 shrink-0">
                    <Briefcase size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Availability</span>
                    <span className="text-xs text-emerald-400 font-sans font-semibold">Available for Internships & Projects</span>
                  </div>
                </div>

                {/* Passion */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-900/60 rounded-lg text-purple-400 mt-0.5 border border-slate-800/60 shrink-0">
                    <Flame size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Passion</span>
                    <span className="text-xs text-slate-300 font-sans leading-snug">Optimized Python, Django APIs & Secure Backend Architecture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social handles and actions inside the profile card */}
            <div className="border-t border-slate-900/80 pt-5 mt-6 relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Channels</span>
                <div className="flex items-center gap-2">
                  <a
                    href={RESUME_DATA.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-900 border border-slate-850 hover:border-purple-500/30 text-slate-400 hover:text-white rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                    title="GitHub Profile"
                  >
                    <Github size={14} />
                  </a>
                  <a
                    href={RESUME_DATA.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-900 border border-slate-850 hover:border-purple-500/30 text-slate-400 hover:text-white rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                    title="LinkedIn Profile"
                  >
                    <Linkedin size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Sleek & Attractive Interactive-looking Bio Panel */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-7 flex flex-col justify-between gap-6"
        >
          {/* Mock Terminal Window Wrapper */}
          <div className="bg-slate-950/30 border border-slate-900/95 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col gap-6 h-full justify-between relative overflow-hidden group hover:border-slate-850 transition-colors">
            {/* Upper Right Terminal Accents */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">SYSTEM_SHELL &gt; RAVIRAJ.md</span>
                <span className="w-1.5 h-3 bg-purple-500 animate-pulse inline-block" />
              </div>

              <div className="text-slate-300 text-sm sm:text-base leading-relaxed flex flex-col gap-5 font-sans">
                <p>
                  I'm an engineering student pursuing my <strong className="text-white font-semibold">Master of Computer Applications (MCA)</strong>. I build cleanly structured databases, secure JSON API systems, and lightning-fast client interfaces with optimal uptime and performance.
                </p>
                <p>
                  My full-stack toolkit focuses on <strong className="text-white font-semibold">Python, Django, & Django REST Framework (DRF)</strong>. I specialize in backend decoupling, schema design, role-based controls (RBAC), and integrated systems.
                </p>
                <p className="text-xs text-slate-400 font-mono italic leading-relaxed border-l border-blue-500/30 pl-3 bg-blue-950/5 py-1.5 rounded-r-lg">
                  "I don't just write templates; I normalize architectures, optimize querying vectors, and align code to solid, production-grade security schemas."
                </p>
              </div>
            </div>

            {/* Dynamic CV Attachment Download Action */}
            {profile?.resumeUrl && (
              <div className="border-t border-slate-900 pt-5 mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider select-none">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Verified Credentials Attachment</span>
                </div>
                <a
                  href={profile.resumeUrl.startsWith("/") ? getApiUrl(profile.resumeUrl) : profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs font-sans tracking-wide transition-all shadow-lg hover:shadow-indigo-500/20 shadow-blue-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <FileDown size={14} className="text-white" />
                  <span>Download Full Resume (PDF)</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Engineering Principles Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
        {corePrinciples.map((principle, index) => (
          <motion.div
            key={principle.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-slate-950/20 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl flex flex-col gap-3 backdrop-blur-sm transition-all duration-300 group hover:shadow-[0_4px_25px_rgba(59,130,246,0.02)]"
          >
            <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850 w-fit shrink-0 group-hover:scale-105 transition-transform">
              {principle.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors font-sans">
                {principle.title}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                {principle.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

