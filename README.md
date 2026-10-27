# PhytoGuard — AI-Driven Crop Disease Prediction Web App

A complete full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** application integrated with a dedicated **Python FastAPI + TensorFlow/Keras Convolutional Neural Network (CNN)** microservice for identifying crop leaf diseases, browsing verified PlantVillage pathology guidance, interacting via a browser-native **Crop Assistant** voice helper, and administering platform security.

---

## 1. Project Overview & Problem Statement

### Problem Statement
Foliar fungal, bacterial, oomycete, viral, and mite diseases cause major crop yield losses when early leaf symptoms are missed or misidentified. Smallholder farmers and students often lack rapid field-level tools that connect visual leaf inspection with trustworthy, non-hazardous integrated pest management (IPM) guidance.

### Objectives
1. Enable growers to register securely, capture or upload crop leaf photographs, and receive real CNN classifications with calibrated softmax confidence scores.
2. Provide verified disease descriptions, observable symptoms, cultural prevention methods, and IPM guidance backed by land-grant agricultural extension references.
3. Offer an accessible browser-based **Crop Assistant** (voice input + speech synthesis + typed fallback) without sending private microphone audio to external third-party cloud APIs.
4. Enforce defense-in-depth application security suitable for full-stack and cybersecurity academic evaluation.

---

## 2. How React, Express, MongoDB, FastAPI, and the CNN Work Together (Beginner-Friendly Review Guide)

Think of the system as **four specialized teammates**, each doing what it does best:

1. **React + Vite (`client/`, Port `5173`) — The Farmer's Countertop**
   - Displays all 13 responsive web pages, validates that a chosen leaf image is under 5 MB, renders previews, and runs **Crop Assistant** using the browser's built-in Web Speech API.
   - React **never** runs TensorFlow directly in the browser and **never** talks to MongoDB or FastAPI directly. It sends requests only to Express (`/api/*`).

2. **Node.js + Express (`server/`, Port `5000`) — The Security Gatekeeper**
   - Verifies who the user is (via `HttpOnly` JWT cookies + `bcryptjs` hashed passwords), blocks NoSQL injection and CSRF attacks, inspects the raw binary bytes of uploaded files (`FFD8FF` for JPEG, `89504E47` for PNG, `RIFF..WEBP` for WebP), strips GPS/EXIF metadata using **Sharp**, saves a randomized UUID filename in `server/uploads/`, and forwards the clean image to FastAPI.

3. **Python FastAPI + TensorFlow CNN (`ml-service/`, Port `8000`) — The Plant Pathology Vision Lab**
   - Loads the trained `.keras` Convolutional Neural Network **once** when the server boots.
   - Resizes the leaf image to `224 × 224` RGB pixels, scales pixel intensities identically to training (`[0, 1]` for Baseline CNN or `[-1, 1]` for MobileNetV2), runs neural inference, and returns the predicted `classLabel` (e.g., `Tomato___Early_blight`) and softmax probability (`confidence`).

