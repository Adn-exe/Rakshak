# 🛡️ Rakshak (रक्षक) — Citizen Infrastructure Safety Platform

> **AI-Powered Early-Warning & Infrastructure Health Monitoring System for River Embankments, Canal Banks, Dams, Roads, and Railways.**

Rakshak bridges the gap between citizens and local water resource authorities by transforming crowd-sourced smartphone photographs and field observations into actionable, explainable structural risk assessments powered by **Google Gemini 3.6 Flash AI Vision** and **FastAPI**.

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started)
3. [Project Structure](#3-project-structure)
4. [API Documentation](#4-api-documentation)
5. [Development](#5-development)
6. [Deployment](#6-deployment)
7. [Troubleshooting](#7-troubleshooting)
8. [License & Contact](#8-license--contact)

---

## 1. Project Overview

### What is Rakshak?
Rakshak (Hindi/Sanskrit for *"Protector"*) is a dual-interface infrastructure health and safety platform built for high-risk flood zones and critical civil infrastructure. It empowers citizens to report visual structural defects (such as bank soil erosion, water seepage, embankment cracking, and crest settlement) and automatically computes a 0–100 explainable risk score.

### Key Features
- 🤖 **Google Gemini 3.6 Flash Vision AI**: Native multimodal image inspection assessing structural damage directly from photograph pixels.
- 📐 **Asset-Specific Damage Indicators**: Customized damage metrics tailored specifically for 5 civil asset types (*River Embankments, Canal Banks, Road Embankments, Railway Slopes, Dams & Reservoirs*).
- 🔍 **Live Search & Risk Filters**: Instant text search across Health Cards by structure name, location address, Health Card ID, or asset type.
- 📢 **Citizen-to-Authority Dispatch Workflow**: Citizens can inspect generated Health Cards privately before officially dispatching them to local irrigation & disaster response department authorities.
- 🏛️ **Authority Field Inspection Panel**: Dedicated department portal (`/admin`) for engineers to review priority alerts, update inspection findings, and manage field deployment.
- 🖼️ **High-Definition Evidence Lightbox**: 100% full-opacity evidence photo showcase with full-screen zoom and GPS coordinate overlays.
- 🌐 **Multilingual Support**: Supports plain everyday English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Telugu (ತೆಲುಗು), and Tamil (தமிழ்).
- ⚡ **Offline & Deterministic Fallback**: Automatic preliminary risk computation from user field observation choices if backend AI services are unreachable.

### Tech Stack

#### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Vanilla CSS, TailwindCSS, Lucide Icons, Shadcn UI components
- **Map & GIS**: Interactive Leaflet / Mapbox Map Integration

#### Backend
- **Framework**: Python 3.11+ FastAPI, Uvicorn
- **AI / Vision**: Google Gemini 3.6 Flash API (`google-generativeai` & PIL)
- **Image Processing**: OpenCV (`opencv-python-headless`), Pillow (`PIL`)
- **Environment**: Python `dotenv`

---

## 2. Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher ([Download Python](https://www.python.org/))
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/Adn-exe/Rakshak.git
cd Rakshak
```

#### 2. Set Up Backend (Python FastAPI)
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt
```

#### 3. Set Up Frontend (Next.js)
```bash
cd ../frontend

# Install node dependencies
npm install
```

---

### Environment Setup

#### Backend Environment Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and insert your Gemini API Key:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Blur detection thresholds
BLUR_THRESHOLD=100
BLUR_BORDERLINE_THRESHOLD=50

# Server Host & Port
HOST=0.0.0.0
PORT=8000

# Frontend URL for CORS configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment Configuration (Optional)
Create a `.env.local` file in `frontend/` if connecting to a custom backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Running Locally

#### Start the Backend Server (Terminal 1)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
*Backend API will be running live at `http://localhost:8000` (Docs at `http://localhost:8000/docs`).*

#### Start the Frontend Server (Terminal 2)
```bash
cd frontend
npm run dev
```
*Frontend Web Application will be live at `http://localhost:3000`.*

---

## 3. Project Structure

```
Rakshak/
├── .gitignore                   # Root gitignore rules protecting secrets & build artifacts
├── README.md                    # Project documentation
│
├── backend/                     # Python FastAPI Backend Services
│   ├── .env                     # Private environment variables (API keys)
│   ├── .env.example             # Template for environment configuration
│   ├── .gitignore               # Backend-specific ignore rules
│   ├── main.py                  # FastAPI application entrypoint & CORS middleware
│   ├── requirements.txt         # Python dependencies manifest
│   │
│   ├── models/                  # Pydantic Schemas & Data Transfer Objects
│   │   └── schemas.py           # Request/response validation schemas
│   │
│   ├── routers/                 # API Endpoint Route Handlers
│   │   ├── validation.py        # POST /api/validate-image (blur + relevance check)
│   │   ├── assessment.py        # POST /api/analyze (Gemini multimodal assessment)
│   │   └── health_card.py       # GET /api/demo-assets & report routes
│   │
│   └── services/                # Core Business Logic & Risk Engines
│       ├── image_quality.py     # Laplacian variance blur detection engine
│       ├── image_verification.py# Gemini AI relevance classifier
│       ├── structural_assessment.py # Gemini 3.6 Flash multimodal photo analyzer
│       ├── risk_engine.py       # Explainable 0-100 risk scoring algorithm
│       └── demo_data.py         # Seed assets for local testing
│
└── frontend/                    # Next.js 15 TypeScript Frontend Application
    ├── package.json             # Frontend dependencies & scripts
    ├── next.config.ts           # Next.js configuration settings
    ├── tsconfig.json            # TypeScript configuration
    │
    └── src/
        ├── app/                 # Next.js App Router Pages
        │   ├── page.tsx         # Citizen Home Page & Photo Upload
        │   ├── report/page.tsx  # Interactive Embankment Inspection Form
        │   ├── health-cards/page.tsx # Health Cards Search & Risk Filter Directory
        │   ├── health-card/[id]/page.tsx # Full Evidence Health Card Detail View
        │   ├── map/page.tsx     # Citizen Interactive Infrastructure Map
        │   │
        │   └── admin/           # Authority Department Portal
        │       ├── page.tsx     # Priority Alerts Dashboard & KPI Overview
        │       ├── health-cards/page.tsx # Department Health Card Records
        │       ├── health-card/[id]/page.tsx # Authority Status Update & Manual Inspection Panel
        │       └── map/page.tsx # Department Map View
        │
        ├── components/          # Reusable UI & Layout Components
        │   ├── navbar/Navbar.tsx# Global Navigation Bar with View Switcher
        │   ├── map/InfrastructureMap.tsx # Leaflet Map Component with Risk Markers
        │   ├── ui/              # Buttons, Cards, Badges, Modals, Progress Bars
        │   └── upload/ImageUpload.tsx # Drag-and-Drop Photo Upload Control
        │
        ├── lib/                 # Utilities, Storage & Localization
        │   ├── api.ts           # Axios / Fetch client with 4s safety timeouts
        │   ├── storage.ts       # LocalStorage persistence & CRUD handlers
        │   ├── risk.ts          # Frontend risk score calculator
        │   └── i18n.tsx         # Multilingual context (EN, HI, KN, TE, TA)
        │
        ├── locales/             # Internationalization JSON Dictionaries
        │   ├── en.json          # English translations
        │   ├── hi.json          # Hindi translations (हिन्दी)
        │   ├── kn.json          # Kannada translations (ಕನ್ನಡ)
        │   ├── te.json          # Telugu translations (ತೆಲುಗು)
        │   └── ta.json          # Tamil translations (தமிழ்)
        │
        └── types/               # TypeScript Type Definitions
            └── index.ts         # Report, AssessmentResult, RiskBreakdown schemas
```

---

## 4. API Documentation

### Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning backend status & Gemini configuration flag. |
| `POST` | `/api/validate-image` | Evaluates image quality (Laplacian blur score) and Gemini relevance classification. |
| `POST` | `/api/analyze` | Performs full Gemini 3.6 Flash multimodal structural assessment and calculates risk scores. |
| `GET` | `/api/demo-assets` | Returns pre-populated demo infrastructure assets. |

---

### Request & Response Examples

#### 1. Backend Health Check
**Request**:
```http
GET /api/health HTTP/1.1
Host: localhost:8000
```
**Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "JalRaksha API",
  "version": "1.0.0",
  "gemini_configured": true
}
```

---

#### 2. Validate Image Quality & Relevance
**Request**:
```http
POST /api/validate-image HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="embankment.jpg"
Content-Type: image/jpeg

<binary image data>
------WebKitFormBoundary--
```

**Response (200 OK)**:
```json
{
  "valid": true,
  "blurScore": 479.34,
  "blurStatus": "good",
  "message": "Photo quality looks good.",
  "relevant": true,
  "confidence": 0.85,
  "category": "river_embankment"
}
```

---

#### 3. Full AI Multimodal Structural Assessment
**Request**:
```http
POST /api/analyze HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="embankment.jpg"
Content-Type: image/jpeg

<binary image data>
------WebKitFormBoundary
Content-Disposition: form-data; name="assetName"

Krishna River Embankment Sector 4
------WebKitFormBoundary
Content-Disposition: form-data; name="assetType"

river_embankment
------WebKitFormBoundary
Content-Disposition: form-data; name="latitude"

16.5062
------WebKitFormBoundary
Content-Disposition: form-data; name="longitude"

80.6480
------WebKitFormBoundary
Content-Disposition: form-data; name="observations"

{"erosion":"severe","cracks":"moderate"}
------WebKitFormBoundary--
```

**Response (200 OK)**:
```json
{
  "assessment": {
    "cracks": {
      "severity": "moderate",
      "confidence": 0.84,
      "explanation": "Visible linear cracking appears along the upper slope embankment."
    },
    "erosion": {
      "severity": "severe",
      "confidence": 0.91,
      "explanation": "Significant soil wash-away visible near the water line."
    },
    "seepage": {
      "severity": "none",
      "confidence": 0.90,
      "explanation": "No moisture stains or active water seepage observed."
    },
    "settlement": {
      "severity": "minor",
      "confidence": 0.70,
      "explanation": "Localized surface depression observed."
    },
    "additionalIssues": ["slope deformation", "exposed soil"],
    "summary": "Significant soil erosion and cracking observed along the upper river embankment slope."
  },
  "risk": {
    "cracksScore": 50,
    "erosionScore": 100,
    "seepageScore": 0,
    "settlementScore": 25,
    "additionalScore": 25,
    "communityScore": 0,
    "totalScore": 68,
    "riskLevel": "high"
  },
  "recommendedAction": "⚠️ HIGH PRIORITY ACTION:\n• Department Notice: Submit this Health Card notice to local department authorities for field dispatch.\n• Community Safety: Notify nearby residents and temporary occupants near the embankment to monitor for leaks.\n• Field Inspection: Prioritize site inspection within 24–48 hours (eroded slope, cracking patterns)."
}
```

---

### Error Codes

| HTTP Status | Error Detail | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `unsupported_format` | Uploaded file format is not supported. Must be JPG, PNG, or WEBP. |
| `400 Bad Request` | `file_too_large` | Uploaded file size exceeds the 10 MB limit. |
| `500 Server Error` | `assessment_failed` | Internal error while connecting to Gemini AI or parsing response. Fallback generated. |

---

## 5. Development

### Available Scripts

#### Frontend Scripts
Run from the `frontend/` directory:
- `npm run dev`: Starts the Next.js development server with hot-reloading on `http://localhost:3000`.
- `npm run build`: Compiles production build and runs TypeScript verification.
- `npm run start`: Runs the compiled Next.js production server.
- `npm run lint`: Executes ESLint checks across TypeScript files.

#### Backend Commands
Run from the `backend/` directory (with virtualenv activated):
- `uvicorn main:app --reload --port 8000`: Starts backend development server with auto-reload.
- `python -m pytest`: Runs backend test suite (if configured).

---

### Testing & Verification
Before submitting code or pushing commits, execute a complete production build verification:

```bash
# Verify Frontend Build
cd frontend
npm run build

# Verify Backend Imports & Syntax
cd ../backend
python3 -m py_compile main.py
```

---

### Contributing Guidelines
1. **Fork & Branch**: Create a feature branch off `main` (`git checkout -b feature/my-feature`).
2. **Environment Variables**: Never commit `.env` files containing live secrets or API keys. Use `.env.example` templates.
3. **Typography & Plain English**: Maintain simple, everyday language in translation dictionaries (`en.json`, `hi.json`). Avoid dense technical jargon.
4. **Pull Requests**: Ensure `npm run build` exits with code `0` before creating a Pull Request.

---

## 6. Deployment

### Production Build

#### Build Frontend Application
```bash
cd frontend
npm run build
```

---

### Environment Variables Matrix

| Variable Name | Required | Location | Default Value | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | `backend/.env` | `""` | Google Gemini API Key for vision assessment. |
| `BLUR_THRESHOLD` | No | `backend/.env` | `100` | Laplacian variance threshold for sharp images. |
| `HOST` | No | `backend/.env` | `0.0.0.0` | Server bind host address. |
| `PORT` | No | `backend/.env` | `8000` | Server bind port. |
| `FRONTEND_URL` | No | `backend/.env` | `http://localhost:3000` | Allowed CORS origin URL. |
| `NEXT_PUBLIC_API_URL` | No | `frontend/.env.local` | `http://localhost:8000` | Backend API URL accessed by frontend fetch calls. |

---

### Hosting Platforms

#### Option 1: Vercel (Frontend) & Railway / Render (Backend)
1. Deploy `frontend/` to **[Vercel](https://vercel.com/)**:
   - Set Root Directory to `frontend`
   - Set Build Command to `npm run build`
   - Set Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app`
2. Deploy `backend/` to **[Railway](https://railway.app/)** or **[Render](https://render.com/)**:
   - Set Root Directory to `backend`
   - Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Set Environment Variable: `GEMINI_API_KEY=your_gemini_api_key_here`

---

## 7. Troubleshooting

### Common Issues & Solutions

#### 1. Gemini API Key Error (Model 404 / `Not Found`)
- **Symptom**: Console logs show `google.api_core.exceptions.NotFound: 404 models/gemini-2.0-flash is no longer available`.
- **Solution**: Ensure your backend uses `gemini-3.6-flash`. In `backend/.env`, verify `GEMINI_API_KEY` is set correctly and test connectivity via:
  ```bash
  curl -s http://localhost:8000/api/health
  ```

#### 2. "Checking photo quality..." Screen Hanging
- **Symptom**: Form gets stuck on the quality check stage when uploading a photo.
- **Solution**: Frontend `validateImage` includes a 4-second `AbortController` timeout safety mechanism. Verify that `http://localhost:8000` is running and reachable from your browser.

#### 3. CORS Error on Frontend API Requests
- **Symptom**: Browser console displays `Access-Control-Allow-Origin` error.
- **Solution**: Check `FRONTEND_URL` in `backend/.env` and confirm it matches your Next.js domain (e.g. `http://localhost:3000`).

---

## 8. License & Contact

### License
This project is open-source and available under the [MIT License](LICENSE).

---

### Contact & Support
- **Project Maintainer**: Mohammed Adnan ([@Adn-exe](https://github.com/Adn-exe))
- **Repository**: [https://github.com/Adn-exe/Rakshak.git](https://github.com/Adn-exe/Rakshak.git)
- **Issue Tracker**: [GitHub Issues](https://github.com/Adn-exe/Rakshak/issues)

---

*Made with ❤️ for Citizen Infrastructure Safety and Flood Protection.*
