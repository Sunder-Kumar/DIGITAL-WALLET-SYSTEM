# AI-Powered Secure Digital Wallet System

A complete fintech digital wallet with real-time AI fraud detection.

## Project Structure
- **backend/**: Node.js Express API
- **frontend/**: React + Vite Application
- **ai-service/**: Python Flask API + Scikit-Learn Model
- **database/**: SQL Schema

## Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MySQL Server

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (Workbench, CLI, etc.).
2. Run the script in `database/schema.sql`.
3. Ensure your database credentials match `backend/.env` (Default: root/no password).

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on `http://localhost:5000`.

### 3. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
Service runs on `http://localhost:5001`.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:3000`.

## Features Guide

### User Journey
1. **Register**: Create an account. You get a $1000 sign-up bonus.
2. **Dashboard**: View balance and transaction history.
3. **Send Money**: 
   - Enter another user's email.
   - Enter amount.
   - **AI Check**: If the amount is high (e.g., > $5000) or unusual, the AI service calculates a fraud score.
   - High scores (> 0.8) are flagged.
4. **QR Code**: Your unique QR code is displayed on the dashboard. In a mobile app, scanning this would pre-fill the send form.

### Admin Dashboard
1. Log in.
2. Navigate to `/admin`.
3. View stats and a list of all transactions flagged as suspicious by the AI.

## AI Model
The Python service uses a **Random Forest Classifier**. It trains on synthetic data every time the service starts (for demonstration). It analyzes:
- Transaction Amount
- Time of Day
- Sender Balance vs Amount

## API Endpoints
- `POST /api/register`
- `POST /api/login`
- `GET /api/wallet`
- `POST /api/transaction/send`
- `GET /api/admin/stats`
