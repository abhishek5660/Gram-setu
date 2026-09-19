# 🌾 Gram Setu (ग्राम सेतु) — AI-Powered Digital Panchayat App

> Mobile-first, voice-first digital panchayat web application designed for villagers, senior citizens, and panchayat administrators.

![Gram Setu Banner](https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop)

---

## 🌟 Core Features

- **🎙️ Voice-First Architecture**: Large floating microphone button on every screen powered by Web Speech API (`hi-IN` & `en-IN`) with Text-to-Speech audio readouts and audio stop controls.
- **👵 Senior Citizen Mode (60+ Auto-Detection)**: Age 60+ users automatically receive a simplified 6-big-tile dashboard, >=56px touch targets, and slower voice speech playback.
- **📜 Guided Certificate Applications**: Income, Birth, Domicile, Caste, Death, BPL certificates with document auto-linking.
- **📁 Secure Document Locker**: Store Aadhaar and Ration card once, reuse across applications, download PDF certificates with verification QR codes.
- **💡 Grievance Complaint System**: Voice note & photo complaint submission with AI-powered auto-categorization (Streetlight, Water supply, Roads, Drainage).
- **👵 Schemes & Pension Hub**: AI Eligibility Checker that asks simple questions and determines qualification for Old Age Pension, Ayushman Bharat, and PM Awas Yojana.
- **🏛️ Panchayat Secretary Admin Dashboard**: Review, approve, reject applications, issue digital certificates with QR codes, and manage complaints.
- **♿ High Accessibility**: One-tap **"Bada Text"** (Font enlarge) toggle and **High Contrast** mode for low-vision users.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Web Speech API.
- **Backend**: Node.js, Express, TypeScript, JWT Auth, Pluggable AI Client.
- **Database**: SQLite with Prisma ORM.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gram-setu.git
   cd gram-setu
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Setup Database & Seed Rampur Village Data**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start Local Servers (Frontend + Backend concurrently)**:
   ```bash
   npm run dev
   ```

   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`

---

## 🔑 Demo Test Accounts

| User Role | Name | Phone | Demo OTP | Key Features |
|---|---|---|---|---|
| **Senior Citizen** | Ramesh Prasad Kaka | `9876543210` | `123456` | Senior Mode, 6 big tiles, voice assistant |
| **Panchayat Secretary** | Shri Rameshwar Sharma | `9999999999` | `123456` | Admin dashboard, QR certificate issuance |

---

## 📂 Project Structure

```
gram-setu/
├── package.json               # Root monorepo scripts
├── server/                    # Node.js + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite Database Schema
│   │   └── seed.ts            # Rampur Panchayat Seed Script
│   └── src/
│       ├── routes/            # Auth and Panchayat API routes
│       ├── services/          # Pluggable AI Assistant Service
│       └── server.ts          # Express server entrypoint
└── client/                    # Vite + React + TypeScript App
    ├── src/
    │   ├── components/        # Accessible BigButton, VoiceFloatingMic, Header
    │   ├── context/           # AccessibilityContext (Voice, i18n, Senior Mode)
    │   ├── locales/           # Hindi (hi.json) & English (en.json) i18n
    │   └── pages/             # Home, Certificates, Complaints, Admin, Schemes
    └── index.html
```

---

## 📄 License

Licensed under the MIT License.
