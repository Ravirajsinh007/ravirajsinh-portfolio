import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Copy, Check, MessageSquareText, Linkedin, Github } from "lucide-react";
import { RESUME_DATA } from "../data";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const errData = await response.json();
        setSubmitError(errData.error || "Failed to transmit message.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setSubmitError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(RESUME_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="contact" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto pb-40">
      {/* Headings */}
      <div className="flex flex-col gap-2 mb-16 text-center md:text-left">
        <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">
          05 // COLLABORATE & ENGAGE
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          Get In Touch
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto md:mx-0 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Professional Message, Availability Status, Direct Contact details */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col gap-8"
        >
          {/* Header block / Professional callout */}
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">AVAILABLE FOR OPPORTUNITIES</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Let's build something exceptional together.
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed font-sans">
              I am actively looking for software engineering internships, full-time developer positions, and high-impact full-stack collaborations. Whether you have a complex REST API challenge, a data-driven system, or an elegant web portal to build, I'd love to chat.
            </p>
          </div>

          {/* Contact Details stack */}
          <div className="flex flex-col gap-3">
            {/* Email card */}
            <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-slate-800 group select-text">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-blue-400">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">EMAIL</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-300">{RESUME_DATA.email}</span>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                title="Copy email to clipboard"
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-500 hover:text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                {copiedEmail ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Telephone card */}
            <a
              href={`tel:${RESUME_DATA.phone}`}
              className="bg-slate-950/30 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 transition-all group cursor-pointer select-text"
            >
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-purple-400">
                <Phone size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase">TELEPHONE</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{RESUME_DATA.phone}</span>
              </div>
            </a>

            {/* Location card */}
            <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4 flex items-center gap-3.5 transition-colors select-text">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sky-400">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase">LOCATION</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-300">{RESUME_DATA.location}</span>
              </div>
            </div>
          </div>

          {/* SLA note / Professional Assurance */}
          <div className="p-4 bg-slate-950/25 border border-slate-900/60 rounded-2xl text-[11px] font-mono text-slate-500 leading-relaxed">
            📢 <strong className="text-slate-400">SLAs & Integrity:</strong> I regularly check my inbox and typically respond to all recruiter questions, technical inquiries, or interview invitations within <strong>12-24 hours</strong>.
          </div>
        </motion.div>

        {/* Right Side: High-fidelity Contact Message Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 w-full"
        >
          <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden">
            
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5 mb-6 font-sans select-none">
              <MessageSquareText size={16} className="text-purple-400" />
              <span>Leave a Message</span>
            </h3>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 rounded-2xl p-8 flex flex-col items-center text-center gap-3.5 select-none my-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-900/50">
                  <CheckCircle2 size={24} className="text-emerald-400 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Message Transmitted Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm">
                    Thank you for reaching out. Raviraj has been notified of your message and will review your request shortly.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your project, opening, or general inquiry..."
                    className="bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono resize-none"
                  />
                </div>

                {submitError && (
                  <div className="text-xs font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-4 py-2.5 rounded-xl">
                    ⚠️ {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-xs font-mono rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-55"
                >
                  <Send size={12} />
                  <span>{isSubmitting ? "TRANSMITTING..." : "DISPATCH MESSAGE"}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
