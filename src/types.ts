export interface Project {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: string[];
  year: string;
  links: {
    github?: string;
    live?: string;
  };
  metrics?: string;
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
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}
