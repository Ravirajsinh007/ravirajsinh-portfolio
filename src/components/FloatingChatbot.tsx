import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, X, Sparkles, MessageSquareText, ChevronDown, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const QUICK_QUESTIONS = [
  "What are your core technical skills?",
  "Tell me about the EduTrack project.",
  "What databases do you specialize in?",
  "How can I get in contact with you?"
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "bot-init",
      text: "Hello! I am Raviraj's AI Recruiter Assistant. Ask me anything about his skills, full-stack projects, academic background, or availability!",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll messages down
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isBotTyping, isOpen]);

  const handleSendChat = async (messageText: string) => {
    const cleanInput = messageText.trim();
    if (!cleanInput || isBotTyping) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: cleanInput,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsBotTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanInput,
          history: chatMessages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: data.reply || "I apologize, but I had trouble processing that. Please feel free to ask another question!",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot API Connection error:", err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        text: "I was unable to establish a connection to my server backend. Please ensure the dev server is active and try again!",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendChat(chatInput);
  };

  const handleReset = () => {
    setChatMessages([
      {
        id: "bot-init",
        text: "Hello! I am Raviraj's AI Recruiter Assistant. Ask me anything about his skills, full-stack projects, academic background, or availability!",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      
      {/* Expanded Chat Window widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[320px] sm:w-[360px] h-[480px] bg-slate-950/95 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden mb-4 mr-0 sm:mr-2"
          >
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-900 px-4.5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white relative">
                  <Bot size={18} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100 tracking-tight leading-none flex items-center gap-1">
                    <span>Raviraj's AI rep</span>
                    <Sparkles size={10} className="text-purple-400 animate-pulse" />
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">
                    Active &bull; Powered by Gemini
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Reset Conversation button */}
                <button
                  onClick={handleReset}
                  title="Reset Chat"
                  className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-500 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Chat Conversation Stream scroll list */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin select-text">
              {chatMessages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isBot ? "self-start" : "self-end items-end"}`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[12px] sm:text-xs leading-relaxed ${
                        isBot
                          ? "bg-slate-900 text-slate-300 border border-slate-850 rounded-tl-none font-sans"
                          : "bg-blue-600 text-white rounded-tr-none font-mono font-medium"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] font-mono text-slate-600 mt-0.5 px-1 block select-none">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isBotTyping && (
                <div className="self-start flex flex-col max-w-[85%]">
                  <div className="px-3.5 py-3 bg-slate-900 text-slate-500 border border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Micro Quick Question chips selection */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-900/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none select-none">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(q)}
                  className="inline-block px-2.5 py-1 bg-slate-900 hover:bg-slate-850 hover:border-purple-500/20 border border-slate-850 text-[10px] font-mono text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Form Input block */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/30 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isBotTyping}
                className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-purple-950/45 cursor-pointer disabled:opacity-40 shrink-0"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white flex items-center justify-center shadow-xl shadow-purple-950/40 relative cursor-pointer border border-white/15"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <Bot size={22} className="filter drop-shadow" />
              {/* Online pulse dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#070913] rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Float label beside button when closed */}
        {!isOpen && (
          <div className="absolute right-16 bg-slate-950/90 border border-slate-800 text-slate-300 text-[10px] font-mono py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity pointer-events-none sm:block hidden select-none">
            Ask AI Recruiter Assistant
          </div>
        )}
      </motion.button>

    </div>
  );
}
