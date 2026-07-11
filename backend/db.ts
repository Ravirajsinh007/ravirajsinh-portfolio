import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: string[];
  year: string;
  category?: string;
  links: {
    github?: string;
    live?: string;
  };
  metrics?: string;
  imageUrl?: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface CertificationItem {
  id?: string;
  title: string;
  issuer: string;
  link: string;
  imageUrl?: string;
}

export interface MessageReply {
  id: string;
  message: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
  replies?: MessageReply[];
}

export interface Profile {
  photoUrl: string;
  resumeUrl: string;
  aboutText?: string;
  title?: string;
}

export interface DatabaseSchema {
  projects: Project[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  messages: ContactMessage[];
  profile?: Profile;
}

// Check if a persistent storage directory is specified (useful for services like Render Persistent Disks)
const getDbDir = (): string => {
  if (process.env.PERSISTENT_DIR) {
    const pDir = path.resolve(process.env.PERSISTENT_DIR);
    if (!fs.existsSync(pDir)) {
      try {
        fs.mkdirSync(pDir, { recursive: true });
      } catch (err) {
        console.error("Could not create PERSISTENT_DIR:", pDir, err);
      }
    }
    return pDir;
  }
  return process.cwd();
};

const DB_FILE = path.join(getDbDir(), "database.json");

// Initialize Supabase Client
let supabaseUrlRaw = (process.env.SUPABASE_URL || "").trim();
if (supabaseUrlRaw) {
  supabaseUrlRaw = supabaseUrlRaw.replace(/\/+$/, "");
  if (supabaseUrlRaw.endsWith("/rest/v1")) {
    supabaseUrlRaw = supabaseUrlRaw.slice(0, -8);
  }
  supabaseUrlRaw = supabaseUrlRaw.replace(/\/+$/, "");
}
const supabaseUrl = supabaseUrlRaw;
const supabaseKey = (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

if (isSupabaseConfigured) {
  console.log("Supabase Client initialized successfully!");
} else {
  console.log("Supabase URL or Key not found in environment. Falling back to local database.json storage.");
}

// Helper to load/save raw local data
function loadLocal(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveLocal(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.projects) parsed.projects = INITIAL_DATA.projects;
    if (!parsed.skills) parsed.skills = INITIAL_DATA.skills;
    if (!parsed.certifications) parsed.certifications = INITIAL_DATA.certifications;
    if (!parsed.messages) parsed.messages = INITIAL_DATA.messages;
    if (!parsed.profile) parsed.profile = INITIAL_DATA.profile || { photoUrl: "", resumeUrl: "" };
    return parsed;
  } catch (e) {
    console.error("Database parsing failed, falling back to INITIAL_DATA:", e);
    return INITIAL_DATA;
  }
}

function saveLocal(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Database save failed:", e);
  }
}

// Generic helpers to load and save keys either from Supabase or local
async function loadKey<T>(key: string, defaultValue: T): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_store")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) {
        console.error(`Supabase load error for key "${key}":`, error.message);
      } else if (data && data.value !== undefined) {
        return data.value as T;
      } else {
        // Row not found in Supabase. Let's check local database.json first to migrate!
        const localDb = loadLocal();
        const localValue = (localDb as any)[key];
        const valToSeed = localValue !== undefined ? localValue : defaultValue;
        await saveKey(key, valToSeed);
        return valToSeed;
      }
    } catch (e) {
      console.error(`Supabase connection failed for key "${key}", falling back to local database.json:`, e);
    }
  }

  const localDb = loadLocal();
  const val = (localDb as any)[key];
  return val !== undefined ? val : defaultValue;
}

async function saveKey<T>(key: string, value: T): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("portfolio_store")
        .upsert({ key, value }, { onConflict: "key" });

      if (error) {
        console.error(`Supabase save error for key "${key}":`, error.message);
      } else {
        // Redundant local backup
        try {
          const localDb = loadLocal();
          (localDb as any)[key] = value;
          saveLocal(localDb);
        } catch (e) {}
        return;
      }
    } catch (e) {
      console.error(`Supabase save failed for key "${key}":`, e);
    }
  }

  const localDb = loadLocal();
  (localDb as any)[key] = value;
  saveLocal(localDb);
}

