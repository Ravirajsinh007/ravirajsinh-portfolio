import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, FileDown, Eye, Send, Sparkles } from "lucide-react";
import { RESUME_DATA } from "../data";

export default function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % RESUME_DATA.taglines.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const triggerPrint = () => {
    // Generate an clean, professional, print-ready layout of the resume in a new window or trigger browser print
    window.print();
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden z-10 pt-20 pb-32">
      {/* Decorative top ambient glow */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center text-center gap-6">
        
        {/* Intro Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-md text-slate-300 text-xs font-mono select-none"
        >
          <Sparkles size={12} className="text-blue-400 animate-pulse" />
          <span>CURRENTLY PURSUING MCA @ CHARUSAT</span>
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col gap-1.5">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-sans"
          >
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">{RESUME_DATA.name}</span>
          </motion.h1>
        </div>

        {/* Dynamic Role Rotator */}
        <div className="h-10 sm:h-12 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={roleIndex}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -25, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="text-xl sm:text-3xl text-slate-400 font-mono tracking-wide"
            >
              {RESUME_DATA.taglines[roleIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Short strategic overview */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed mt-2"
        >
          Creative software builder based in Gujarat, India. Specializing in secure role-based Django frameworks, highly structured relational databases, and responsive visual interfaces.
        </motion.p>

        {/* Dynamic call to action row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6 z-20"
        >
          <button
            onClick={onExploreClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <Eye size={16} />
            <span>View Projects</span>
          </button>

          <button
            onClick={triggerPrint}
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <FileDown size={16} className="text-purple-400" />
            <span>Print / Save Resume</span>
          </button>
        </motion.div>
      </div>

      {/* Bounce scroll down button indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer select-none"
        onClick={onExploreClick}
      >
        <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
          SCROLL DOWN
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="p-1 rounded-full border border-slate-800 text-slate-400"
        >
          <ArrowDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
}
