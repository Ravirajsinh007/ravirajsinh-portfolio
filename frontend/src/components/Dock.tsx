import { motion } from "motion/react";
import { User, Code, FolderGit2, GraduationCap, Mail } from "lucide-react";

interface DockProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export default function Dock({ activeSection, setActiveSection }: DockProps) {
  const items = [
    { id: "about", label: "About", icon: User },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "journey", label: "Journey", icon: GraduationCap },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  const handleScroll = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 px-4 w-full max-w-[360px] sm:max-w-xl">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        className="bg-slate-950/85 border border-slate-900/90 backdrop-blur-xl px-2 sm:px-4 py-1.5 rounded-3xl shadow-2xl shadow-purple-950/20 flex items-center justify-around gap-1 relative overflow-visible"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className={`relative py-1.5 px-2.5 rounded-2xl text-slate-400 hover:text-white transition-all duration-300 group flex flex-col items-center justify-center cursor-pointer min-w-[56px] sm:min-w-[80px] ${
                isActive ? "bg-slate-900/60 border border-slate-800/40 text-blue-400" : ""
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                <Icon 
                  size={15} 
                  className={isActive ? "text-blue-400 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-450 group-hover:text-slate-200 transition-colors"} 
                />
                
                <span className={`text-[8px] sm:text-[9px] font-sans font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive ? "text-blue-400 font-extrabold" : "text-slate-500 group-hover:text-slate-300"
                }`}>
                  {item.label}
                </span>
              </motion.div>

              {/* Glowing Dot indicator below active */}
              {isActive && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-1 w-1.5 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-[0_0_6px_#3b82f6]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
