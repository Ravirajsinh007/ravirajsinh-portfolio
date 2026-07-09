import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Preloader from "./components/Preloader";
import Canvas3D from "./components/Canvas3D";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Journey from "./components/Journey";
import Contact from "./components/Contact";
import Dock from "./components/Dock";
import FloatingChatbot from "./components/FloatingChatbot";
import AdminPanel from "./components/AdminPanel";
import { RESUME_DATA } from "./data";
import { Github, Linkedin, Instagram, Heart, ChevronUp, Cpu, Server, Database, Globe, ArrowUpRight, Lock } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("about");
  const [showAdmin, setShowAdmin] = useState(window.location.hash === "#admin");

  // Synchronize admin panel opening on URL hash modification
  useEffect(() => {
    const handleHashChange = () => {
      setShowAdmin(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleCloseAdmin = () => {
    setShowAdmin(false);
    window.location.hash = "";
  };

  // IntersectionObserver to auto-update Bottom Dock active state on Scroll
  useEffect(() => {
    if (loading) return;

    const sections = ["about", "skills", "projects", "journey", "contact"];
    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.25, rootMargin: "-10% 0px -40% 0px" }
      );

      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.element);
      });
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
                    <ul className="flex flex-col gap-2 text-xs font-mono">
                      {["about", "skills", "projects", "journey", "contact"].map((sec) => (
                        <li key={sec}>
                          <button
                            onClick={() => scrollToSection(sec)}
                            className="text-slate-400 hover:text-blue-400 transition-colors uppercase text-left cursor-pointer flex items-center gap-1 group"
                          >
                            <span>// {sec}</span>
                            <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </li>
                      ))}
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
                  <div className="flex flex-col gap-1 text-center sm:text-left select-text">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs text-slate-350 font-mono font-bold tracking-tight">
                        Designed & Built by Raviraj
                      </span>
                      <a
                        href="#admin"
                        title="Access Administration Dashboard"
                        className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-600 hover:text-purple-400 transition-colors"
                      >
                        <Lock size={10} />
                      </a>
                    </div>
                    <span className="text-[11px] text-slate-450 font-sans">
                      &copy; {new Date().getFullYear()} Raviraj Chauhan. All rights reserved.
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">
                      Handcrafted with care utilizing React, Tailwind CSS, and Motion.
                    </span>
                  </div>

                  {/* Action row & Back to Top */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleScrollToTop}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                    >
                      <ChevronUp size={12} />
                      <span>SCROLL_UP</span>
                    </button>
                    <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                      <span>Made with</span>
                      <Heart size={8} className="text-red-500 fill-current animate-pulse" />
                    </span>
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
