import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { GraduationCap, Code2, FolderKanban, Award } from "lucide-react";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function Counter({ value, suffix = "", duration = 1500 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="font-sans font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-none text-glow-blue">
      {count}
      <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-400 ml-1 select-none font-mono">{suffix}</span>
    </span>
  );
}

export default function MetricsBar() {
  const metrics = [
    {
      id: "edu",
      value: 4,
      suffix: "YRS+",
      label: "Engineering Education",
      icon: <GraduationCap className="text-blue-400" size={16} />,
      bgGlow: "from-blue-500/10 to-transparent",
    },
    {
      id: "skills",
      value: 20,
      suffix: "TECH+",
      label: "Expertise Skills",
      icon: <Code2 className="text-purple-400" size={16} />,
      bgGlow: "from-purple-500/10 to-transparent",
    },
    {
      id: "projects",
      value: 10,
      suffix: "BUILDS+",
      label: "Completed Projects",
      icon: <FolderKanban className="text-pink-400" size={16} />,
      bgGlow: "from-pink-500/10 to-transparent",
    },
    {
      id: "certs",
      value: 5,
      suffix: "CERTS+",
      label: "Credentials & Badges",
      icon: <Award className="text-emerald-400" size={16} />,
      bgGlow: "from-emerald-500/10 to-transparent",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-900/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background decorative line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        
        {metrics.map((m, idx) => (
          <div
            key={m.id}
            className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b ${m.bgGlow} border border-slate-900/60 hover:border-slate-800/60 transition-all duration-300 relative group`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-850 shadow-inner shrink-0 text-slate-300 group-hover:scale-105 transition-transform duration-300">
                {m.icon}
              </div>
              <Counter value={m.value} suffix={m.suffix} />
            </div>
            <div className="mt-1">
              <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest block font-bold leading-tight select-none">
                {m.label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
