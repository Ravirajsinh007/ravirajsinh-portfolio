import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EDUCATION, ACHIEVEMENTS, CERTIFICATIONS } from "../data";
import { CertificationItem } from "../types";
import { GraduationCap, Award, BookCheck, Sparkles, ChevronRight, X, ShieldCheck, ExternalLink, Calendar, Key, BookmarkCheck, ChevronLeft } from "lucide-react";
import { getApiUrl } from "../lib/api";

export default function Journey() {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [certifications, setCertifications] = useState<CertificationItem[]>(CERTIFICATIONS);
  const certScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/certifications"))
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

  const scrollCerts = (direction: "left" | "right") => {
    if (certScrollRef.current) {
      const { scrollLeft, clientWidth } = certScrollRef.current;
      const scrollAmount = clientWidth * 0.85;
      const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      certScrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section id="journey" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Headings */}
      <div className="flex flex-col items-center gap-4 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/45 border border-purple-900/35 text-[10px] font-mono font-bold uppercase text-purple-400 tracking-widest select-none">
          <BookmarkCheck size={12} className="text-purple-400 animate-pulse" />
          <span>Experience & Pathway</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
          Academic Journey & Achievements
        </h2>
        <p className="text-sm sm:text-base font-sans text-slate-300 max-w-2xl leading-relaxed mt-1">
          A high-fidelity chronicle of academic milestones, certifications, and project checkpoints mapping a rigorous engineering trajectory.
        </p>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
        {/* Left Columns: Timeline (Education) */}
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

        {/* Right Columns: Achievements Card Deck */}
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
        </div>
      </div>

      {/* Full-width Divider Line */}
      <div className="w-full h-[1px] bg-slate-900/80 my-12" />

      {/* Wide Section: Professional Credentials / Certifications Slider */}
      <div className="flex flex-col gap-6 select-none">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <BookCheck size={16} />
              <span>Professional Credentials</span>
            </h3>
            <p className="text-xs sm:text-sm font-sans text-slate-400 max-w-xl leading-relaxed mt-1">
              Verified certifications and badges earned from world-class industry leaders and academic institutions, confirming technical proficiency.
            </p>
          </div>

          {/* Scrolling Action Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCerts("left")}
              className="p-3 bg-slate-950/80 border border-slate-900 text-slate-400 hover:text-white rounded-xl hover:border-purple-500/30 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollCerts("right")}
              className="p-3 bg-slate-950/80 border border-slate-900 text-slate-400 hover:text-white rounded-xl hover:border-purple-500/30 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 shadow-md"
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Credentials Horizontally Scrolling Track */}
        <div
          ref={certScrollRef}
          className="flex flex-row overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800 rounded-3xl -mx-4 px-4 pr-12 select-text"
        >
          {certifications.map((cert, idx) => (
            <div
              key={cert.id || idx}
              onClick={() => setSelectedCert(cert)}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-slate-950/50 border border-slate-900/90 hover:border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between h-[310px] transition-all duration-300 backdrop-blur-md group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] select-none relative overflow-hidden"
            >
              {/* Image Section */}
              <div className="w-full h-[150px] rounded-xl border border-slate-900/80 overflow-hidden bg-slate-950 flex-shrink-0 relative">
                {cert.imageUrl ? (
                  <img
                    src={cert.imageUrl.startsWith("/") ? getApiUrl(cert.imageUrl) : cert.imageUrl}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <ShieldCheck size={36} className="text-purple-500/40 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest text-slate-600 uppercase">OFFICIAL BADGE</span>
                  </div>
                )}
                
                {/* Floating Issuer Badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[9px] font-mono font-bold text-purple-400 backdrop-blur-sm shadow-md">
                  {cert.issuer}
                </div>

                {/* Verified Indicator */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-900/60 text-[8px] font-mono font-bold text-emerald-400 backdrop-blur-sm shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Title & Info Section */}
              <div className="flex flex-col gap-1.5 flex-1 justify-center py-2 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug font-sans">
                  {cert.title}
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  Authority: {cert.issuer}
                </p>
              </div>

              {/* Direct Verification Link / CTA */}
              <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between">
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation(); // don't trigger modal double-open
                  }}
                  className="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-bold tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>VERIFY CREDENTIAL</span>
                  <ExternalLink size={10} />
                </a>

                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>EXPAND</span>
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
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

          {/* Secure radial background glow or dynamic cert image */}
          {cert.imageUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-900 bg-slate-950 flex items-center justify-center z-10 mb-4 flex-shrink-0">
              <img src={cert.imageUrl.startsWith("/") ? getApiUrl(cert.imageUrl) : cert.imageUrl} alt={cert.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/0 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          )}

          {/* Mockup Header */}
          <div className="flex flex-col items-center gap-1.5 text-center relative z-10">
            {!cert.imageUrl && (
              <ShieldCheck size={28} className="text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            )}
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
                <span>VERIFICATION STATUS: ACTIVE & VERIFIED</span>
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
