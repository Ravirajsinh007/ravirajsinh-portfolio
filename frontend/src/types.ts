export interface Project {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: string[];
  year: string;
  category?: string; // e.g. "Web" or "App"
  links: {
    github?: string;
    live?: string;
  };
  metrics?: string;
  imageUrl?: string;
}

export interface SkillCategory {
  category: string;
  skills: {
    name: string;
    level: number; // 0 to 100
    icon?: string;
  }[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  location: string;
  duration: string;
  grade: string;
  details?: string;
}

export interface AchievementItem {
  title: string;
  issuer: string;
  description: string;
  year: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  link: string;
  id?: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
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
