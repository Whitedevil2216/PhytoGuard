# Manual Testing Checklist, College Demo Walkthrough & Troubleshooting Guide

## 1. Manual End-to-End Testing Checklist

| # | Test Case | Steps to Perform | Expected Result |
|---|-----------|------------------|-----------------|
| 1 | **Service Health Check** | Open `http://localhost:5000/api/health` and `http://127.0.0.1:8000/health` | Both return JSON `"success": true`. `mlService.modelReady` is `true` once `crop_disease_model.keras` is trained. |
| 2 | **User Registration** | Navigate to `/register`, enter Name, Email, and Password (`TestPass123`) | Redirects to `/dashboard`, sets `HttpOnly` cookie `phytoguard_token`, user role is `"user"`. |
| 3 | **Duplicate Email Rejection** | Log out, revisit `/register`, submit the same email | Displays HTTP 409 alert: *"An account with this email address already exists."* |
| 4 | **Privilege Escalation Prevention** | Send `POST /api/auth/register` with `"role": "admin"` in JSON body | User is created strictly with `"role": "user"`. |
| 5 | **Invalid Login Handling** | Enter wrong password on `/login` | Displays HTTP 401 message *"Invalid email address or password"* without revealing whether the email exists. |
| 6 | **Protected Route Guard** | Sign out and visit `/dashboard`, `/upload`, or `/admin` directly | Automatically redirected to `/login`. |
| 7 | **Magic-Byte Image Validation** | Rename `notes.txt` to `fake_leaf.jpg` and upload on `/upload` | Backend rejects with HTTP 400 (`INVALID_IMAGE_SIGNATURE`) because binary magic bytes are not JPEG/PNG/WebP. |
| 8 | **Oversized File Rejection** | Select an image larger than 5 MB | Client form blocks immediately with validation message; backend Multer also enforces HTTP 413 (`FILE_TOO_LARGE`). |
| 9 | **Genuine CNN Leaf Prediction** | With `ml-service` running a trained model, upload a Tomato Early Blight leaf on `/upload` and click **Predict Disease** | Redirects to `/predictions/:id` showing leaf photo, `Tomato`, `Early Blight`, real CNN softmax confidence gauge, symptoms, prevention, and IPM guidance. |
| 10 | **Low-Confidence Uncertainty Alert** | Upload an ambiguous or out-of-distribution image scoring `< 60%` confidence | Status saved as `"uncertain"`, amber uncertainty warning banner displayed advising photo retake or agronomy consultation. |
| 11 | **Untrained / Offline Model Honesty** | Stop `ml-service` and submit a genuine prediction | Backend returns HTTP 503 (`MODEL_SERVICE_UNAVAILABLE`) with clear setup instructions—never invents fake confidence numbers. |
| 12 | **Prediction Ownership (IDOR Check)** | Copy User A's prediction ID, sign in as User B, visit `/predictions/<UserA_ID>` or send `DELETE /api/predictions/<UserA_ID>` | Backend blocks with HTTP 403 (`FORBIDDEN_RESOURCE`). |
| 13 | **Voice Assistant ("Crop Assistant")** | Click **Crop Assistant**, say or type `"Read my result"`, `"Explain the symptoms"`, `"How can I prevent this disease?"`, `"Open the upload page"` | Navigates routes accurately and reads verified screen pathology data aloud via browser SpeechSynthesis (with full typed fallback). |
| 14 | **Disease Library Search & Filter** | Open `/diseases`, click **Tomato** filter tab, search `"Alternaria"` | Displays Tomato Early Blight card; clicking **View Guidance** opens `/diseases/:id` with extension links. |
| 15 | **Admin Dashboard & Self-Lockout Guard** | Sign in as seeded Admin, open `/admin`, view 7-day chart, add a Disease class, try clicking Deactivate/Demote on your own row | Disease CRUD succeeds; self-demotion and self-deactivation are blocked on both UI and backend (`SELF_DEMOTION_BLOCKED`). |

---

## 2. College Project Viva / Demonstration Walkthrough (8–10 Minutes)

1. **Opening & Problem Framing (1 min)**
   - Show the **Landing Page (`/`)**: highlight the supported crops (Tomato, Potato, Maize, Apple, Bell Pepper, Grape), the 21 seeded PlantVillage classes, and the 4-stage pipeline.
2. **Architecture Explanation (1.5 min)**
   - Open **About (`/about`)**: explain in simple terms why TensorFlow runs inside an isolated Python FastAPI service (`port 8000`) while Node/Express (`port 5000`) handles security, authentication, rate limiting, and MongoDB (`Users`, `Predictions`, `Diseases`).
3. **Public Disease Library (1 min)**
   - Open **Disease Library (`/diseases`)**: filter by **Tomato**, open **Early Blight**, point out scientific nomenclature (*Alternaria linariae*), cultural prevention, non-prescriptive IPM management, and university extension links.