4. **MongoDB + Mongoose (`Database`) — The Agronomy Filing Cabinet**
   - Stores three collections: `Users` (accounts & roles), `Diseases` (21 seeded PlantVillage guides), and `Predictions` (each user's personal history referencing `userId` and `diseaseId`).

---

## 3. Complete Features

- **13 Responsive Pages**: Landing/Home, About, Register, Login, Grower Dashboard, Leaf Upload, Prediction Result, Prediction History, Disease Library, Disease Details, User Profile, Admin Console, and 404 Not Found.
- **Hardened Authentication & RBAC**: `bcryptjs` (cost 12), `HttpOnly` JWT cookies, custom-header CSRF protection, public registration locked to `user` role, documented `seedAdmin.js` script, and self-lockout protection for administrators.
- **Secure Leaf Image Pipeline**: Drag-and-drop, file browse, mobile `capture="environment"`, live webcam capture, 5 MB limit, magic-byte inspection, Sharp sRGB normalization, and UUID path-traversal protection.
- **Honest CNN Classification**: Flags predictions below `60%` confidence as `uncertain`, displays Top-3 softmax candidates, explains that confidence is not guaranteed field accuracy, and **never** invents fake AI confidence scores when the model is offline/untrained (with an optional, explicitly badged & isolated UI Walkthrough toggle for testing UI flows before training completes).
- **Crop Assistant (Voice + Typed Fallback)**: Supports spoken/typed commands (`"Open the upload page"`, `"Check my crop"`, `"Read my result"`, `"Explain the symptoms"`, `"How can I prevent this disease?"`, `"Show my prediction history"`, `"Go to the home page"`) with English (`en-IN`, `en-US`) and experimental Tamil (`ta-IN`) support.

---

## 4. Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, JavaScript (JSX), Tailwind CSS v4, React Router v7, Axios, React Context API, Lucide React, Browser Web Speech API |
| **Backend** | Node.js (v20/v22 LTS), Express.js, Mongoose (MongoDB), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `multer`, `sharp`, `express-validator`, `helmet`, `cors`, `express-rate-limit` |
| **AI / ML** | Python 3.10–3.11, TensorFlow / Keras, FastAPI, Uvicorn, Pillow, NumPy, scikit-learn, Matplotlib |
| **Testing** | Vitest, Supertest, React Testing Library, MongoDB Memory Server, Python `unittest` / `pytest` |

---

## 5. Monorepo Folder Structure

```text
crop-disease-prediction/
├── client/                         # React + Vite Frontend (Port 5173 standalone)
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── __tests__/frontend.test.jsx
│   │   ├── assets/CropSpecimenSvg.jsx
│   │   ├── components/             # Navbar, Footer, Sidebar, ProtectedRoute, UploadForm,
│   │   │                           # ImagePreview, ResultCard, ConfidenceIndicator,
│   │   │                           # DiseaseCard, HistoryTable, LoadingSpinner,
│   │   │                           # ErrorMessage, VoiceAssistant
│   │   ├── context/                # AuthContext.jsx, AssistantContext.jsx
│   │   ├── hooks/                  # useSpeechAssistant.js
│   │   ├── layouts/                # PublicLayout.jsx, WorkspaceLayout.jsx
│   │   ├── pages/                  # All 13 application pages
│   │   ├── services/api.js
│   │   ├── utils/formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                         # Node.js + Express + Mongoose API (Port 5000 standalone)
│   ├── scripts/
│   │   ├── seedDiseases.js
│   │   └── seedAdmin.js
│   ├── src/
│   │   ├── config/                 # env.js, db.js
│   │   ├── controllers/            # auth, prediction, disease, admin controllers
│   │   ├── middleware/             # auth, security, upload, validate, errorHandler
│   │   ├── models/                 # User.js, Disease.js, Prediction.js
│   │   ├── routes/                 # auth, prediction, disease, admin, health routes
│   │   ├── services/               # mlServiceClient.js
│   │   ├── utils/                  # ApiError.js, asyncHandler.js, logger.js, seedData.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/api.test.js
│   ├── uploads/.gitkeep
│   ├── .env.example
│   └── package.json
├── ml-service/                     # Python FastAPI + TensorFlow/Keras CNN (Port 8000)
│   ├── app/
│   │   ├── main.py
│   │   ├── predictor.py
│   │   └── preprocessing.py
│   ├── training/
│   │   ├── prepare_dataset.py
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── predict_single.py
│   ├── tests/test_ml_service.py
│   ├── models/.gitkeep
│   ├── class_labels.json
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   └── TESTING_AND_DEMO_GUIDE.md
├── start-windows.ps1               # Optional 1-click PowerShell launcher for all 3 services
├── server.ts                       # Unified full-stack Express+Vite server (Port 3000)
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Complete Windows Setup & Execution Guide (PowerShell)

### Step 1: Required Software Versions on Windows 10 / 11
1. **Node.js**: Install **Node.js v20 LTS or v22 LTS** (`https://nodejs.org`). Verify in PowerShell:
   ```powershell
   node -v
   npm -v
   ```
2. **Python**: Install **64-bit Python 3.10 or Python 3.11** (`https://www.python.org/downloads/windows/`) — compatible with official TensorFlow 2.16–2.18 wheels on Windows. **Check `"Add python.exe to PATH"` during installation.**
   ```powershell
   python --version
   ```
3. **Git** (optional, for cloning/version control): `https://git-scm.com/download/win`.
4. **MongoDB**:
   - **Option A — MongoDB Atlas (Cloud Free M0 Cluster)**: Create a free cluster at `https://www.mongodb.com/atlas`, create a database user, whitelist your IP in *Network Access*, and copy your `mongodb+srv://...` connection URI.
   - **Option B — Local MongoDB Community Server**: Install MongoDB Community Edition on Windows (`mongodb://127.0.0.1:27017/crop_disease_prediction`).
   - *Zero-Config Fallback*: If `MONGODB_URI` is left blank during local development, `server/src/config/db.js` automatically starts an embedded `MongoMemoryServer` and seeds initial diseases so you can test immediately.

---

### Step 2: Configure Environment Files (PowerShell)

Open **Windows PowerShell** in the project root folder (`crop-disease-prediction`):

```powershell
Copy-Item .\server\.env.example .\server\.env
Copy-Item .\client\.env.example .\client\.env
Copy-Item .\ml-service\.env.example .\ml-service\.env
```

Edit `server\.env` and set a strong `JWT_SECRET`, your `MONGODB_URI`, and a shared `INTERNAL_API_KEY` matching `ml-service\.env`:

| Variable | Service | Default Dev Value | Purpose |
|----------|---------|-------------------|---------|
| `PORT` | `server` | `5000` | Express REST API port |
| `MONGODB_URI` | `server` | `mongodb://127.0.0.1:27017/crop_disease_prediction` | MongoDB connection string |
| `JWT_SECRET` | `server` | *(set 32+ random chars)* | Signs HttpOnly authentication tokens |
| `CLIENT_URL` | `server` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `MODEL_SERVICE_URL` | `server` | `http://127.0.0.1:8000` | FastAPI CNN inference URL |
| `INTERNAL_API_KEY` | `server` & `ml-service` | *(shared secret)* | Authenticates Express → FastAPI calls |
| `UPLOAD_DIR` | `server` | `./uploads` | Local normalized leaf image directory |
| `MODEL_PATH` | `ml-service` | `./models/crop_disease_model.keras` | Saved Keras CNN weights path |

---

### Step 3: Install Dependencies

```powershell
# 1. Install Express Backend dependencies
cd server
npm install

# 2. Install React Frontend dependencies
cd ..\client
npm install

# 3. Create Python Virtual Environment & Install ML dependencies
cd ..\ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
```
*(Note: If PowerShell blocks `Activate.ps1`, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once.)*

---

### Step 4: PlantVillage Dataset Preparation & CNN Model Training

1. **Download the PlantVillage Dataset** (Color leaf images folder containing class subdirectories such as `Tomato___Early_blight`, `Potato___Late_blight`, etc.):
   - Official open repository / Kaggle mirror (CC0 / academic attribution): search **"PlantVillage Dataset (color)"** (e.g., `abdallahalidev/plantvillage-dataset` -> `color/` directory) or Mendeley Data *Plant leaf diseases dataset*.
   - Extract the class folders into:
     ```text
     ml-service/dataset/PlantVillage/
       ├── Apple___Apple_scab/
       ├── Apple___Black_rot/
       ├── ...
       └── Tomato___healthy/
     ```

2. **Validate & Split Dataset Without Data Leakage (70% Train / 15% Val / 15% Held-Out Test)**:
   ```powershell
   cd ml-service
   .\venv\Scripts\Activate.ps1

   # Filter to the 21 seeded classes (or omit --use-existing-labels-filter to train on all classes present)
   python training/prepare_dataset.py --raw-dir ./dataset/PlantVillage --output-dir ./dataset/split --use-existing-labels-filter
   ```

3. **Train the CNN Model** (choose either the regularized 4-block Baseline CNN or MobileNetV2 transfer learning):
   ```powershell
   # Option A: Baseline Convolutional Neural Network
   python training/train.py --data-dir ./dataset/split --arch cnn --epochs 25 --batch-size 32

   # Option B: MobileNetV2 Transfer Learning (faster convergence on CPU/GPU)
   python training/train.py --data-dir ./dataset/split --arch mobilenetv2 --epochs 15 --batch-size 32
   ```
   This saves:
   - `ml-service/models/crop_disease_model.keras`
   - `ml-service/models/model_metadata.json`
   - `ml-service/models/training_curves.png`
   - Synchronized `ml-service/class_labels.json`

4. **Evaluate Strictly on Held-Out Test Data & Verify Single-Image Inference**:
   ```powershell
   python training/evaluate.py --data-dir ./dataset/split --model-path ./models/crop_disease_model.keras
   python training/predict_single.py --image ./dataset/split/test/Tomato___Early_blight/<any_leaf_image>.JPG
   ```
   *(Review `ml-service/models/evaluation_metrics.json` and `confusion_matrix.png` for your actual held-out test accuracy and F1-scores.)*

---

### Step 5: Seed MongoDB Disease Catalog & Administrator Account

```powershell
cd server
npm run seed:diseases

$env:ADMIN_SEED_NAME="Campus Administrator"
$env:ADMIN_SEED_EMAIL="admin@phytoguard.edu"
$env:ADMIN_SEED_PASSWORD="AdminStrong2026!"
npm run seed:admin
```

---

### Step 6: Start All Three Services (Expected Ports)

| Service | Expected Port | Local URL |
|---------|---------------|-----------|
| **Python FastAPI CNN Service** | `8000` | `http://127.0.0.1:8000/health` |
| **Node.js + Express REST API** | `5000` | `http://localhost:5000/api/health` |
| **React + Vite Frontend** | `5173` | `http://localhost:5173` |

You can launch all three at once from the root folder:
```powershell
.\start-windows.ps1
```
Or run each independently in three separate PowerShell terminals:

- **Terminal 1 (FastAPI CNN Service)**:
  ```powershell
  cd ml-service
  .\venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```
- **Terminal 2 (Express Backend)**:
  ```powershell
  cd server
  npm run dev
  ```
- **Terminal 3 (React Frontend)**:
  ```powershell
  cd client
  npm run dev
  ```

Open **`http://localhost:5173`** in Chrome or Edge.

---

## 7. Complete REST API Documentation & Request Examples

### Endpoints Summary

| Category | Method & Path | Access | Description |
|----------|---------------|--------|-------------|
| **Health** | `GET /api/health` | Public | Reports MongoDB connectivity and FastAPI model readiness |
| **Auth** | `POST /api/auth/register` | Public | Creates standard `user` account with bcrypt hash |
| **Auth** | `POST /api/auth/login` | Public | Verifies credentials and issues `HttpOnly` JWT cookie |
| **Auth** | `POST /api/auth/logout` | Public | Clears authentication session cookie |
| **Auth** | `GET /api/auth/me` | Authenticated | Returns current logged-in user profile |
| **Auth** | `PATCH /api/auth/profile` | Authenticated | Updates name, email, or password |
| **Predict** | `POST /api/predict` | Authenticated | Validates image, calls FastAPI CNN, stores & returns result |
| **History** | `GET /api/predictions` | Authenticated | Paginated, searchable history scoped to `req.user._id` |
| **History** | `GET /api/predictions/:id` | Owner / Admin | Retrieves single prediction + linked disease guidance |
| **History** | `DELETE /api/predictions/:id` | Owner / Admin | Deletes prediction record and disk image file |
| **Diseases** | `GET /api/diseases` | Public | Searchable, crop-filterable, paginated disease library |
| **Diseases** | `GET /api/diseases/:id` | Public | Fetch disease by MongoDB `_id` or `classLabel` |
| **Diseases** | `POST /api/diseases` | Admin Only | Create new PlantVillage disease entry |
| **Diseases** | `PUT /api/diseases/:id` | Admin Only | Update disease entry |
| **Diseases** | `DELETE /api/diseases/:id` | Admin Only | Delete disease entry |
| **Admin** | `GET /api/admin/stats` | Admin Only | Platform KPIs, 7-day timeline, crop distribution |
| **Admin** | `GET /api/admin/users` | Admin Only | Paginated user management list |
| **Admin** | `GET /api/admin/predictions` | Admin Only | Global prediction audit log |
| **Admin** | `PATCH /api/admin/users/:id/role` | Admin Only | Grant/revoke admin role (with self/last-admin guard) |
| **Admin** | `PATCH /api/admin/users/:id/status`| Admin Only | Activate/deactivate user (with self/last-admin guard) |

### Example PowerShell / cURL API Requests

```powershell
# 1. Check Express + FastAPI Health
curl.exe http://localhost:5000/api/health

# 2. Register a Grower Account
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -H "X-Requested-With: PhytoGuardClient" `
  -d "{\"name\":\"Ramesh Kumar\",\"email\":\"ramesh@farm.in\",\"password\":\"CropSafe2026\"}"

# 3. Upload a Leaf Image for CNN Classification (using Bearer token returned at login)
curl.exe -X POST http://localhost:5000/api/predict `
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" `
  -F "image=@C:\path\to\leaf.jpg"
```

---

## 8. MongoDB Database Schema

1. **`users`**: `name` (String, required), `email` (String, required, unique, lowercase), `passwordHash` (String, `select: false`), `role` (`'user' | 'admin'`), `status` (`'active' | 'deactivated'`), `createdAt`, `updatedAt`.
2. **`diseases`**: `cropName` (indexed), `diseaseName`, `scientificName`, `classLabel` (unique), `isHealthy`, `description`, `symptoms` (`[String]`), `prevention` (`[String]`), `management` (`[String]`), `referenceUrls` (`[{ title, url }]`), `createdAt`, `updatedAt`.
3. **`predictions`**: `userId` (`ObjectId -> User`, indexed), `diseaseId` (`ObjectId -> Disease`), `cropName`, `diseaseName`, `classLabel`, `confidence` (`Number 0..1 | null`), `topPredictions`, `imageUrl` (public `/uploads/...` path), `imageFilename` (`select: false`), `modelVersion`, `status` (`'completed' | 'uncertain' | 'unknown_class' | 'demo_simulation'`), `isDemo`, `createdAt` (compound index `{ userId: 1, createdAt: -1 }`).

---

## 9. Running Automated Tests

```powershell
# Run Backend API/Security Integration Tests + Frontend React Component Tests
npm test

# Run Python ML Preprocessing, Predictor, and FastAPI Endpoint Tests
cd ml-service
.\venv\Scripts\Activate.ps1
pytest tests/test_ml_service.py
```

See [`docs/TESTING_AND_DEMO_GUIDE.md`](docs/TESTING_AND_DEMO_GUIDE.md) for the complete 15-point manual end-to-end checklist, college viva walkthrough, and troubleshooting guide.

---

## 10. Cybersecurity Measures Implemented

- **Credential Protection**: `bcryptjs` (12 salt rounds), `passwordHash` excluded at schema level (`select: false`) and redacted in logs.
- **Session & CSRF Hardening**: `HttpOnly` JWT cookies (`SameSite=Lax` locally, `SameSite=None; Secure` over HTTPS) paired with custom header `X-Requested-With: PhytoGuardClient` verification and strict origin-allowlist CORS.
- **Privilege Escalation & Lockout Prevention**: `POST /api/auth/register` ignores any client-supplied `role`; administrators cannot demote or deactivate themselves or the final active administrator.
- **IDOR Prevention**: Every `GET` and `DELETE` on `/api/predictions/:id` verifies `prediction.userId === req.user._id` on the backend.
- **Upload Abuse & Path Traversal Defense**: 5 MB upload ceiling, binary magic-byte header validation, Sharp pixel re-encoding (stripping EXIF GPS & neutralizing polyglot payloads), UUID filenames, `path.basename` confinement, and `X-Content-Type-Options: nosniff`.
- **NoSQL Injection & Rate Limiting**: Recursive `$` and `.` operator stripping middleware plus `express-rate-limit` on `/api/auth`, `/api/predict`, and `/api`.
- **Internal ML Isolation**: FastAPI validates `X-Internal-API-Key` using constant-time `hmac.compare_digest`.

---

## 11. Production Deployment Guide

1. **Database — MongoDB Atlas**:
   - Provision a dedicated or M0 cluster, enforce TLS, create a least-privilege DB user (`readWrite` on `crop_disease_prediction`), and restrict IP access to your backend host's egress IPs.
2. **Python FastAPI Model Service — Render / Railway / Google Cloud Run (Docker/Python)**:
   - Deploy `ml-service/` with **at least 1 GB–2 GB RAM** (TensorFlow runtime + loaded `.keras` weights require ~600–900 MB RSS; 512 MB free tiers often fail with Out-Of-Memory `SIGKILL`).
   - Store the trained `crop_disease_model.keras` in an object bucket downloaded during container build/startup rather than committing large binaries to Git.
   - Set `INTERNAL_API_KEY` to a strong 64-char secret and keep the service on a private network URL where supported.
3. **Node.js Express Backend — Render / Railway / Cloud Run**:
   - Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend.vercel.app`, `MODEL_SERVICE_URL=https://your-internal-ml-host`, and matching `INTERNAL_API_KEY`.
   - **Persistent Image Storage**: Cloud container disks are ephemeral! In production, replace or mirror `server/src/middleware/upload.js` disk writes with durable object storage (**AWS S3**, **Cloudflare R2**, or **Google Cloud Storage**) and store the HTTPS object URL in `prediction.imageUrl`.
   - Ensure HTTPS is enabled so `Secure; SameSite=None; HttpOnly` cookies transmit properly across domains.
4. **React Frontend — Vercel / Netlify**:
   - Root directory: `client`, Build command: `npm run build`, Output directory: `dist`.
   - Set `VITE_API_BASE_URL=https://your-express-backend.example.com` and configure SPA rewrite `/* -> /index.html`.

---

## 12. Limitations & Future Enhancements

### Current Limitations
- Single-leaf photographs on complex field backgrounds or leaves showing multiple simultaneous nutrient/pest stresses can lower classification certainty.
- Browser Web Speech recognition support varies by browser (best in Chromium/Edge; Safari/Firefox fall back automatically to typed commands).
- Educational guidance does not prescribe region-specific chemical dosages.

### Future Enhancements
- Object-detection bounding boxes (YOLOv8 / RT-DETR) to localize multiple leaves and lesions in full-canopy smartphone photos.
- Grad-CAM heatmap overlays highlighting exact leaf regions driving CNN activations.
- Full Tamil, Hindi, and Telugu agronomy translations with offline Progressive Web App (PWA) caching for low-connectivity rural areas.
