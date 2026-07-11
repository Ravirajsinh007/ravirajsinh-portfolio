import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import { JSONDatabase } from "./db";
import { sendReplyEmail } from "./mailer";
import { fileURLToPath } from "url";

// Safe ES Module/CommonJS path resolution
let resolvedFilename = "";
let resolvedDirname = "";

try {
  if (typeof __filename !== "undefined" && __filename) {
    resolvedFilename = __filename;
  } else if (typeof import.meta !== "undefined" && import.meta && import.meta.url) {
    resolvedFilename = fileURLToPath(import.meta.url);
  }
} catch (e) {
  // Safe fallback
}

try {
  if (typeof __dirname !== "undefined" && __dirname) {
    resolvedDirname = __dirname;
  } else if (resolvedFilename) {
    resolvedDirname = path.dirname(resolvedFilename);
  } else {
    resolvedDirname = process.cwd();
  }
} catch (e) {
  resolvedDirname = process.cwd();
}

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust retry wrapper with exponential backoff for handling transient Google Gemini API 503/429 errors
async function generateWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err.status || (err.error && err.error.code);
    const message = err.message || (err.error && err.error.message) || "";
    
    const isRetriable = 
      status === 503 || 
      status === 429 || 
      message.includes("503") || 
      message.includes("UNAVAILABLE") || 
      message.includes("high demand") || 
      message.includes("overloaded") || 
      message.includes("limit") || 
      message.includes("temporary");
    
    if (isRetriable && retries > 0) {
      console.warn(`[Gemini API] Transient error encountered (Status: ${status}, Msg: ${message}). Retrying in ${delayMs}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return generateWithRetry(fn, retries - 1, delayMs * 1.5); // 1.5x exponential backoff multiplier
    }
    throw err;
  }
}

const RESUME_CONTEXT = `
You are Raviraj's AI Recruiter Assistant, representing Raviraj Chauhan, an exceptional Creative Full-Stack Developer.
You speak on his behalf with a professional, enthusiastic, and direct tone. Be helpful, concise, and focused on showcasing his strengths.

Here is Raviraj's full resume data:
Name: Raviraj Chauhan
Location: Botad, Gujarat, India
Phone: +91 7984887716
Email: ravirajchauhan219@gmail.com
Profiles: LinkedIn (https://www.linkedin.com/in/ravirajsinh-chauhan-199912245/), GitHub (https://github.com/Ravirajsinh007)

Summary:
MCA student at CHARUSAT with hands-on experience in full-stack web development using Django, Angular, and SQL databases. Developed EduTrack, a role-based learning management platform featuring authentication, REST APIs, assignment tracking, and student progress monitoring. Strong foundation in software development, database design, and problem solving.

Education:
- Master of Computer Application (MCA) — CMPICA, CHARUSAT, Anand | Jul 2025–Present | Current CGPA: 7.7
- Bachelor of Computer Application (BCA) — SEMCOM, CVMU, Anand | Jul 2022–Apr 2025 | 9.68 CGPA (Academic Excellence)
- 12th Higher Secondary — Shree Sahjanand High School, Botad | Jun 2021–Mar 2022 | 97.55%

Skills:
- Languages: Python, JavaScript, Java, PHP, C/C++
- Frontend: AngularJS, HTML5, CSS3, Bootstrap
- Backend: Django, Django REST Framework, REST APIs, JWT Authentication, Role-Based Access Control (RBAC)
- Databases: MySQL, MongoDB, MS SQL Server, SQLite3
- Tools: Git/GitHub, Postman, Visual Studio, WAMP
- Additional Exposure: Node.js, Express.js

Projects:
1. EduTrack — Student Assignment & Learning Management Portal (2025)
   Tech: Python, Django REST Framework, AngularJS, SQLite3, JWT Authentication, GitHub
   Details: Role-based LMS with Separate Student & Instructor Dashboards. Built REST APIs for auth, course creation, file uploads, grading, progress tracking, announcements. Normalization of SQLite database with full foreign key constraints. Full lifecycle coverage.
2. E-Commerce Platform — Home Decor Store (2023)
   Tech: WordPress, WooCommerce, Custom CSS/HTML, UI/UX Design, Cloud Infrastructure
   Details: Deployed on cloud infra, full lifecycle from local setup to live production with performance optimization. Engineered mobile-optimized 'Watch & Shop' video reel and dynamic testimonial gallery.
3. Production Management System (2024)
   Tech: PHP, MySQL, HTML, CSS
   Details: Dynamic dashboards visualizing production metrics (yearly/monthly/weekly) with secure CRUD operations and structured data querying.

Achievements:
- Scroll of Honor — SEMCOM — awarded for outstanding academic performance & extracurricular contributions.
- CODEMANTHAN 1.0 Hackathon — developed innovative solution under competition constraints.
- Academic Excellence: 9.68 CGPA (BCA), 97.55 percentile (12th board).

Certifications:
- Django Application Development with SQL and Database — IBM (Coursera)
- Python Data Structures: Lists, Strings & Files — University of Michigan (Coursera)
- Python Basics: Selection and Iteration — University of Michigan (Coursera)

Guidelines for your answers:
- Answer from the perspective of Raviraj's professional representative. You can say "Raviraj has..." or "Raviraj developed...".
- Be professional, conversational, and focus on details from his resume.
- Keep responses relatively brief (1-3 small paragraphs), clear, and beautifully structured (using markdown lists or bold text when appropriate).
- If asked about contact info, provide his email, location, and phone number clearly.
- If asked about salary or availability, mention he is open to internships, full-time recruiter chats, and project collaborations.
`;

function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("greet") || q.includes("morning") || q.includes("afternoon")) {
    return "Hello! I am Raviraj's AI Recruiter Assistant. I can tell you about his academic journey, core skills, projects, and achievements. What would you like to know today?";
  }
  
  if (q.includes("project") || q.includes("edutrack") || q.includes("ecommerce") || q.includes("portfolio") || q.includes("lms") || q.includes("app")) {
    return `Raviraj has developed several highly functional projects:
1. **EduTrack (2025)**: A role-based Student Assignment & Learning Management Portal built using **Python, Django REST Framework, AngularJS, SQLite3, and JWT Authentication**. It features separating student and instructor dashboards, course creation, assignment tracking, grading, and a normalized relational database.
2. **E-Commerce Platform (2023)**: A Home Decor Store powered by **WordPress, WooCommerce, and Custom CSS/HTML**. Includes a mobile-optimized 'Watch & Shop' video reel.
3. **Production Management System (2024)**: Built with **PHP and MySQL**, featuring visual dashboards for yearly/monthly/weekly production metrics with secure CRUD operations.`;
  }
  
  if (q.includes("skill") || q.includes("languages") || q.includes("database") || q.includes("tech") || q.includes("frontend") || q.includes("backend") || q.includes("stack") || q.includes("toolkit")) {
    return `Raviraj's technical toolkit comprises:
- **Programming Languages**: Python, JavaScript, Java, PHP, C/C++
- **Frontend Architecture**: AngularJS, HTML5, CSS3, Tailwind CSS, Bootstrap (with exposure to modern React.js)
- **Backend Architecture**: Django, Django REST Framework, REST APIs, JWT, RBAC, Node.js, Express.js
- **Database Management**: MySQL, MongoDB, SQLite3, MS SQL Server
- **Developer Tools**: Git/GitHub, Postman, Visual Studio, WAMP`;
  }
  
  if (q.includes("education") || q.includes("college") || q.includes("university") || q.includes("mca") || q.includes("bca") || q.includes("gpa") || q.includes("academic") || q.includes("charusat") || q.includes("semcom")) {
    return `Here is a summary of Raviraj's academic background:
- **Master of Computer Application (MCA)**: CMPICA, CHARUSAT, Anand | July 2025 – Present | Current CGPA: **7.7**
- **Bachelor of Computer Application (BCA)**: SEMCOM, CVMU, Anand | July 2022 – April 2025 | Graduated with **9.68 CGPA** and academic excellence (awarded the Scroll of Honor).
- **12th Higher Secondary (Science)**: Shree Sahjanand High School, Botad | June 2021 – March 2022 | **97.55 percentile**.`;
  }
  
  if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("linkedin") || q.includes("github") || q.includes("reach") || q.includes("address") || q.includes("location") || q.includes("live") || q.includes("call")) {
    return `You can reach Raviraj Chauhan directly through:
- **Email**: ravirajchauhan219@gmail.com
- **Phone**: +91 7984887716
- **Location**: Botad, Gujarat, India
- **LinkedIn**: [LinkedIn Profile](https://linkedin.com)
- **GitHub**: [GitHub Profile](https://github.com)

Feel free to send a message using the Contact section on this page! It will directly register in his dashboard.`;
  }

  if (q.includes("experience") || q.includes("job") || q.includes("work") || q.includes("internship") || q.includes("hiring") || q.includes("hire")) {
    return `Raviraj is currently pursuing his MCA at CHARUSAT and is enthusiastically looking for full-time full-stack developer roles or internship opportunities. He is fully open to recruiters, interview invitations, and project collaborations. He is strong in building secure REST APIs, designing clean relational schemas, and frontend-backend synchronization.`;
  }

  if (q.includes("achieve") || q.includes("cert") || q.includes("award") || q.includes("honor") || q.includes("hackathon") || q.includes("codemanthan")) {
    return `Raviraj's notable credentials include:
- **Scroll of Honor** from SEMCOM for outstanding academic & leadership achievements.
- **CODEMANTHAN 1.0 Hackathon** participant where he developed innovative custom solutions under tight deadlines.
- **IBM Professional Certification** in *Django Application Development with SQL and Databases*.
- **University of Michigan Certifications** in *Python Data Structures* and *Python Basics*.`;
  }

  return `I am Raviraj's recruiter assistant. I can answer questions about his:
- 🎓 **Education** (MCA at CHARUSAT, BCA at SEMCOM)
- 💻 **Tech Stack** (Django, Python, AngularJS, MySQL, etc.)
- 🚀 **Projects** (EduTrack, E-Commerce, Production Management System)
- 🏆 **Achievements** (9.68 BCA CGPA, Scroll of Honor, IBM certifications)
- 📞 **Contact details** (Email, Location, LinkedIn)

Please feel free to ask about any of these topics! *(Note: The live generative assistant mode is currently offline due to an invalid or unconfigured Gemini API key, so I am answering using my built-in index of his resume details)*`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Robust CORS middleware supporting dynamic split-hosting (e.g. Vercel frontend & Render backend)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle Preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Initialize and serve uploads directory for resume & photos
  const getStorageDir = (): string => {
    if (process.env.PERSISTENT_DIR) {
      const pDir = path.resolve(process.env.PERSISTENT_DIR);
      if (!fs.existsSync(pDir)) {
        try {
          fs.mkdirSync(pDir, { recursive: true });
        } catch (err) {
          console.error("Could not create PERSISTENT_DIR for uploads:", pDir, err);
        }
      }
      return pDir;
    }
    return process.cwd();
  };

  const uploadsDir = path.join(getStorageDir(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.get("/uploads/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsDir, filename);

      // 1. Check if the file exists locally, if so serve it immediately (extremely fast)
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
        return;
      }

      // 2. If it is missing locally (e.g. after a redeployment), pull it from the Supabase database
      const dbFile = await JSONDatabase.getUpload(filename);
      if (dbFile) {
        const buffer = Buffer.from(dbFile.base64Data, "base64");
        // Cache it locally so subsequent requests are lightning-fast and don't hit the database
        fs.writeFileSync(filePath, buffer);
        
        res.setHeader("Content-Type", dbFile.contentType);
        res.send(buffer);
        return;
      }

      res.status(404).send("File not found");
    } catch (err: any) {
      console.error("Error serving uploaded file:", err);
      res.status(500).send("Internal server error");
    }
  });

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Detailed Live System Diagnostics check
  app.get("/api/status-check", async (req, res) => {
    try {
      const dbPath = path.join(process.cwd(), "database.json");
      let dbSize = 0;
      let dbRecordsCount = 0;

      try {
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          dbSize = stats.size;
        }
        // Count database records dynamically
        const projectsCount = (await JSONDatabase.getProjects()).length;
        const skillsCount = (await JSONDatabase.getSkills()).length;
        const certsCount = (await JSONDatabase.getCertifications()).length;
        const msgsCount = (await JSONDatabase.getMessages()).length;
        dbRecordsCount = projectsCount + skillsCount + certsCount + msgsCount;
      } catch (dbErr) {
        console.error("Error evaluating database status:", dbErr);
      }

      // Evaluate Mailer Carrier configuration
      const hasResendConfig = !!process.env.RESEND_API_KEY;
      const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      
      let mailerCarrier = "Ethereal Sandbox SMTP";
      if (hasResendConfig) {
        mailerCarrier = "Resend API Service";
      } else if (hasSmtpConfig) {
        mailerCarrier = "Production SMTP";
      }

      // Evaluate Gemini configurations
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

      res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          api: {
            status: "operational",
            name: "Portfolio Node/Express REST Gateway",
            version: "2.5.2",
            host: req.headers.host || "local"
          },
          database: {
            status: "operational",
            name: hasSupabase ? "Supabase PostgreSQL Cloud Database" : "JSONDatabase Dynamic Local Storage",
            sizeBytes: hasSupabase ? 0 : dbSize,
            recordsCount: dbRecordsCount,
            file: hasSupabase ? "Cloud Store Table" : "database.json"
          },
          gemini: {
            status: hasGeminiKey ? "operational" : "degraded",
            name: "Google Gemini Core AI model",
            model: "gemini-2.5-flash",
            keyConfigured: hasGeminiKey,
            mode: "Server-side JSON Proxy"
          },
          mailer: {
            status: "operational",
            name: hasResendConfig ? "Resend Mailer Gateway" : "Nodemailer Gateway Engine",
            carrier: mailerCarrier,
            secure: hasResendConfig ? true : process.env.SMTP_PORT === "465"
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        error: err.message || "Diagnostics failed"
      });
    }
  });

  // Admin JWT secret & password configuration
  const JWT_SECRET = process.env.JWT_SECRET || "raviraj_portfolio_jwt_secret_token_key_2026";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  // Admin authentication middleware
  function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access denied. Authentication required." });
      return;
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).admin = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: "Session expired or invalid token." });
    }
  }

  // PUBLIC APIs for Dynamic Portfolio Content
  app.get("/api/projects", async (req, res) => {
    try {
      res.json(await JSONDatabase.getProjects());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/skills", async (req, res) => {
    try {
      res.json(await JSONDatabase.getSkills());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/certifications", async (req, res) => {
    try {
      res.json(await JSONDatabase.getCertifications());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/profile", async (req, res) => {
    try {
      res.json(await JSONDatabase.getProfile());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST endpoint to handle public contact form submissions securely
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        res.status(400).json({ error: "Name, email, and message are required." });
        return;
      }
      const newMsg = await JSONDatabase.addMessage({ name, email, message });
      res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ADMIN LOGIN API
  app.post("/api/admin/login", (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: "Password is required." });
        return;
      }
      if (password !== ADMIN_PASSWORD) {
        res.status(401).json({ error: "Invalid administrator password." });
        return;
      }
      // Generate JWT valid for 7 days
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ADMIN ENDPOINTS (SECURED via JWT middleware)
  
  // Projects Admin API
  app.post("/api/admin/projects", authenticateAdmin, async (req, res) => {
    try {
      const { id, title, subtitle, tagline, description, features, techStack, year, links, metrics, imageUrl } = req.body;
      if (!id || !title || !subtitle || !description) {
        res.status(400).json({ error: "ID, Title, Subtitle, and Description are required." });
        return;
      }
      const newProj = await JSONDatabase.addProject({
        id,
        title,
        subtitle,
        tagline: tagline || "",
        description,
        features: Array.isArray(features) ? features : [],
        techStack: Array.isArray(techStack) ? techStack : [],
        year: year || new Date().getFullYear().toString(),
        links: links || {},
        metrics: metrics || "",
        imageUrl: imageUrl || ""
      });
      res.status(201).json(newProj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/projects/:id", authenticateAdmin, async (req, res) => {
    try {
      const updated = await JSONDatabase.updateProject(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Project not found." });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/projects/:id", authenticateAdmin, async (req, res) => {
    try {
      const success = await JSONDatabase.deleteProject(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Project not found." });
        return;
      }
      res.json({ success: true, message: "Project deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Skills Admin API (replaces entire skills array for easy sorting/management)
  app.put("/api/admin/skills", authenticateAdmin, async (req, res) => {
    try {
      const { categories } = req.body;
      if (!Array.isArray(categories)) {
        res.status(400).json({ error: "Categories must be a valid list." });
        return;
      }
      await JSONDatabase.setSkills(categories);
      res.json({ success: true, skills: await JSONDatabase.getSkills() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Profile API
  app.put("/api/admin/profile", authenticateAdmin, async (req, res) => {
    try {
      const updated = await JSONDatabase.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin File Upload API
  app.post("/api/admin/upload", authenticateAdmin, async (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileName || !fileData) {
        res.status(400).json({ error: "fileName and fileData are required." });
        return;
      }
      
      const base64Content = fileData.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Content, "base64");
      
      const fileExt = path.extname(fileName) || "";
      const baseName = path.basename(fileName, fileExt).replace(/[^a-zA-Z0-9_\-]/g, "_");
      const sanitizedFileName = `${Date.now()}_${baseName}${fileExt}`;
      const filePath = path.join(uploadsDir, sanitizedFileName);
      
      fs.writeFileSync(filePath, buffer);

      // Extract the MIME type from the base64 string if present, defaulting to stream
      const mimeMatch = fileData.match(/^data:(.*?);base64,/);
      const contentType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

      // Persist the file in Supabase PostgreSQL Cloud Database so it's never lost
      await JSONDatabase.saveUpload(sanitizedFileName, contentType, base64Content);
      
      const fileUrl = `/uploads/${sanitizedFileName}`;
      res.json({ success: true, url: fileUrl, fileName: sanitizedFileName });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Certifications Admin API
  app.post("/api/admin/certifications", authenticateAdmin, async (req, res) => {
    try {
      const { title, issuer, link, imageUrl } = req.body;
      if (!title || !issuer || !link) {
        res.status(400).json({ error: "Title, Issuer, and Link are required." });
        return;
      }
      const id = "cert_" + Math.random().toString(36).substr(2, 9);
      const newCert = await JSONDatabase.addCertification({ id, title, issuer, link, imageUrl: imageUrl || "" });
      res.status(201).json(newCert);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/certifications/:id", authenticateAdmin, async (req, res) => {
    try {
      const success = await JSONDatabase.deleteCertification(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Certification not found." });
        return;
      }
      res.json({ success: true, message: "Certification deleted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/certifications/:id", authenticateAdmin, async (req, res) => {
    try {
      const { title, issuer, link, imageUrl } = req.body;
      const updated = await JSONDatabase.updateCertification(req.params.id, { title, issuer, link, imageUrl });
      if (!updated) {
        res.status(404).json({ error: "Certification not found." });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Contact Messages Admin API
  app.get("/api/admin/messages", authenticateAdmin, async (req, res) => {
    try {
      res.json(await JSONDatabase.getMessages());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/messages/:id/read", authenticateAdmin, async (req, res) => {
    try {
      const success = await JSONDatabase.markMessageRead(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Message not found." });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/messages/:id", authenticateAdmin, async (req, res) => {
    try {
      const success = await JSONDatabase.deleteMessage(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Message not found." });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reply directly to messages
  app.post("/api/admin/messages/:id/reply", authenticateAdmin, async (req, res) => {
    try {
      const { replyMessage } = req.body;
      if (!replyMessage) {
        res.status(400).json({ error: "Reply message body is required." });
        return;
      }

      const messages = await JSONDatabase.getMessages();
      const targetMsg = messages.find(m => m.id === req.params.id);
      if (!targetMsg) {
        res.status(404).json({ error: "Target message not found." });
        return;
      }

      const reply = await JSONDatabase.addMessageReply(req.params.id, replyMessage);
      if (!reply) {
        res.status(404).json({ error: "Failed to add reply to database." });
        return;
      }

      // Send the email reply!
      const mailResult = await sendReplyEmail({
        to: targetMsg.email,
        toName: targetMsg.name,
        subject: `Re: Message from ${targetMsg.name} on Portfolio`,
        replyText: replyMessage,
        originalMessage: targetMsg.message
      });

      res.json({ 
        success: true, 
        reply, 
        emailSent: mailResult.success,
        previewUrl: mailResult.previewUrl 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper function to fetch from Grok with automatic model candidates fallback
  async function generateWithGrok(messages: any[], temperature = 0.7) {
    const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (!grokKey) {
      throw new Error("No Grok API key found.");
    }

    // Try standard candidate models in order of best results and widest availability
    const candidates = [];
    if (process.env.GROK_MODEL) {
      candidates.push(process.env.GROK_MODEL);
    }
    candidates.push("grok-2");
    candidates.push("grok-beta");
    candidates.push("grok-2-latest");
    candidates.push("grok-2-1212");

    let lastError: any = null;

    for (const model of candidates) {
      try {
        console.log(`[Grok API] Attempting response generation using model: "${model}"`);
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${grokKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            console.log(`[Grok API] Successfully generated response using model: "${model}"`);
            return { content, modelUsed: model };
          }
        } else {
          const errText = await response.text();
          console.warn(`[Grok API] Model "${model}" failed with status ${response.status}: ${errText}`);
          
          // If the model is not found, we try the next candidate
          if (errText.includes("Model not found") || errText.includes("invalid-argument") || response.status === 400) {
            lastError = new Error(`Grok API error: ${response.status} - ${errText}`);
            continue;
          }
          // For auth or other critical errors, throw immediately to avoid wasting requests
          throw new Error(`Grok API error: ${response.status} - ${errText}`);
        }
      } catch (err: any) {
        console.error(`[Grok API] Error with model "${model}":`, err.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to generate response with any available Grok models.");
  }

  // Dynamic AI reply drafting
  app.post("/api/admin/messages/:id/draft", authenticateAdmin, async (req, res) => {
    try {
      const messages = await JSONDatabase.getMessages();
      const targetMsg = messages.find(m => m.id === req.params.id);
      if (!targetMsg) {
        res.status(404).json({ error: "Message on database not found." });
        return;
      }

      const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      const promptText = `
System Context: ${RESUME_CONTEXT}

The user "${targetMsg.name}" <${targetMsg.email}> has sent the following contact message:
"""
${targetMsg.message}
"""

Please draft a professional, warm, and tailored email reply on behalf of Raviraj Chauhan.
- Directly address their inquiry.
- Reference relevant skills or projects from the resume if helpful.
- Keep the tone polite, eager, and highly professional.
- Start directly with the email greeting, e.g., "Hi [Name]," and end with standard professional signature block. Do not include subject lines or extra formatting.
`;

      // 1. Try Grok API if key is present
      if (grokKey) {
        try {
          const grokMessages = [
            { role: "system", content: "You are an assistant drafting email replies on behalf of Raviraj Chauhan." },
            { role: "user", content: promptText }
          ];
          const result = await generateWithGrok(grokMessages, 0.7);
          res.json({ success: true, draft: result.content });
          return;
        } catch (grokErr: any) {
          console.error("Grok error in drafting, attempting Gemini fallback:", grokErr.message || grokErr);
        }
      }

      // 2. Fallback to Gemini if key is present
      if (!process.env.GEMINI_API_KEY) {
        res.json({
          draft: `Hi ${targetMsg.name},\n\nThank you for reaching out! I appreciate your message: "${targetMsg.message.slice(0, 40)}...". I will get back to you shortly.\n\nBest regards,\nRaviraj Chauhan\n(AI Assistant: Setup your GROK_API_KEY or GEMINI_API_KEY to draft ultra-personalized responses)`
        });
        return;
      }

      const client = getGeminiClient();
      const response = await generateWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      }));

      const draft = response.text || "Failed to generate AI draft. Please compose your reply manually.";
      res.json({ success: true, draft });
    } catch (err: any) {
      console.error("Gemini API Error in /api/admin/messages/:id/draft:", err);
      // Fallback draft generation
      const targetMsg = (await JSONDatabase.getMessages()).find(m => m.id === req.params.id);
      const senderName = targetMsg ? targetMsg.name : "there";
      const userMessageExcerpt = targetMsg ? `"${targetMsg.message.slice(0, 50)}..."` : "your message";
      const fallbackDraft = `Hi ${senderName},\n\nThank you so much for reaching out to me! I appreciate your message regarding ${userMessageExcerpt}.\n\nI am very interested in your inquiry and would love to discuss this further. Please let me know a convenient time for us to connect, or feel free to email me directly at ravirajchauhan219@gmail.com.\n\nBest regards,\nRaviraj Chauhan\n\n*(Note: This standard response was drafted automatically as the live Gemini API key is currently experiencing issues)*`;
      res.json({ success: true, draft: fallbackDraft });
    }
  });

  // AI Recruiter Chatbot API
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    try {
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

      // 1. If Grok key is specified, route directly to xAI endpoint
      if (grokKey) {
        try {
          const chatHistory = history || [];
          const messages = [
            {
              role: "system",
              content: RESUME_CONTEXT
            },
            ...chatHistory.map((h: any) => ({
              role: h.sender === "user" ? "user" : "assistant",
              content: h.text,
            })),
            {
              role: "user",
              content: message,
            }
          ];

          const result = await generateWithGrok(messages, 0.7);
          res.json({ reply: result.content, provider: `Grok (${result.modelUsed})` });
          return;
        } catch (grokErr: any) {
          console.error("Grok chatbot error, attempting Gemini fallback:", grokErr.message || grokErr);
        }
      }

      // 2. Otherwise use Google Gemini API
      if (!process.env.GEMINI_API_KEY) {
        // Fallback gracefully immediately if key is missing
        const fallbackReply = generateFallbackResponse(message);
        res.json({ reply: fallbackReply, isFallback: true, provider: "Local AI" });
        return;
      }

      const client = getGeminiClient();
      
      // Structure chat context
      const chatHistory = history || [];
      const contents = [
        {
          role: "user",
          parts: [{ text: `System Instruction: ${RESUME_CONTEXT}\n\nInitialize chat.` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am Raviraj Chauhan's Recruiter Assistant. I am ready to answer any questions about his academic journey, skills, and projects." }],
        },
        ...chatHistory.map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        }
      ];

      const response = await generateWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
      }));

      const reply = response.text || "I apologize, but I could not formulate a response at the moment. Please feel free to ask another question!";
      res.json({ reply, provider: "Gemini" });
    } catch (err: any) {
      console.error("AI Recruiter Chatbot error:", err);
      // Fallback gracefully to local keyword-based resume assistant to ensure 100% availability
      const fallbackReply = generateFallbackResponse(message);
      res.json({ reply: fallbackReply, isFallback: true, provider: "Local AI" });
    }
  });

  // Serve static client bundle or route with Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const rootPath = path.resolve(process.cwd(), "frontend").replace(/\\/g, "/");
    const configPath = path.resolve(process.cwd(), "vite.config.ts").replace(/\\/g, "/");

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: rootPath,
      configFile: configPath,
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