4. **Security & Authentication Demo (1.5 min)**
   - Register a new grower account on `/register` (show password strength rules).
   - Open Browser DevTools → **Application → Cookies** to show the `HttpOnly` JWT cookie (`phytoguard_token`) inaccessible to `document.cookie` XSS attacks.
5. **Live Leaf Upload & CNN Inference (2 min)**
   - Navigate to **Diagnose Leaf (`/upload`)**.
   - First try uploading a renamed `.txt` file disguised as `attack.jpg` to demonstrate **Cybersecurity Magic-Byte Rejection**.
   - Next upload a real PlantVillage leaf image, watch the progress bar, and inspect the **Prediction Result Page** (confidence gauge + calibration disclaimer + Top-3 softmax candidates + guidance).
6. **Voice Assistant Accessibility Demo (1 min)**
   - Open **Crop Assistant** in the bottom-right corner and say or type `"Read my result"` and `"How can I prevent this disease?"` to demonstrate accessible farmer support.
7. **Admin Console & RBAC Demo (1.5 min)**
   - Sign out, sign in with the seeded Administrator account, open **Admin Console (`/admin`)**, demonstrate the 7-day activity chart, user status management, and adding/editing a Disease Library entry.

---

## 3. Suggested Screenshots for Your Project Report

1. **Figure 1**: Landing Page Hero & Quantitative Scope Strip (`1440px` desktop view)
2. **Figure 2**: System Architecture & Cybersecurity Controls Page (`/about`)
3. **Figure 3**: PlantVillage Disease Library with Crop Filter Tabs (`/diseases`)
4. **Figure 4**: Leaf Image Upload & Preview Interface (`/upload`)
5. **Figure 5**: Genuine CNN Prediction Report with Softmax Confidence Gauge (`/predictions/:id`)
6. **Figure 6**: Crop Assistant Voice & Typed Guidance Drawer
7. **Figure 7**: Grower Prediction History with Search & Pagination (`/history`)
8. **Figure 8**: Administrator Console — 7-Day Activity Chart & Disease Catalog CRUD (`/admin`)
9. **Figure 9**: Training Accuracy/Loss Curves (`ml-service/models/training_curves.png`) & Held-Out Confusion Matrix (`ml-service/models/confusion_matrix.png`)
10. **Figure 10**: Terminal output of `npm test` and `pytest` passing automated security & ML tests

---

## 4. Troubleshooting Guide

### A. `Python TensorFlow install fails on Windows`
- **Cause**: TensorFlow 2.16–2.18 requires **64-bit Python 3.10 or 3.11** (Python 3.13+ may not have prebuilt wheels yet).
- **Fix**: Install Python 3.11 (64-bit) from `python.org`, check *"Add python.exe to PATH"*, recreate the virtual environment (`py -3.11 -m venv venv`), and run `pip install -r requirements.txt`. Also ensure Microsoft Visual C++ Redistributable (2015–2022 x64) is installed.

### B. `POST /api/predict returns 503 MODEL_SERVICE_UNAVAILABLE`
- **Cause**: Either the FastAPI server (`ml-service`) is not running on port `8000`, or `MODEL_SERVICE_URL` in `server/.env` points to the wrong port.
- **Fix**: Open PowerShell in `ml-service`, activate `venv`, and run `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. Verify `http://127.0.0.1:8000/health` in your browser.

### C. `FastAPI /health shows modelReady: false (MODEL_NOT_TRAINED)`
- **Cause**: No trained `crop_disease_model.keras` file exists in `ml-service/models/` yet.
- **Fix**: Prepare the PlantVillage split (`python training/prepare_dataset.py`) and run `python training/train.py --epochs 15` to generate real weights.

### D. `MongoDB Atlas MongooseServerSelectionError`
- **Cause**: Your Windows machine's current IP address is not whitelisted in MongoDB Atlas Network Access, or database user password has special characters needing URL encoding.
- **Fix**: In MongoDB Atlas → **Network Access**, add your current IP address (or `0.0.0.0/0` temporarily for campus Wi-Fi demos), and verify `MONGODB_URI` in `server/.env`.

### E. `CORS Error or 403 CSRF Verification Failed`
- **Cause**: Frontend URL does not match `CLIENT_URL` in `server/.env`, or custom requests omitted `X-Requested-With: PhytoGuardClient`.
- **Fix**: Ensure `CLIENT_URL=http://localhost:5173` in `server/.env` when running Vite standalone on port 5173, and use the configured `client/src/services/api.js` Axios instance.

### F. `Port 5000, 5173, or 8000 Already in Use on Windows`
- **Fix** (PowerShell):
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  ```
