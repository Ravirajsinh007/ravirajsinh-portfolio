import fs from "fs";
import path from "path";

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

const DB_FILE = path.join(process.cwd(), "database.json");

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
  private static load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.save(INITIAL_DATA);
        return INITIAL_DATA;
      }
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Migrate existing schemas if necessary to add default properties
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

  private static save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Database save failed:", e);
    }
  }

  // Projects CRUD
  public static getProjects(): Project[] {
    return this.load().projects;
  }

  public static addProject(project: Project): Project {
    const db = this.load();
    db.projects.push(project);
    this.save(db);
    return project;
  }

  public static updateProject(id: string, updated: Partial<Project>): Project | null {
    const db = this.load();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.projects[idx] = { ...db.projects[idx], ...updated };
    this.save(db);
    return db.projects[idx];
  }

  public static deleteProject(id: string): boolean {
    const db = this.load();
    const initialLen = db.projects.length;
    db.projects = db.projects.filter((p) => p.id !== id);
    this.save(db);
    return db.projects.length < initialLen;
  }

  // Skills CRUD
  public static getSkills(): SkillCategory[] {
    return this.load().skills;
  }

  public static setSkills(skills: SkillCategory[]): void {
    const db = this.load();
    db.skills = skills;
    this.save(db);
  }

  // Certifications CRUD
  public static getCertifications(): CertificationItem[] {
    return this.load().certifications;
  }

  public static addCertification(cert: CertificationItem): CertificationItem {
    const db = this.load();
    db.certifications.push(cert);
    this.save(db);
    return cert;
  }

  public static deleteCertification(id: string): boolean {
    const db = this.load();
    const initialLen = db.certifications.length;
    db.certifications = db.certifications.filter((c) => c.id !== id);
    this.save(db);
    return db.certifications.length < initialLen;
  }

  public static updateCertification(id: string, updated: Partial<CertificationItem>): CertificationItem | null {
    const db = this.load();
    const idx = db.certifications.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.certifications[idx] = { ...db.certifications[idx], ...updated };
    this.save(db);
    return db.certifications[idx];
  }

  // Contact Messages CRUD
  public static getMessages(): ContactMessage[] {
    return this.load().messages;
  }

  public static addMessage(msg: Omit<ContactMessage, "id" | "timestamp" | "read">): ContactMessage {
    const db = this.load();
    const newMsg: ContactMessage = {
      ...msg,
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      replies: []
    };
    db.messages.unshift(newMsg); // most recent first
    this.save(db);
    return newMsg;
  }

  public static markMessageRead(id: string): boolean {
    const db = this.load();
    const idx = db.messages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    db.messages[idx].read = true;
    this.save(db);
    return true;
  }

  public static deleteMessage(id: string): boolean {
    const db = this.load();
    const initialLen = db.messages.length;
    db.messages = db.messages.filter((m) => m.id !== id);
    this.save(db);
    return db.messages.length < initialLen;
  }

  // Message Replies CRUD
  public static addMessageReply(messageId: string, replyMessage: string): MessageReply | null {
    const db = this.load();
    const idx = db.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return null;
    
    const reply: MessageReply = {
      id: "rep_" + Math.random().toString(36).substr(2, 9),
      message: replyMessage,
      timestamp: new Date().toISOString()
    };
    
    if (!db.messages[idx].replies) {
      db.messages[idx].replies = [];
    }
    db.messages[idx].replies!.push(reply);
    db.messages[idx].read = true; // Auto-mark read when we reply!
    
    this.save(db);
    return reply;
  }

  // Profile CRUD
  public static getProfile(): Profile {
    const db = this.load();
    if (!db.profile) {
      db.profile = { photoUrl: "", resumeUrl: "" };
      this.save(db);
    }
    return db.profile;
  }

  public static updateProfile(updated: Partial<Profile>): Profile {
    const db = this.load();
    db.profile = { ...(db.profile || { photoUrl: "", resumeUrl: "" }), ...updated };
    this.save(db);
    return db.profile;
  }
}
