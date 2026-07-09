import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import { JSONDatabase } from "./db";
import { sendReplyEmail } from "./mailer";
import { fileURLToPath } from "url";

let resolvedFilename = "";
let resolvedDirname = "";

try {
  if (typeof __filename !== "undefined" && __filename) {
    resolvedFilename = __filename;
  } else if (typeof import.meta !== "undefined" && import.meta && import.meta.url) {
    resolvedFilename = fileURLToPath(import.meta.url);
  }
} catch (e) {
  // Safe fallback if url conversion fails
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

dotenv.config();

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

const RESUME_CONTEXT = `
You are Raviraj's AI Recruiter Assistant, representing Raviraj Chauhan, an exceptional Creative Full-Stack Developer.
You speak on his behalf with a professional, enthusiastic, and direct tone. Be helpful, concise, and focused on showcasing his strengths.

Here is Raviraj's full resume data:
Name: Raviraj Chauhan
Location: Botad, Gujarat, India
Phone: +91 7984887716
Email: ravirajchauhan219@gmail.com
Profiles: LinkedIn (https://linkedin.com), GitHub (https://github.com)

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Initialize and serve uploads directory for resume & photos
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
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
  app.get("/api/projects", (req, res) => {
    try {
      res.json(JSONDatabase.getProjects());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/skills", (req, res) => {
    try {
      res.json(JSONDatabase.getSkills());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/certifications", (req, res) => {
    try {
      res.json(JSONDatabase.getCertifications());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/profile", (req, res) => {
    try {
      res.json(JSONDatabase.getProfile());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST endpoint to handle public contact form submissions securely
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        res.status(400).json({ error: "Name, email, and message are required." });
        return;
      }
      const newMsg = JSONDatabase.addMessage({ name, email, message });
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
  app.post("/api/admin/projects", authenticateAdmin, (req, res) => {
    try {
      const { id, title, subtitle, tagline, description, features, techStack, year, links, metrics, imageUrl } = req.body;
      if (!id || !title || !subtitle || !description) {
        res.status(400).json({ error: "ID, Title, Subtitle, and Description are required." });
        return;
      }
      const newProj = JSONDatabase.addProject({
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

  app.put("/api/admin/projects/:id", authenticateAdmin, (req, res) => {
    try {
      const updated = JSONDatabase.updateProject(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Project not found." });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/projects/:id", authenticateAdmin, (req, res) => {
    try {
      const success = JSONDatabase.deleteProject(req.params.id);
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
  app.put("/api/admin/skills", authenticateAdmin, (req, res) => {
    try {
      const { categories } = req.body;
      if (!Array.isArray(categories)) {
        res.status(400).json({ error: "Categories must be a valid list." });
        return;
      }
      JSONDatabase.setSkills(categories);
      res.json({ success: true, skills: JSONDatabase.getSkills() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Profile API
  app.put("/api/admin/profile", authenticateAdmin, (req, res) => {
    try {
      const updated = JSONDatabase.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin File Upload API
  app.post("/api/admin/upload", authenticateAdmin, (req, res) => {
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
      
      const fileUrl = `/uploads/${sanitizedFileName}`;
      res.json({ success: true, url: fileUrl, fileName: sanitizedFileName });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Certifications Admin API
  app.post("/api/admin/certifications", authenticateAdmin, (req, res) => {
    try {
      const { title, issuer, link, imageUrl } = req.body;
      if (!title || !issuer || !link) {
        res.status(400).json({ error: "Title, Issuer, and Link are required." });
        return;
      }
      const id = "cert_" + Math.random().toString(36).substr(2, 9);
      const newCert = JSONDatabase.addCertification({ id, title, issuer, link, imageUrl: imageUrl || "" });
      res.status(201).json(newCert);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/certifications/:id", authenticateAdmin, (req, res) => {
    try {
      const success = JSONDatabase.deleteCertification(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Certification not found." });
        return;
      }
      res.json({ success: true, message: "Certification deleted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/certifications/:id", authenticateAdmin, (req, res) => {
    try {
      const { title, issuer, link, imageUrl } = req.body;
      const updated = JSONDatabase.updateCertification(req.params.id, { title, issuer, link, imageUrl });
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
  app.get("/api/admin/messages", authenticateAdmin, (req, res) => {
    try {
      res.json(JSONDatabase.getMessages());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/messages/:id/read", authenticateAdmin, (req, res) => {
    try {
      const success = JSONDatabase.markMessageRead(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Message not found." });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/messages/:id", authenticateAdmin, (req, res) => {
    try {
      const success = JSONDatabase.deleteMessage(req.params.id);
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

      const messages = JSONDatabase.getMessages();
      const targetMsg = messages.find(m => m.id === req.params.id);
      if (!targetMsg) {
        res.status(404).json({ error: "Target message not found." });
        return;
      }

      const reply = JSONDatabase.addMessageReply(req.params.id, replyMessage);
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

  // Dynamic AI reply drafting
  app.post("/api/admin/messages/:id/draft", authenticateAdmin, async (req, res) => {
    try {
      const messages = JSONDatabase.getMessages();
      const targetMsg = messages.find(m => m.id === req.params.id);
      if (!targetMsg) {
        res.status(404).json({ error: "Message not found." });
        return;
      }

      // Check for Gemini API key
      if (!process.env.GEMINI_API_KEY) {
        res.json({
          draft: `Hi ${targetMsg.name},\n\nThank you for reaching out! I appreciate your message: "${targetMsg.message.slice(0, 40)}...". I will get back to you shortly.\n\nBest regards,\nRaviraj Chauhan\n(AI Assistant: Setup your GEMINI_API_KEY to draft ultra-personalized responses)`
        });
        return;
      }

      const client = getGeminiClient();
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

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      });

      const draft = response.text || "Failed to generate AI draft. Please compose your reply manually.";
      res.json({ success: true, draft });
    } catch (err: any) {
      console.error("Gemini API Error in /api/admin/messages/:id/draft:", err);
      res.status(500).json({ error: err.message || "An error occurred while generating reply draft" });
    }
  });

  // AI Recruiter Chatbot API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      // Check for Gemini API key
      if (!process.env.GEMINI_API_KEY) {
        res.json({
          reply: "Hello! I am Raviraj's AI Recruiter Assistant. I'd love to tell you all about his projects and skills, but my Gemini API Key is currently not configured in the Secrets panel. Please provide a GEMINI_API_KEY in Settings to enable my live intelligence! In the meantime, you can explore the portfolio below which contains all of Raviraj's verified resume data.",
        });
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

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
      });

      const reply = response.text || "I apologize, but I could not formulate a response at the moment. Please feel free to ask another question!";
      res.json({ reply });
    } catch (err: any) {
      console.error("Gemini API Error in /api/chat:", err);
      res.status(500).json({ error: err.message || "An error occurred while generating response" });
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
