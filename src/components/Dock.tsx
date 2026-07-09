import { motion } from "motion/react";
import { User, Code, FolderGit2, GraduationCap, Mail, MessageSquareText } from "lucide-react";

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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 px-4 w-full max-w-lg">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6, type: "spring" }}
        className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl px-4 py-2.5 rounded-3xl shadow-2xl shadow-blue-950/20 flex items-center justify-around gap-1 relative overflow-visible"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className="relative p-3 text-slate-400 hover:text-white transition-colors duration-200 group flex flex-col items-center justify-center cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.25, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10"
              >
                <Icon size={20} className={isActive ? "text-blue-400 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""} />
              </motion.div>

              {/* Glowing Dot indicator below active */}
              {isActive && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-1 w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-[0_0_6px_#3b82f6]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-slate-200 text-[10px] font-mono py-1 px-2.5 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 shadow-lg whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
