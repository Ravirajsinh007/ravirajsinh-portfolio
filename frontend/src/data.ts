import { Project, SkillCategory, EducationItem, AchievementItem, CertificationItem } from "./types";

export const RESUME_DATA = {
  name: "Raviraj Chauhan",
  title: "Professional Full-Stack Engineer",
  taglines: [
    "Full-Stack Developer",
    "Django & REST API Architect",
    "Modern Web Applications Specialist",
    "Scalable Backend & Databases Expert"
  ],
  location: "Botad, Gujarat, India",
  phone: "+91 7984887716",
  email: "ravirajchauhan219@gmail.com",
  socials: {
    github: "https://github.com/raviraj-chauhan", // Realistic default
    linkedin: "https://linkedin.com/in/raviraj-chauhan" // Realistic default
  }
};

export const PROJECTS: Project[] = [
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
    links: {
      github: "#",
      live: "https://example.com" // Placeholder for live link
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
    links: {
      github: "https://github.com/raviraj-chauhan/production-system",
      live: "#"
    },
    metrics: "Weekly/Monthly Analytics, SQL Index-Optimized Queries"
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
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
];

export const EDUCATION: EducationItem[] = [
  {
    institution: "CMPICA, CHARUSAT University, Anand",
    degree: "Master of Computer Application (MCA)",
    location: "Anand, Gujarat, India",
    duration: "Jul 2025 – Present",
    grade: "7.7 CGPA (Ongoing)",
    details: "Diving deep into advanced software engineering, distributed systems, enterprise frameworks, and intelligent applications."
  },
  {
    institution: "SEMCOM College, CVMU University, Anand",
    degree: "Bachelor of Computer Application (BCA)",
    location: "Anand, Gujarat, India",
    duration: "Jul 2022 – Apr 2025",
    grade: "9.68 CGPA (Academic Excellence)",
    details: "Awarded 'Scroll of Honor' for outstanding academic performance and active extracurricular contributions. Strengthened core programming paradigms, database normalization, and web stack mechanics."
  },
  {
    institution: "Shree Sahjanand High School, Botad",
    degree: "12th Higher Secondary Board",
    location: "Botad, Gujarat, India",
    duration: "Jun 2021 – Mar 2022",
    grade: "97.55 Percentile",
    details: "Completed standard secondary education focusing on mathematics, computer science, and physics with exceptional grades."
  }
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    title: "Scroll of Honor",
    issuer: "SEMCOM",
    description: "Awarded the prestigious college Scroll of Honor for exemplary academic success and significant contributions to technical events and club coordination.",
    year: "2025"
  },
  {
    title: "CODEMANTHAN 1.0 Hackathon Winner",
    issuer: "CVMU Tech Fest",
    description: "Designed, coded, and demonstrated an innovative solution under rigorous competitive constraints and judging panels, showcasing rapid application development.",
    year: "2024"
  },
  {
    title: "Highest CGPA Honor",
    issuer: "BCA Department",
    description: "Maintained a near-perfect 9.68 CGPA throughout the three years of undergraduate coursework, ranking near the absolute top of the university cohort.",
    year: "2025"
  }
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    title: "Django Application Development with SQL and Databases",
    issuer: "IBM (Coursera)",
    link: "https://coursera.org",
    id: "IBM-DJ-01"
  },
  {
    title: "Python Data Structures: Lists, Strings & Files",
    issuer: "University of Michigan (Coursera)",
    link: "https://coursera.org",
    id: "UMICH-PDS-02"
  },
  {
    title: "Python Basics: Selection and Iteration",
    issuer: "University of Michigan (Coursera)",
    link: "https://coursera.org",
    id: "UMICH-PBI-03"
  }
];
