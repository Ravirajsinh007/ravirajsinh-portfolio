import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EDUCATION, ACHIEVEMENTS, CERTIFICATIONS } from "../data";
import { CertificationItem } from "../types";
import { GraduationCap, Award, BookCheck, Sparkles, ChevronRight, X, ShieldCheck, ExternalLink, Calendar, Key, BookmarkCheck } from "lucide-react";

export default function Journey() {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [certifications, setCertifications] = useState<CertificationItem[]>(CERTIFICATIONS);

  useEffect(() => {
    fetch("/api/certifications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCertifications(data);
        }
      })
      .catch((err) => console.error("Error fetching certifications dynamically:", err));
  }, []);

  return (
    <section id="journey" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Headings */}
      <div className="flex flex-col gap-2 mb-20 text-center">
        <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">
          04 // PATHWAY & MILESTONES
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          Academic Journey & Achievements
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Columns: Timeline (Education & Key Achievements) */}
        <div className="lg:col-span-7 flex flex-col relative gap-12 pl-6 sm:pl-8 border-l border-slate-900">
          
          {/* Vertical glowing trace indicator line */}
          <div className="absolute top-0 bottom-0 left-[-1px] w-[1px] bg-gradient-to-b from-blue-500 via-purple-500 to-transparent shadow-[0_0_8px_#3b82f6]" />

          {EDUCATION.map((edu, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative flex flex-col gap-2"
            >
              {/* Point Node on the line */}
              <div className="absolute left-[-31px] sm:left-[-39px] top-1.5 w-5 h-5 rounded-full bg-[#070913] border-2 border-blue-500 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.5)] z-20">
                <GraduationCap size={10} className="text-blue-400" />
              </div>

              <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm shadow-md hover:border-blue-500/10 transition-colors">
                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/25 border border-blue-900/30 px-2 py-0.5 rounded">
                    {edu.duration}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                    {edu.grade}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-sans">{edu.degree}</h3>
                <h4 className="text-xs font-semibold font-mono text-slate-400">{edu.institution}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-2.5 font-sans">
                  {edu.details}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Columns: Achievements & Certifications Card Deck */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Section: Achievements list */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <Award size={16} />
              <span>Honors & Hackathons</span>
            </h3>

            <div className="flex flex-col gap-4">
              {ACHIEVEMENTS.map((ach, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex gap-3.5 backdrop-blur-sm"
                >
                  <div className="p-2.5 h-fit rounded-xl bg-purple-950/20 border border-purple-900/40 text-purple-400">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-purple-400 font-semibold">{ach.issuer}</span>
                      <span className="text-slate-500">{ach.year}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{ach.title}</h4>
                    <p className="text-xs text-slate-400/80 leading-relaxed font-sans">{ach.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: IBM/UMich Certifications list */}
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <BookCheck size={16} />
              <span>Professional Credentials</span>
            </h3>

            <div className="flex flex-col gap-3">
              {certifications.map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  onClick={() => setSelectedCert(cert)}
                  className="bg-slate-950/40 border border-slate-900 hover:border-purple-500/30 rounded-xl p-3.5 flex items-center justify-between transition-all backdrop-blur-sm group cursor-pointer select-none"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                      {cert.issuer}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                      {cert.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors uppercase">VIEW</span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Certificate Modal overlay */}
      <AnimatePresence>
        {selectedCert && (
          <CertificateModal
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* Glassmorphic digital credential viewer mockup modal */
function CertificateModal({ cert, onClose }: { cert: CertificationItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070913]/95 backdrop-blur-md"
      />

      {/* Certificate Frame wrapper */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors hover:bg-slate-800 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Certificate Mockup Canvas Layout */}
        <div className="border border-slate-900/80 rounded-2xl bg-slate-950/20 p-6 relative overflow-hidden flex flex-col items-center justify-between min-h-[300px] border-double shadow-inner mt-4">
          
          {/* Ornamental corner geometric markers */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-500/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-500/30" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-500/30" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-500/30" />

          {/* Secure radial background glow */}
          <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/0 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Mockup Header */}
          <div className="flex flex-col items-center gap-1.5 text-center relative z-10">
            <ShieldCheck size={28} className="text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Verified Digital Credential
            </span>
            <div className="h-[1px] w-16 bg-slate-800 my-1" />
          </div>

          {/* Core Content */}
          <div className="flex flex-col items-center text-center gap-2 relative z-10 max-w-sm">
            <span className="text-[10px] text-slate-400 font-mono italic">This certifies that</span>
            <span className="text-md font-bold font-sans text-white uppercase tracking-wide">
              Raviraj Chauhan
            </span>
            <span className="text-[10px] text-slate-400 font-mono italic leading-none">has successfully completed all requirements for</span>
            <h4 className="text-sm font-bold text-blue-400 font-sans tracking-tight leading-snug">
              {cert.title}
            </h4>
            <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-950/30 border border-purple-900/40 px-2 py-0.5 rounded">
              Issued by {cert.issuer}
            </span>
          </div>

          {/* Security details & stamp row */}
          <div className="w-full flex items-end justify-between border-t border-slate-900 pt-5 mt-4 relative z-10 text-[9px] font-mono text-slate-500">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <Calendar size={10} className="text-slate-600" />
                <span>VERIFIED_DATE: 2024</span>
              </span>
              <span className="flex items-center gap-1">
                <Key size={10} className="text-slate-600" />
                <span>ID: {cert.id}</span>
              </span>
            </div>

            {/* Simulated seal badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-500 text-[10px] font-bold">
                ★
              </div>
              <span className="text-[7px] text-slate-600 uppercase tracking-wider">OFFICIAL SEAL</span>
            </div>
          </div>

        </div>

        {/* Modal CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 font-mono">
            Cryptographically signed & authenticated by {cert.issuer}.
          </div>
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-mono rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
          >
            <span>External Verification Link</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