// High-fidelity pre-populated data matching Raviraj Chauhan's real resume/portfolio
const INITIAL_DATA: DatabaseSchema = {
  projects: [
    {
      id: "edutrack",
      title: "EduTrack",
      subtitle: "Student Assignment & Learning Management Portal",
      tagline: "A production-ready role-based learning platform supporting seamless student-instructor workflows.",
      description: "EduTrack is a robust, full-lifecycle role-based Learning Management System designed to streamline assignment submission, module delivery, grading, and performance tracking. It utilizes a highly normalized database and modern JWT auth with distinct administrative dashboards.",
      features: [
        "Role-Based Access Control (RBAC): Separate, custom dashboard layouts and feature permissions for students and instructors.",
        "RESTful API Architecture: Structured endpoints built with Django REST Framework for authentication, course administration, file upload/download, and feedback cycles.",
        "Database Normalization: Optimized SQLite schema with foreign key constraints establishing sound relationships between courses, assignments, submissions, and grades.",
        "Deadline & Tracker System: Automated calendar alerts, announcements, and grading statistics for instructors to monitor student progress."
      ],
      techStack: ["Python", "Django REST Framework", "AngularJS", "SQLite3", "JWT", "REST APIs", "Git"],
      year: "2025",
      category: "App",
      links: {
        github: "https://github.com/raviraj-chauhan/EduTrack",
        live: "#"
      },
      metrics: "100% Normalized DB, Secure Role-based JWT Auth"
    },
    {
      id: "ecommerce",
      title: "Home Decor E-Commerce",
      subtitle: "Premium E-Commerce Platform & Video-Shop System",
      tagline: "A cloud-hosted interior design store with dynamic interactive elements and high-performance optimizations.",
      description: "A production-ready WordPress and WooCommerce powered home decor web store. Engineered with highly customized visual layout additions including dynamic responsive sliders, an immersive CSS-powered video shopping portal, and comprehensive uptime analysis.",
      features: [
        "Mobile-Optimized video reel ('Watch & Shop') enabling immersive, direct-checkout integrations using optimized flexbox layouts.",
        "Uptime Monitoring & Cloud Architecture: Deployed and tested across server environments ensuring 99.9% availability and streamlined asset delivery.",
        "Testimonial Gallery: Built an interactive customer testimonial layout with CSS scroll-snapping and visual transition curves."
      ],
      techStack: ["WordPress", "WooCommerce", "Custom CSS", "HTML5", "UI/UX", "Cloud Infra"],
      year: "2023",
      category: "Web",
      links: {
        github: "#",
        live: "https://example.com"
      },
      metrics: "99.9% Uptime, Responsive CSS Scroll-Snapping Video Reel"
    },
    {
      id: "production",
      title: "Production Management System",
      subtitle: "Enterprise Metrics & Dynamic Dashboard Suite",
      tagline: "A secure PHP portal visualizing yearly, monthly, and weekly corporate manufacturing indicators.",
      description: "An elegant production monitoring system designed to query and process manufacturing telemetry. Features secure, sanitised CRUD operations for industrial logs and structures data outputs into rich, human-readable charts for deep business insights.",
      features: [
        "Dynamic Dashboard: Aggregates raw log entries into clean tables and trend grids tracking weekly, monthly, and yearly margins.",
        "Validated CRUD Operations: Engineered with custom database triggers and sanitised queries to protect integrity and block injection vectors.",
        "Structured SQL Logic: Fully custom database schemas utilizing MySQL subqueries and analytical indexing."
      ],
      techStack: ["PHP", "MySQL", "HTML5", "CSS3", "WAMP", "SQL Querying"],
      year: "2024",
      category: "Web",
      links: {
        github: "https://github.com/raviraj-chauhan/production-system",
        live: "#"
      },
      metrics: "Weekly/Monthly Analytics, SQL Index-Optimized Queries"
    }
  ],
  skills: [
    {
      category: "Languages",
      skills: [
        { name: "Python", level: 95 },
        { name: "JavaScript", level: 90 },
        { name: "Java", level: 85 },
        { name: "PHP", level: 80 },
        { name: "C / C++", level: 82 }
      ]
    },
    {
      category: "Backend & APIs",
      skills: [
        { name: "Django", level: 95 },
        { name: "Django REST Framework", level: 92 },
        { name: "REST APIs", level: 94 },
        { name: "JWT Authentication", level: 90 },
        { name: "RBAC (Role Access)", level: 88 }
      ]
    },
    {
      category: "Frontend",
      skills: [
        { name: "AngularJS", level: 88 },
        { name: "HTML5 / CSS3", level: 95 },
        { name: "Tailwind CSS", level: 92 },
        { name: "Bootstrap", level: 90 }
      ]
    },
    {
      category: "Databases",
      skills: [
        { name: "MySQL", level: 88 },
        { name: "MongoDB", level: 80 },
        { name: "MS SQL Server", level: 82 },
        { name: "SQLite3", level: 90 }
      ]
    },
    {
      category: "Tools & Extras",
      skills: [
        { name: "Git / GitHub", level: 92 },
        { name: "Postman", level: 90 },
        { name: "Node.js", level: 78 },
        { name: "Express.js", level: 80 },
        { name: "WAMP", level: 85 }
      ]
    }
  ],
  certifications: [
    {
      id: "IBM-DJ-01",
      title: "Django Application Development with SQL and Databases",
      issuer: "IBM (Coursera)",
      link: "https://coursera.org"
    },
    {
      id: "UMICH-PDS-02",
      title: "Python Data Structures: Lists, Strings & Files",
      issuer: "University of Michigan (Coursera)",
      link: "https://coursera.org"
    },
    {
      id: "UMICH-PBI-03",
      title: "Python Basics: Selection and Iteration",
      issuer: "University of Michigan (Coursera)",
      link: "https://coursera.org"
    }
  ],
  messages: [],
  profile: {
    photoUrl: "",
    resumeUrl: ""
  }
};

