# 🚀 How to Deploy SecureWallet to Production

Follow this guide to take your Digital Wallet system from your local computer to the live web using **Railway** (Backend/DB) and **Vercel** (Frontend).

---

## 🏗️ Phase 1: Backend & Database (Railway.app)

Railway is the best platform for the backend because it handles Node.js and MySQL in one project.

### 1. Create a Project
1. Log in to [Railway.app](https://railway.app/) using your GitHub account.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your `DIGITAL-WALLET-SYSTEM` repository.
4. When asked for the directory, select **`backend`**.

### 2. Add MySQL Database
1. In your project dashboard, click **"Add Service"** -> **"Database"** -> **"MySQL"**.
2. Once created, click on the MySQL service -> **"Variables"** -> **"RAILWAY_DATABASE_URL"**. Copy this value.

### 3. Configure Backend Variables
Click on your **Backend Service** -> **"Variables"** -> **"New Variable"** and add these:
*   `PORT` = `5000`
*   `NODE_ENV` = `production`
*   `DATABASE_URL` = (Paste the `RAILWAY_DATABASE_URL` you copied)
*   `JWT_SECRET` = (Generate a long random string)
*   `FRONTEND_URL` = `https://your-app-name.vercel.app` (You will update this after Phase 3)
*   `AI_SERVICE_URL` = (The URL of your deployed AI service)

### 4. Initialize Database
1. Go to the **MySQL service** in Railway -> **"Data"** tab.
2. Import your `database/schema.sql` file or copy-paste the SQL content into the Railway query runner to create your tables.

---

## 🧠 Phase 2: AI Fraud Service (Railway)

Your backend needs the AI service to check for fraud.

1. Click **"Add Service"** in your Railway project -> **"Deploy from GitHub repo"**.
2. Select the same repo, but this time set the Root Directory to **`ai-service`**.
3. Railway will detect the `requirements.txt` and start the Flask server.
4. Copy the public URL Railway gives you (e.g., `https://ai-service-production.up.railway.app`).
5. **Important:** Go back to your **Backend Service Variables** and update `AI_SERVICE_URL` with this new link.

---

## 🎨 Phase 3: Frontend (Vercel.com)

Vercel is the industry standard for React/Vite apps.

### 1. Import Project
1. Log in to [Vercel.com](https://vercel.com/) with GitHub.
2. Click **"Add New"** -> **"Project"** -> Import `DIGITAL-WALLET-SYSTEM`.

### 2. Configure Build Settings
*   **Framework Preset:** Vite
*   **Root Directory:** `frontend`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`

### 3. Add Environment Variables
Before clicking "Deploy", add this variable:
*   `VITE_API_URL` = `https://your-backend-service.up.railway.app` (The URL from Railway Phase 1)

### 4. Deploy
Click **"Deploy"**. Vercel will give you a link like `https://digital-wallet-six.vercel.app`.

---

## ✅ Phase 4: Final Connection (CORS)

1. Go back to **Railway (Backend Variables)**.
2. Update the `FRONTEND_URL` variable with your actual Vercel link.
3. Redeploy the backend.

---

## 📱 Mobile Setup (PWA)
Once live, anyone can open your Vercel link on their phone:
1. Open the URL in Chrome (Android) or Safari (iOS).
2. Tap **"Add to Home Screen"**.
3. SecureWallet is now a standalone app on your phone!

---

## 🛠️ Maintenance & Scaling
*   **Logs:** Check Railway's "Deployments" tab for backend errors.
*   **Updates:** Every time you `git push` to your GitHub main branch, Vercel and Railway will **automatically redeploy** your app with the new changes.
