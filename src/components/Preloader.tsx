import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const sampleLogs = [
    "Initializing neural creative core...",
    "Loading 3D procedural geometries...",
    "Compiling shaders & visual buffers...",
    "Optimizing system memory allocations...",
    "Parsing Raviraj's resume matrix...",
    "Assembling AngularJS reactive pipelines...",
    "Spinning up Django REST client nodes...",
    "Ready to deploy creative interface."
  ];

  useEffect(() => {
    // Increment progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 600);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    // Add fake loader logs sequentially
    const logInterval = setInterval(() => {
      if (logs.length < sampleLogs.length) {
        setLogs((prev) => [...prev, sampleLogs[prev.length]]);
      }
    }, 450);

    return () => clearInterval(logInterval);
  }, [logs]);

  return (
    <motion.div
      className="fixed inset-0 bg-[#070913] z-50 flex flex-col items-center justify-center p-6"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Visual Brand */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/20"
          >
            <span className="text-white font-mono text-2xl font-bold">&lt;R&gt;</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-mono font-medium text-slate-300 mt-4 tracking-wider"
          >
            RAVIRAJ CHAUHAN
          </motion.h2>
          <span className="text-xs font-mono text-purple-400/70 tracking-widest uppercase">
            Creative Portfolio
          </span>
        </div>

        {/* Console Logs */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-400 h-32 overflow-y-auto shadow-inner flex flex-col gap-1 select-none scrollbar-thin">
          <div className="flex items-center gap-1.5 text-blue-400 border-b border-slate-800/60 pb-1.5 mb-1.5">
            <Terminal size={12} />
            <span>PORTFOLIO_SYSTEM_INITIALIZE_v2.0</span>
          </div>
          <AnimatePresence>
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1"
              >
                <span className="text-purple-500/80">&gt;</span>
                <span>{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">BOOTSTAPPING</span>
            <span className="text-purple-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              style={{ width: `${progress}%` }}
              layoutId="progress"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
