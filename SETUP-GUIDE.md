# Mental Health Platform - Complete Setup Guide

A detailed, beginner-friendly guide to setting up and running the AI-Assisted Mental Health Screening and Consultation System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Required Software](#step-1-install-required-software)
3. [Step 2: Set Up PostgreSQL Database](#step-2-set-up-postgresql-database)
4. [Step 3: Set Up the Backend](#step-3-set-up-the-backend)
5. [Step 4: Set Up the AI Service](#step-4-set-up-the-ai-service)
6. [Step 5: Set Up the Frontend](#step-5-set-up-the-frontend)
7. [Running the Complete Application](#running-the-complete-application)
8. [Troubleshooting](#troubleshooting)
9. [Creating Test Data](#creating-test-data)

---

## Prerequisites

Before starting, ensure you have:

- A computer with Windows, macOS, or Linux
- Internet connection
- Basic familiarity with command line/terminal
- 10GB+ free disk space

---

## Step 1: Install Required Software

### 1.1 Install Node.js (Required for Backend and Frontend)

Node.js is a runtime that executes JavaScript code outside a browser.

**For Windows:**
1. Visit https://nodejs.org/
2. Download the **LTS (Long Term Support)** version (currently Node.js 20.x)
3. Run the installer (.msi file)
4. Follow the installation wizard
5. **Important**: Check "Add to PATH" option
6. Click Install

**For macOS:**
```bash
# Using Homebrew (recommended)
brew install node
```

**For Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
Open a new terminal/command prompt and type:
```bash
node --version
npm --version
```

You should see version numbers like `v20.x.x` and `10.x.x`.

---

### 1.2 Install Python (Required for AI Service)

Python is needed to run the AI service that performs mental health screening.

**For Windows:**
1. Visit https://www.python.org/downloads/
2. Download Python 3.10 or 3.11 (avoid Python 3.12 for compatibility)
3. Run the installer
4. **Important**: Check "Add Python to PATH" at the bottom
5. Click "Install Now"

**For macOS:**
```bash
# Using Homebrew
brew install python@3.11
```

**For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**Verify Installation:**
```bash
python --version
pip --version
```

---

### 1.3 Install Git (Version Control)

**For Windows:**
1. Visit https://git-scm.com/download/win
2. Download the installer
3. Run the installer with default options
4. Select "Use Visual Studio Code as Git's default editor" if prompted

**For macOS:**
Git usually comes pre-installed. If not:
```bash
brew install git
```

**For Linux:**
```bash
sudo apt install git
```

**Verify Installation:**
```bash
git --version
```

---

### 1.4 Install Visual Studio Code (Recommended IDE)

While not required, VS Code makes development much easier.

1. Visit https://code.visualstudio.com/
2. Download and install for your operating system
3. Recommended extensions to install after opening VS Code:
   - ESLint
   - Prettier
   - Python (by Microsoft)
   - Prisma

---

## Step 2: Set Up PostgreSQL Database

PostgreSQL is a powerful, open-source database system where all application data will be stored.

### 2.1 Download and Install PostgreSQL

**For Windows:**

1. Visit https://www.postgresql.org/download/windows/
2. Download the latest PostgreSQL installer
3. Run the installer
4. On the "Select Components" screen, ensure these are checked:
   - [x] PostgreSQL Server
   - [x] pgAdmin 4 (Database management tool)
   - [x] Command Line Tools
5. Set a password for the postgres user (remember this!)
6. Keep the default port: **5432**
7. Complete the installation

**For macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

**For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.2 Create the Database

**Using pgAdmin (GUI - Recommended for Beginners):**

1. Open pgAdmin (found in Start Menu on Windows)
2. Click on "Servers" → "PostgreSQL" in the left sidebar
3. Enter the password you set during installation
4. Right-click on "Databases" → "Create" → "Database..."
5. Enter these details:
   - Database: `mental_health_db`
   - Owner: `postgres`
6. Click Save

**Using Command Line:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database (run this command)
CREATE DATABASE mental_health_db;

# Exit psql
\q
```

### 2.3 Verify Database Connection

You can verify PostgreSQL is running by:

**Windows:**
1. Open Services app
2. Find "postgresql-x64-..." service
3. Ensure Status is "Running"

**macOS/Linux:**
```bash
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

---

## Step 3: Set Up the Backend

The backend handles all API requests, authentication, and database operations.

### 3.1 Open Terminal/Navigation

Open your terminal/command prompt and navigate to the project folder:

```bash
# Navigate to the project directory
cd "C:\Users\user\Documents\Mental Health Platform\backend"

# If you get an error that folder doesn't exist, try:
cd Documents
cd "Mental Health Platform"
cd backend
```

### 3.2 Install Node.js Dependencies

Dependencies are packages that the backend needs to function.

```bash
npm install
```

This will install:
- Express (web framework)
- Prisma (database ORM)
- JSON Web Token (authentication)
- Bcrypt (password hashing)
- Socket.io (real-time chat)
- And many more...

**Note:** This may take 2-5 minutes depending on your internet speed.

### 3.3 Configure Environment Variables

Environment variables store configuration settings like database passwords.

1. Create a copy of the example environment file:
   - **Windows:** `copy .env.example .env`
   - **Mac/Linux:** `cp .env.example .env`

2. Open the `.env` file in a text editor

3. Update these values:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mental_health_db"
   JWT_SECRET="any-secure-random-string-at-least-32-characters"
   JWT_REFRESH_SECRET="another-secure-random-string"
   AI_SERVICE_URL="http://localhost:5001"
   FRONTEND_URL="http://localhost:5173"
   ```

   **Important:** Replace `YOUR_PASSWORD` with the password you set for PostgreSQL during installation.

### 3.4 Generate Prisma Client

Prisma Client is an auto-generated database client that makes it easy to query your database.

```bash
npx prisma generate
```

You should see output like:
```
✔ Generated Prisma Client for .../schema.prisma
```

### 3.5 Run Database Migrations

Migrations create the database tables based on the schema.

```bash
npx prisma migrate dev --name init
```

When prompted:
- Enter a name for the migration: `init`
- This will create all necessary tables in your database

You should see:
```
Your database is now in sync with your schema.
✔ Created migration 20240101000000_init
```

### 3.6 Verify Backend Setup

To verify everything is working:

```bash
# Start the backend server
npm run dev
```

You should see:
```
Server running on port 3001
```

If you see any errors, check the [Troubleshooting](#troubleshooting) section.

**Leave this terminal open** - we'll come back to it later.

---

## Step 4: Set Up the AI Service

The AI service provides mental health screening using machine learning (TF-IDF + Linear SVC).

### 4.1 Navigate to AI Service Folder

Open a **new** terminal window and navigate to:

```bash
cd "C:\Users\user\Documents\Mental Health Platform\ai-service"
```

### 4.2 Create Python Virtual Environment

A virtual environment keeps Python packages isolated for this project.

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Your terminal should now show `(venv)` at the beginning, like:
```
(venv) C:\Users\user\...>
```

### 4.3 Install Python Dependencies

```bash
pip install flask flask-cors scikit-learn numpy pandas joblib
```

**Note:** This installation may take 3-5 minutes as it downloads large ML libraries.

### 4.4 Create Requirements File

Create a `requirements.txt` file in the ai-service folder:

```bash
echo flask>=3.0.0 > requirements.txt
echo flask-cors>=4.0.0 >> requirements.txt
echo scikit-learn>=1.3.0 >> requirements.txt
echo numpy>=1.24.0 >> requirements.txt
echo pandas>=2.0.0 >> requirements.txt
echo joblib>=1.3.0 >> requirements.txt
```

### 4.5 Train the AI Model

The model needs to be trained before it can make predictions.

```bash
python train_model.py
```

You should see output like:
```
Preparing training data...
Creating TF-IDF vectorizer...
Training Linear SVC model...
Evaluating model...
Accuracy: 0.XX
Models saved successfully!
```

### 4.6 Test the AI Service

Start the AI service:

```bash
python app.py
```

You should see:
```
Models loaded successfully!
 * Running on http://0.0.0.0:5001
```

**Leave this terminal open** - the AI service needs to keep running.

### 4.7 Test the AI Endpoint

Open your web browser and visit:
```
http://localhost:5001/health
```

You should see:
```json
{"status": "healthy", "model_loaded": true}
```

---

## Step 5: Set Up the Frontend

The frontend is the user interface built with React.

### 5.1 Navigate to Frontend Folder

Open a **new** terminal window:

```bash
cd "C:\Users\user\Documents\Mental Health Platform\frontend"
```

### 5.2 Install Dependencies

```bash
npm install
```

**Note:** This may take 3-5 minutes. The frontend has many UI component libraries.

### 5.3 Configure Environment Variables

Create the environment file:

**Windows:**
```bash
echo VITE_API_URL=http://localhost:3001/api > .env
echo VITE_AI_URL=http://localhost:5001 >> .env
```

**Mac/Linux:**
```bash
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_AI_URL=http://localhost:5001" >> .env
```

### 5.4 Test the Frontend

Start the development server:

```bash
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open your browser and visit:
```
http://localhost:5173
```

You should see the Mental Health Platform landing page!

---

## Running the Complete Application

For the application to work, **all three services must be running simultaneously**:

### Terminal 1: Backend (Port 3001)
```bash
cd "C:\Users\user\Documents\Mental Health Platform\backend"
npm run dev
```

### Terminal 2: AI Service (Port 5001)
```bash
cd "C:\Users\user\Documents\Mental Health Platform\ai-service"
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python app.py
```

### Terminal 3: Frontend (Port 5173)
```bash
cd "C:\Users\user\Documents\Mental Health Platform\frontend"
npm run dev
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | User Interface |
| Backend API | http://localhost:3001 | API Server |
| AI Service | http://localhost:5001 | ML Predictions |

---

## Creating Test Data

Since the database starts empty, you need to create test users.

### Option 1: Register Through the App

1. Visit http://localhost:5173/register
2. Create a patient account
3. Or create a therapist account (will need admin verification)

### Option 2: Create Admin User via Database

Connect to your database and run:

```sql
-- Connect to database
\c mental_health_db

-- Insert admin user (password: admin123)
INSERT INTO users (
  id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYvxqFKF3.',
  'Admin',
  'User',
  'ADMIN',
  NOW(),
  NOW()
);
```

Login credentials:
- Email: `admin@example.com`
- Password: `admin123`

### Option 3: Seed Database (Advanced)

Create a seed script at `backend/src/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Run the seed:
```bash
npx tsx src/prisma/seed.ts
```

---

## Troubleshooting

### Common Issues

#### 1. "Command not found" Errors

**Problem:** Terminal can't find `npm`, `node`, `python`, etc.

**Solution:**
- Windows: Restart your terminal or computer
- Make sure you checked "Add to PATH" during installation
- Verify installations with `--version` commands

#### 2. Database Connection Error

**Problem:** `Connection refused` or `authentication failed`

**Solution:**
1. Verify PostgreSQL is running (see Step 2.3)
2. Check your password in the `.env` file matches PostgreSQL
3. Ensure `pg_hba.conf` allows password authentication

#### 3. Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3001`

**Solution:**
```bash
# Find and kill the process using the port
# Windows
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# macOS/Linux
lsof -i :3001
kill -9 <process_id>
```

#### 4. Prisma Client Not Found

**Problem:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

#### 5. Python Virtual Environment Issues

**Problem:** `venv` activation fails on Windows

**Solution:**
```bash
# Try using PowerShell instead of CMD
powershell

# Or use full path
C:\path\to\project\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 6. Frontend Shows Blank Page

**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Ensure all three services are running
3. Clear browser cache
4. Restart frontend: `npm run dev`

#### 7. AI Model Not Loading

**Problem:** AI service shows "Models not found"

**Solution:**
```bash
# Ensure you're in the correct directory
cd "C:\Users\user\Documents\Mental Health Platform\ai-service"

# Create models directory
mkdir models

# Train the model again
python train_model.py
```

---

## Project Architecture Overview

Understanding how the pieces fit together:

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                    (React Frontend)                              │
│              http://localhost:5173                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVER                               │
│              http://localhost:3001                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Auth API    │  │ Therapist   │  │   Appointment API    │   │
│  │  (JWT)       │  │  API        │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Screening   │  │  Payment API │  │   Chat API           │   │
│  │  API        │  │  (eSewa)     │  │   (Socket.io)        │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘   │
└─────────┼────────────────────────────────────────────────────────┘
          │ HTTP
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI SERVICE                                   │
│               http://localhost:5001                               │
│                                                                 │
│   ┌─────────────────┐      ┌─────────────────────────────────┐ │
│   │  TF-IDF         │      │  Linear SVC (Mental Health     │ │
│   │  Vectorizer     │ ──── │  Classifier)                    │ │
│   └─────────────────┘      └─────────────────────────────────┘ │
│                                                                 │
│   Categories: Normal, Depression, Anxiety, Stress, Bipolar, PTSD│
└─────────────────────────────────────────────────────────────────┘
          │
          │ SQL Queries
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                          │
│                  localhost:5432                                   │
│                  mental_health_db                                │
│                                                                 │
│   Tables: users, patient_profiles, therapist_profiles,           │
│           appointments, payments, chat_messages, reviews,         │
│           screening_results, availability                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Quick Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PATCH | `/api/users/profile` | Update profile |

### Therapists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/therapists` | List all therapists |
| GET | `/api/therapists/:id` | Get therapist details |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create appointment |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment |

### Screening
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/screening/predict` | Get AI prediction |
| GET | `/api/screening/recommendations` | Get therapist recommendations |

---

## Useful Commands Reference

### Backend Commands
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start development server
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open database GUI
```

### Frontend Commands
```bash
cd frontend
npm install             # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
```

### AI Service Commands
```bash
cd ai-service
python train_model.py   # Train AI model
python app.py           # Start AI server
```

---

## Next Steps After Setup

1. **Create an Admin Account** - Register through the app or via database
2. **Create Therapist Accounts** - Register as therapist, then approve via admin
3. **Create Patient Accounts** - Register as patient and explore features
4. **Test AI Screening** - Visit `/screening` to test the mental health assessment
5. **Book Appointments** - As a patient, browse therapists and book sessions
6. **Explore Dashboards** - View patient, therapist, and admin dashboards

---

## Getting Help

If you encounter issues not covered here:

1. Check the browser console for frontend errors
2. Check the terminal for backend errors
3. Verify all services are running
4. Check that database credentials are correct in `.env`
5. Try restarting all services

---

**Good luck with your project!**