export class JSONDatabase {
  // Projects CRUD
  public static async getProjects(): Promise<Project[]> {
    return loadKey<Project[]>("projects", INITIAL_DATA.projects);
  }

  public static async addProject(project: Project): Promise<Project> {
    const list = await this.getProjects();
    list.push(project);
    await saveKey("projects", list);
    return project;
  }

  public static async updateProject(id: string, updated: Partial<Project>): Promise<Project | null> {
    const list = await this.getProjects();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updated };
    await saveKey("projects", list);
    return list[idx];
  }

  public static async deleteProject(id: string): Promise<boolean> {
    const list = await this.getProjects();
    const initialLen = list.length;
    const filtered = list.filter((p) => p.id !== id);
    await saveKey("projects", filtered);
    return filtered.length < initialLen;
  }

  // Skills CRUD
  public static async getSkills(): Promise<SkillCategory[]> {
    return loadKey<SkillCategory[]>("skills", INITIAL_DATA.skills);
  }

  public static async setSkills(skills: SkillCategory[]): Promise<void> {
    await saveKey("skills", skills);
  }

  // Certifications CRUD
  public static async getCertifications(): Promise<CertificationItem[]> {
    return loadKey<CertificationItem[]>("certifications", INITIAL_DATA.certifications);
  }

  public static async addCertification(cert: CertificationItem): Promise<CertificationItem> {
    const list = await this.getCertifications();
    list.push(cert);
    await saveKey("certifications", list);
    return cert;
  }

  public static async deleteCertification(id: string): Promise<boolean> {
    const list = await this.getCertifications();
    const initialLen = list.length;
    const filtered = list.filter((c) => c.id !== id);
    await saveKey("certifications", filtered);
    return filtered.length < initialLen;
  }

  public static async updateCertification(id: string, updated: Partial<CertificationItem>): Promise<CertificationItem | null> {
    const list = await this.getCertifications();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updated };
    await saveKey("certifications", list);
    return list[idx];
  }

  // Contact Messages CRUD
  public static async getMessages(): Promise<ContactMessage[]> {
    return loadKey<ContactMessage[]>("messages", INITIAL_DATA.messages);
  }

  public static async addMessage(msg: Omit<ContactMessage, "id" | "timestamp" | "read">): Promise<ContactMessage> {
    const list = await this.getMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      replies: []
    };
    list.unshift(newMsg); // most recent first
    await saveKey("messages", list);
    return newMsg;
  }

  public static async markMessageRead(id: string): Promise<boolean> {
    const list = await this.getMessages();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    list[idx].read = true;
    await saveKey("messages", list);
    return true;
  }

  public static async deleteMessage(id: string): Promise<boolean> {
    const list = await this.getMessages();
    const initialLen = list.length;
    const filtered = list.filter((m) => m.id !== id);
    await saveKey("messages", filtered);
    return filtered.length < initialLen;
  }

  // Message Replies CRUD
  public static async addMessageReply(messageId: string, replyMessage: string): Promise<MessageReply | null> {
    const list = await this.getMessages();
    const idx = list.findIndex((m) => m.id === messageId);
    if (idx === -1) return null;
    
    const reply: MessageReply = {
      id: "rep_" + Math.random().toString(36).substr(2, 9),
      message: replyMessage,
      timestamp: new Date().toISOString()
    };
    
    if (!list[idx].replies) {
      list[idx].replies = [];
    }
    list[idx].replies!.push(reply);
    list[idx].read = true; // Auto-mark read when we reply!
    
    await saveKey("messages", list);
    return reply;
  }

  // Profile CRUD
  public static async getProfile(): Promise<Profile> {
    const profileDefault = INITIAL_DATA.profile || { photoUrl: "", resumeUrl: "" };
    return loadKey<Profile>("profile", profileDefault);
  }

  public static async updateProfile(updated: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const merged = { ...current, ...updated };
    await saveKey("profile", merged);
    return merged;
  }

  // File Upload CRUD
  public static async getUpload(filename: string): Promise<{ contentType: string, base64Data: string } | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("portfolio_uploads")
          .select("content_type, base64_data")
          .eq("filename", filename)
          .maybeSingle();

        if (error) {
          console.error(`Supabase load file error for filename "${filename}":`, error.message);
        } else if (data) {
          return {
            contentType: data.content_type,
            base64Data: data.base64_data
          };
        }
      } catch (e) {
        console.error(`Supabase connection failed for filename "${filename}":`, e);
      }
    }
    return null;
  }

  public static async saveUpload(filename: string, contentType: string, base64Data: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("portfolio_uploads")
          .upsert({ filename, content_type: contentType, base64_data: base64Data }, { onConflict: "filename" });

        if (error) {
          console.error(`Supabase save file error for filename "${filename}":`, error.message);
        }
      } catch (e) {
        console.error(`Supabase save file failed for filename "${filename}":`, e);
      }
    }
  }
}
