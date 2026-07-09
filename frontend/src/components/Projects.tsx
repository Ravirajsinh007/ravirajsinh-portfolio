import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PROJECTS } from "../data";
import { Project } from "../types";
import { ExternalLink, Github, X, CheckCircle, Sparkles, FolderKanban, Heart, MessageCircle, Share2, Bookmark, BadgeCheck, MoreHorizontal, ArrowUpRight, ChevronLeft, ChevronRight, Layers3 } from "lucide-react";

// Premium high-resolution dark-themed aesthetic images mapped by project ID
const PROJECT_IMAGES: Record<string, string> = {
  edutrack: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop", // Educational Technology dashboard & learning
  ecommerce: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop", // Ultra premium interior decor e-commerce setting
  production: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" // Professional metrics, operational line charts
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => console.error("Error fetching projects dynamically:", err));
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (selectedCategory === "All") return true;
    return (project.category || "").toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = [
    { id: "All", label: "All Works", count: projects.length },
    { id: "Web", label: "Web Systems", count: projects.filter(p => (p.category || "").toLowerCase() === "web").length },
    { id: "App", label: "Software Apps", count: projects.filter(p => (p.category || "").toLowerCase() === "app").length },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.85;
      const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  const isScrollableLayout = filteredProjects.length > 3;

  return (
    <section id="projects" className="py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
      {/* Header and Controls container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/45 border border-blue-900/35 text-[10px] font-mono font-bold uppercase text-blue-400 tracking-widest select-none">
            <Sparkles size={12} className="text-blue-400 animate-pulse" />
            <span>Featured Portfolio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
            Featured Engineering Projects
          </h2>
          <p className="text-sm sm:text-base font-sans text-slate-300 max-w-2xl leading-relaxed mt-1">
            A high-integrity compilation of full-stack systems, dynamic API architectures, and validated database portals demonstrating production-grade engineering potential and bulletproof design.
          </p>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto md:mx-0 mt-1" />
        </div>

        {/* Action Arrows for scrollable view (Hidden if grid view is used) */}
        {isScrollableLayout && (
          <div className="flex items-center justify-center md:justify-end gap-2.5">
            <button
              onClick={() => scroll("left")}
              className="p-3 bg-slate-950/80 border border-slate-900 text-slate-400 hover:text-white rounded-xl hover:border-purple-500/30 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 bg-slate-950/80 border border-slate-900 text-slate-400 hover:text-white rounded-xl hover:border-purple-500/30 hover:bg-slate-900 transition-all cursor-pointer active:scale-95 shadow-md"
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Categories Filtering Bar */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-10 border-b border-slate-900/60 pb-5 select-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                // Reset scroll container to start if filtering changes
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollLeft = 0;
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wide transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white border-purple-500/30 shadow-md shadow-purple-950/40"
                  : "bg-slate-950/40 text-slate-400 border-slate-900/80 hover:text-slate-200 hover:border-slate-800"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-purple-700 text-purple-100" : "bg-slate-900 text-slate-500"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render layout conditionally: Grid or Horizontal slider */}
      {isScrollableLayout ? (
        <div
          ref={scrollContainerRef}
          className="flex flex-row overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800 rounded-3xl -mx-4 px-4 pr-12 select-text"
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="w-[300px] sm:w-[350px] shrink-0 snap-start"
            >
              <ProjectCard
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 select-text">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State when no records match filter */}
      {filteredProjects.length === 0 && (
        <div className="bg-slate-950/20 border border-dashed border-slate-900 rounded-3xl p-12 text-center my-6">
          <Layers3 className="text-slate-600 mx-auto mb-3" size={32} />
          <h4 className="text-sm font-mono text-slate-350 font-bold">NO_PROJECT_RECORDS_FOUND</h4>
          <p className="text-xs text-slate-500 font-mono mt-1">No custom builds matching the category "{selectedCategory.toUpperCase()}" are currently stored.</p>
        </div>
      )}

      {/* Dynamic Count Stats Summary */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-900/60 pt-6 select-none">
        <span className="tracking-wider uppercase">SYSTEMS_OUTPUT: {filteredProjects.length} OF {projects.length} PROJECTS DISPLAYED</span>
        <span className="tracking-widest">FILTER: {selectedCategory.toUpperCase()}</span>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* Custom interactive cards styled like a premium dev social media post */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 120);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const projectImage = project.imageUrl || PROJECT_IMAGES[project.id] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop";

  return (
    <div
      onClick={onClick}
      className="bg-slate-950/45 border border-slate-900/90 hover:border-purple-500/50 rounded-3xl p-5 flex flex-col h-full cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] hover:-translate-y-1.5 backdrop-blur-md relative overflow-hidden group select-none transition-all duration-300 min-h-[460px]"
    >
      {/* Decorative Card Ambient Glow backlights */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Clean Project Image Header (First show) */}
      <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-4 border border-slate-900/80 group-hover:border-purple-500/20 transition-all duration-300">
        <img
          src={projectImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        
        {/* Floating Year Tag */}
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-2 py-0.5 rounded-md">
          <span className="text-[9px] font-mono text-slate-400 font-bold tracking-wide">{project.year}</span>
        </div>

        {/* Floating Metrics Badge */}
        {project.metrics && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[9px] font-mono text-emerald-400 bg-slate-950/90 backdrop-blur-md border border-emerald-900/40 px-2 py-0.5 rounded-md font-semibold tracking-wide shadow flex items-center gap-1">
              <Sparkles size={8} className="animate-pulse text-emerald-400" />
              {project.metrics.split(",")[0]}
            </span>
          </div>
        )}
      </div>

      {/* Project content text/details */}
      <div className="flex flex-col gap-1 z-10 mb-4">
        <h4 className="text-md font-bold text-slate-100 group-hover:text-blue-400 transition-colors duration-200 leading-snug">
          {project.title}
        </h4>
        <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
          {project.subtitle}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mt-2">
          {project.tagline || project.description}
        </p>
      </div>

      {/* Tech Stack Pills list */}
      <div className="flex flex-wrap gap-1 mb-5 z-10">
        {project.techStack.slice(0, 3).map((tech, idx) => (
          <span
            key={idx}
            className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800/80"
          >
            #{tech.replace(/\s+/g, '')}
          </span>
        ))}
        {project.techStack.length > 3 && (
          <span className="text-[9px] font-mono text-slate-600 self-center ml-1">
            +{project.techStack.length - 3}
          </span>
        )}
      </div>

      {/* Elegant Portfolio Footer */}
      <div className="border-t border-slate-900/80 pt-4 mt-auto flex items-center justify-between gap-2 z-10">
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs font-sans tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/10 cursor-pointer"
        >
          <span>EXPLORE</span>
          <ArrowUpRight size={13} />
        </button>

        <div className="flex items-center gap-2">
          {project.links?.github && project.links.github !== "#" && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
              title="View Source on GitHub"
            >
              <Github size={14} />
            </a>
          )}
          {project.links?.live && project.links.live !== "#" && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
              title="View Live Site"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* Glassmorphic detailed project expander Modal with responsive split layout (Left: Mockup, Right: Specifications) */
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const projectImage = project.imageUrl || PROJECT_IMAGES[project.id] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop";
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 40) + 140);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  // Prevent background website body from scrolling when detailed project view is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Blackout backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070913]/90 backdrop-blur-md z-10"
      />

      {/* Modal Card content box (Wide Max-W-4xl design for professional split presentation) */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-slate-950 border border-slate-900 rounded-3xl w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto relative z-20 shadow-2xl p-6 pb-16 sm:p-8 sm:pb-24 flex flex-col gap-6 scrollbar-thin select-text"
      >
        {/* Top: Premium Social Media Post Author Header inside detailed modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 pr-12 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-mono font-bold text-sm text-white shadow-md">
              RC
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white font-sans tracking-tight leading-none">
                  Raviraj Chauhan
                </span>
                <BadgeCheck size={14} className="text-blue-400 fill-blue-950/60" />
              </div>
              <span className="text-xs font-mono text-slate-500 mt-1">
                @raviraj_dev &bull; Featured Post
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded-full font-bold">
              VERIFIED RELEASE
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-slate-800 cursor-pointer z-20"
        >
          <X size={16} />
        </button>

        {/* Grid Body: 1 Column on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT SIDE: Project Photos / Captures & High Fidelity Mockups */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
              <img
                src={projectImage}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              
              {/* Floating metrics badge top left */}
              {project.metrics && (
                <div className="absolute top-3 left-3 select-none">
                  <span className="text-[10px] font-mono text-emerald-400 bg-slate-950/90 backdrop-blur-md border border-emerald-900/40 px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-lg">
                    <Sparkles size={11} className="animate-pulse text-emerald-400" />
                    {project.metrics.split(",")[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Photo details caption and simulated interactive engagement row */}
            <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3 select-none">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                ATTACHMENT SPECIFICATIONS:
              </span>
              <p className="text-[11px] text-slate-450 font-mono leading-relaxed">
                FILE: production_v1_screenshot.png <br />
                RESOLUTION: 1920x1080px &bull; High-Definition Render <br />
                STATUS: Live In Production environment
              </p>

              <div className="h-[1px] bg-slate-900 my-1" />

              {/* Engagement Row */}
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${liked ? "text-red-500" : ""}`}
                >
                  <Heart size={14} className={liked ? "fill-current" : ""} />
                  <span>{likeCount} Likes</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={14} />
                  <span>24 Comments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Share2 size={14} />
                  <span>8 Shares</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Specification, Technical deliverables, Tech Stack and CTAs */}
          <div className="flex flex-col gap-6">
            
            {/* Title Block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/20 border border-purple-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {project.year}
                </span>
                <span className="text-[10px] font-mono text-blue-400">
                  // {project.id.toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {project.title}
              </h3>
              <p className="text-sm font-mono text-blue-400 font-semibold leading-relaxed">
                {project.subtitle}
              </p>
            </div>

            {/* Long description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-slate-900 pt-4">
              {project.description}
            </p>

            {/* Features bullet checklist */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
                Key Achievements & Deliverables:
              </h4>
              <ul className="flex flex-col gap-2.5">
                {project.features.map((feat, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-slate-400">
                    <CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Pills list */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
                Technology Stack:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl"
                  >
                    #{tech.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs / External Links */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-900 pt-5 mt-2">
              {project.links.github && project.links.github !== "#" && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-mono rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Github size={13} />
                  <span>Source Code</span>
                </a>
              )}
              {project.links.live && project.links.live !== "#" && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-mono rounded-xl flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Live Production Demo</span>
                </a>
              )}
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
