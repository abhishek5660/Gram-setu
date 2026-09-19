# 🌾 Gram Setu (ग्राम सेतु) — AI-Powered Digital Panchayat App

> Mobile-first, voice-first digital panchayat web application designed for villagers, senior citizens, and panchayat administrators.

---

## 🌟 Core Features

- **🎙️ Voice-First Architecture**: Floating microphone button on every screen powered by Web Speech API (`hi-IN` & `en-IN`) with Text-to-Speech audio readouts.
- **👵 Senior Citizen Mode (60+ Auto-Detection)**: Age 60+ users automatically receive a simplified 6-big-tile dashboard, >=56px touch targets, and slower voice speech.
- **📜 Guided Certificate Applications**: Income, Birth, Domicile, Caste, Death, BPL certificates.
- **📁 Secure Document Locker**: Upload Aadhaar and Ration card once, reuse across applications, download PDF certificates with QR codes.
- **💡 Grievance Complaint System**: Voice note & photo complaint submission with AI auto-categorization.
- **👵 Schemes & Pension Hub**: AI Eligibility Checker for Old Age Pension, Ayushman Bharat, and PM Awas Yojana.
- **🏛️ Panchayat Secretary Admin Dashboard**: Review, approve, reject applications, issue digital certificates with QR codes.
- **🌐 100% Bilingual Support**: Instant header toggle between **English** and **Hindi** across all pages and database records.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Web Speech API.
- **Backend**: Node.js, Express, TypeScript, JWT Auth, Pluggable AI Client.
- **Database**: SQLite with Prisma ORM.

---

## 🚀 How to Deploy the Entire Fullstack Project

### Method 1: Deploying on Render (Recommended - 100% Free All-in-One)

#### Step 1: Deploy Backend Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `abhishek5660/Gram-setu`.
3. Configure settings:
   - **Name**: `gram-setu-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma db push && npm run db:seed && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. Click **Create Web Service**. Render will build and deploy your API server at `https://gram-setu-backend.onrender.com`.

---

#### Step 2: Deploy Frontend Static Site
1. On Render Dashboard, click **New +** → **Static Site**.
2. Select your repository `abhishek5660/Gram-setu`.
3. Configure settings:
   - **Name**: `gram-setu`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://gram-setu-backend.onrender.com`
5. Click **Create Static Site**. Your app is now live globally!

---

### Method 2: Deploying Frontend on Vercel + Backend on Render

#### Step 1: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new) and import `abhishek5660/Gram-setu`.
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Click **Deploy**. Vercel will give you a domain like `https://gram-setu.vercel.app`.

---

## 🔑 Demo Test Accounts

| User Role | Name | Phone | Demo OTP | Key Features |
|---|---|---|---|---|
| **Senior Citizen** | Ramesh Prasad Kaka | `9876543210` | `123456` | Senior Mode, 6 big tiles, voice assistant |
| **Panchayat Secretary** | Shri Rameshwar Sharma | `9999999999` | `123456` | Admin dashboard, QR certificate issuance |

---

## 📄 License

Licensed under the MIT License.
