# 🚀 FREE CLOUD DEPLOYMENT GUIDE (SPLIT ARCHITECTURE)

This guide walks you through deploying your dynamic Developer Portfolio and Admin Panel to the cloud **100% for free** using a modern, professional split architecture:
- **Frontend SPA**: Hosted on **Railway** (Static Web Hosting).
- **Backend API Server**: Hosted on **Render** (Node.js Web Service).

---

## 📋 PRE-FLIGHT PREPARATION

Before deploying, ensure you have your code pushed to a public or private **GitHub Repository**. 

The repository structure contains:
- `/frontend` — React 19 source code, stylesheets, canvas assets, and UI components.
- `/backend` — Express database routing, authentication middleware, and AI services.
- `package.json` — Root dependency manifest with production bundling scripts.

---

## 🖥️ STEP 1: DEPLOY BACKEND API TO RENDER (FREE TIER)

Render's free tier provides high-performance hosting for Node.js API services.

### 1. Create a Render Web Service
1. Sign up or log in at [Render.com](https://render.com).
2. Click the **New +** button in the top right and select **Web Service**.
3. Choose **Connect a repository** and select your GitHub repository.

### 2. Configure Settings
Enter the following settings in the deployment form:
- **Name**: `portfolio-api` (or any custom name)
- **Region**: Select the region closest to your audience (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
- **Language**: `Node`
- **Branch**: `main` (or your default branch)
- **Root Directory**: *Keep blank* (since our build script in the root `package.json` compiles both layers)
- **Build Command**: `npm install`
- **Start Command**: `npm run start`
- **Instance Type**: `Free`

### 3. Configure Environment Variables
Scroll down and click **Advanced**, then add the following **Environment Variables**:

| Key | Example Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Optimizes performance and enables express security guards. |
| `GEMINI_API_KEY` | `AIzaSyD-YourProductionKey` | Your secure Gemini key for chatbot & AI draft emails. |
| `ADMIN_PASSWORD` | `MySuperSecureAdminPass` | The secret password to unlock your Admin Dashboard. |
| `JWT_SECRET` | `48a2...3f9c` *(Random string)* | Cryptographic key used to sign Admin access tokens. |
| `PORT` | `3000` | Port for Express (Render overrides this, which is fine). |

### 4. Deploy!
Click **Create Web Service**. 
- Render will install, compile, and start the backend service.
- Once finished, copy the public URL of your service (e.g., `https://portfolio-api.onrender.com`). **You will need this for the frontend configuration.**

---

## 🚂 STEP 2: DEPLOY FRONTEND TO RAILWAY (FREE TIER)

Railway is excellent for hosting fast, scalable static apps.

### 1. Create a Railway Project
1. Sign up or log in at [Railway.app](https://railway.app).
2. Click **New Project** and select **Deploy from GitHub repo**.
3. Select your repository.

### 2. Configure Custom Build & Deploy Variables
1. Once imported, click on the **Variables** tab for the new service.
2. Click **Add Variable** and specify:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://portfolio-api.onrender.com` *(Paste your Render backend URL here!)*
3. To build only the static frontend, specify the output folder and root:
   - Click on the **Settings** tab.
   - Set **Build Command**: `npm install && npm run build`
   - Set **Output/Publish Directory**: `dist`

### 3. Generate Domain
1. In the **Settings** tab under the **Networking** section, click **Generate Domain**.
2. Railway will generate a secure SSL domain (e.g., `https://portfolio-frontend.up.railway.app`).
3. Open this URL in your browser to view your fully functional developer portfolio!

---

## 📦 ALTERNATIVE: UNIFIED FULL-STACK DEPLOYMENT (RECOMMENDED)

If you prefer a simpler setup with **zero CORS configuration** and **unified billing/hosting**, you can deploy the entire application on **Render** as a single service.

1. Create a Render **Web Service** pointing to your repository.
2. In **Environment Variables**, do *not* set `VITE_API_URL` (the frontend will automatically fallback to secure relative routes `/api/...` because they live on the same domain).
3. The Express backend will bundle the frontend assets and serve them statically.
4. **All features work out-of-the-box instantly.**

---

## 🔒 SECURITY & DATA PERSISTENCE

### 1. Changing Your Admin Password
To change the password to access your dashboard, simply update the `ADMIN_PASSWORD` environment variable in your **Render Dashboard** under **Environment**. The backend will automatically restart and adopt the new password.

### 2. Accessing the Admin Dashboard
To access the admin workspace:
1. Navigate to your frontend domain.
2. Append `/#admin` to the URL (e.g., `https://yourportfolio.com/#admin`).
3. Enter your configured `ADMIN_PASSWORD` to unlock the dashboard.

### 3. Message Thread Replies & Backups
This portfolio uses a modern, lightweight, file-based JSON database (`database.json`) stored on your server instance. 
- To avoid losing messages or configuration records when Render's free container sleeps, you can attach a **Persistent Disk** on Render (e.g., mount `/opt/portfolio/data` and change the db path), or use a scheduled cron database backup.
- For most developers, the file-based system is perfect for simple management. If you require absolute real-time DB clustering, the backend can easily be extended to PostgreSQL.
