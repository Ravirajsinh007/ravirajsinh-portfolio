import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Preloader from "./components/Preloader";
import Canvas3D from "./components/Canvas3D";
import Hero from "./components/Hero";
import About from "./components/About";
import MetricsBar from "./components/MetricsBar";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Journey from "./components/Journey";
import Contact from "./components/Contact";
import Dock from "./components/Dock";
import FloatingChatbot from "./components/FloatingChatbot";
import AdminPanel from "./components/AdminPanel";
import { RESUME_DATA } from "./data";
import { Github, Linkedin, Instagram, Heart, ChevronUp, Cpu, Server, Database, Globe, ArrowUpRight, Lock, User, FolderKanban, Briefcase, Mail } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("about");
  const [showAdmin, setShowAdmin] = useState(false);

  const handleCloseAdmin = () => {
    setShowAdmin(false);
  };
 useEffect(() => {
    if (loading) return;

    const handleScrollSpy = () => {
      const sections = ["about", "skills", "projects", "journey", "contact"];
      let currentActive = "about";
      let minDistance = Infinity;

      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Calculate distance from the focal zone (about 25% of the viewport height down from the top)
          const focalPoint = window.innerHeight * 0.25;
          const distance = Math.abs(rect.top - focalPoint);

          // If the section is substantially in the focal range
          if (rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.2) {
            if (distance < minDistance) {
              minDistance = distance;
              currentActive = id;
            }
          }
        }
      }

      // Robust override: if scrolled to the absolute bottom of the page, force "contact" to be active
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 95) {
        currentActive = "contact";
      }

      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    // Run an initial tick to set the state immediately
    handleScrollSpy();

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
    };
  }, [loading]);

  const handleExplore = () => {
    const aboutEl = document.getElementById("about");
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 overflow-x-hidden selection:bg-purple-900/50 selection:text-white">
      <AnimatePresence mode="wait">
        {loading ? (
          <Preloader onComplete={() => setLoading(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col justify-between"
          >
            {/* Background 3D Particle/Node Canvas */}
            <Canvas3D activeSection={activeSection} />

            {/* Sticky Header Nav with Academic Info & Profiles */}
            <header className="fixed top-0 inset-x-0 z-30 bg-[#070913]/60 backdrop-blur-md border-b border-slate-900/40 select-none px-6 py-4">
              <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
                
                {/* Brand / Name Logo */}
                <div onClick={handleScrollToTop} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-950/20 text-white font-mono font-bold text-sm">
                    R
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-semibold text-slate-200 tracking-wider">
                      RAVIRAJ CHAUHAN
                    </span>
                    <span className="text-[9px] font-mono text-purple-400">
                      FULL-STACK PORTFOLIO
                    </span>
                  </div>
                </div>

                {/* Profiles & Contact Header Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={RESUME_DATA.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href={RESUME_DATA.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <Linkedin size={16} />
                  </a>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/20 hover:bg-purple-950/30 border border-purple-900/30 text-[10px] font-mono text-purple-300 rounded-lg tracking-wider transition-all cursor-pointer font-bold"
                  >
                    HIRE ME &rarr;
                  </button>
                </div>
              </div>
            </header>

            {/* Sections Wrapper */}
            <main className="flex-1 flex flex-col w-full relative z-10 overflow-visible">
              <Hero onExploreClick={handleExplore} />
              <MetricsBar />
              <About />
              <Skills />
              <Projects />
              <Journey />
              <Contact />
            </main>

            {/* Sticky bottom dock style navbar */}
            <Dock activeSection={activeSection} setActiveSection={setActiveSection} />

            {/* Global Floating AI Recruiter Chatbot widget */}
            <FloatingChatbot />

            {/* Administrative Panel Overlay */}
            <AnimatePresence>
              {showAdmin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50"
                >
                  <AdminPanel onClose={handleCloseAdmin} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium, High-Fidelity Professional Engineering Footer */}
            <footer className="relative bg-slate-950 border-t border-slate-900 pt-16 pb-32 px-6 select-none z-10">
              <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
                
                {/* Top Section: Branding, Stack summary & Sitemap */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Footer Brand Pitch */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-mono font-bold text-sm">
                        R
                      </div>
                      <span className="text-sm font-bold text-white font-sans tracking-wide">
                        Raviraj Chauhan
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm">
                      A production-minded Full-Stack Engineer specializing in scalable Python & Django backends, RESTful APIs, relational databases, and clean modern user interfaces.
                    </p>
                    <div className="flex items-center gap-3.5 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SYSTEMS_OPERATIONAL</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        Botad, Gujarat, India
                      </span>
                    </div>
                  </div>

                  {/* Sitemap Navigation */}
                  <div className="md:col-span-3 flex flex-col gap-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">NAVIGATION</span>
                    <ul className="flex flex-col gap-2.5 text-xs font-mono">
                      {["about", "skills", "projects", "journey", "contact"].map((sec) => {
                        const getIcon = (id: string) => {
                          switch (id) {
                            case "about": return <User size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />;
                            case "skills": return <Cpu size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />;
                            case "projects": return <FolderKanban size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />;
                            case "journey": return <Briefcase size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />;
                            case "contact": return <Mail size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />;
                            default: return null;
                          }
                        };
                        return (
                          <li key={sec}>
                            <button
                              onClick={() => scrollToSection(sec)}
                              className="text-slate-400 hover:text-blue-400 transition-colors uppercase text-left cursor-pointer flex items-center gap-2 group"
                            >
                              {getIcon(sec)}
                              <span className="font-sans font-medium text-xs tracking-wide">{sec.toUpperCase()}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Professional Social Connections */}
                  <div className="md:col-span-4 flex flex-col gap-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">PROFESSIONAL PLATFORMS</span>
                    <div className="flex flex-col gap-2.5">
                      <a
                        href={RESUME_DATA.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition-colors group cursor-pointer"
                      >
                        <Github size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span>GitHub Profile</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                      </a>
                      <a
                        href={RESUME_DATA.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs font-mono text-slate-400 hover:text-purple-400 transition-colors group cursor-pointer"
                      >
                        <Linkedin size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                        <span>LinkedIn Connection</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                      </a>
                      <a
                        href="https://instagram.com/raviraj_chauhan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs font-mono text-slate-400 hover:text-pink-400 transition-colors group cursor-pointer"
                      >
                        <Instagram size={14} className="text-slate-500 group-hover:text-pink-400 transition-colors" />
                        <span>Instagram Feed</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-all ml-1" />
                      </a>
                    </div>
                  </div>

                </div>

                {/* Divider Line */}
                <div className="h-[1px] w-full bg-slate-900" />

                {/* Bottom Section: Copyright, Location info, and Back to Top */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Copyright notice */}
                  <div className="flex flex-col gap-2.5 text-center sm:text-left select-text">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs text-slate-300 font-sans font-medium">
                        Designed & Engineered with Precision by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-bold">Raviraj Chauhan</span>
                      </span>
                      <button
                        onClick={() => setShowAdmin(true)}
                        title="Access Administration Dashboard"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-inner ml-1 cursor-pointer"
                      >
                        <Lock size={10} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono tracking-wider flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <span>&copy; {new Date().getFullYear()} Raviraj Chauhan.</span>
                      <span className="text-slate-700 font-light">|</span>
                      <span className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">ALL SYSTEMS INTEGRATED & SECURED</span>
                    </p>
                  </div>

                  {/* Action row & Back to Top */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleScrollToTop}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
                      title="Scroll to Top"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>

                </div>

              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
