# AI-Assisted Mental Health Platform

A comprehensive mental health platform for Nepal, featuring AI-powered symptom screening, therapist matching, appointment booking, and secure telehealth consultations.

## Project Structure

```
mental-health-platform/
├── frontend/           # React + Vite frontend application
├── backend/           # Node.js + Express API server
├── ai-service/        # Python Flask AI service (TF-IDF + Linear SVC)
└── README.md
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS
- Material UI (MUI)
- React Router v7
- Socket.io Client

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Socket.io for real-time chat

### AI Service
- Python Flask
- Scikit-learn (TF-IDF + Linear SVC)
- Joblib for model serialization

## Features

### For Patients
- AI-powered mental health screening using TF-IDF and Linear SVC
- Multi-factor therapist matching (condition, budget, gender, availability)
- Appointment booking with secure eSewa payment integration
- Real-time chat with therapists
- Video consultation via Zoom integration
- Screening history and recommendations

### For Therapists
- Professional dashboard with schedule management
- Patient appointment overview
- Real-time chat messaging
- Availability management
- Profile management

### For Administrators
- Therapist verification system
- Platform analytics
- User management
- Appointment oversight

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Install PostgreSQL and create a database
createdb mental_health_db

# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 2. Backend Setup

```bash
cd backend

# Start development server
npm run dev
```

The API server will run on `http://localhost:3001`

### 3. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train and save models
python train_model.py

# Start AI service
npm run dev  # or: flask run --host=0.0.0.0 --port=5001
```

The AI service will run on `http://localhost:5001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/mental_health_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
AI_SERVICE_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_AI_URL=http://localhost:5001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile

### Therapists
- `GET /api/therapists` - List therapists (with filters)
- `GET /api/therapists/:id` - Get therapist details
- `GET /api/therapists/:id/availability` - Get availability
- `PATCH /api/therapists/profile` - Update therapist profile
- `PATCH /api/therapists/availability` - Update availability

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id/confirm` - Confirm appointment
- `PATCH /api/appointments/:id/complete` - Complete appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `POST /api/appointments/:id/review` - Add review

### Screening
- `POST /api/screening/predict` - AI prediction
- `GET /api/screening/history` - Screening history
- `GET /api/screening/recommendations` - Get recommendations

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

### Chat
- `GET /api/chat/:appointmentId` - Get messages
- `POST /api/chat/:appointmentId` - Send message

## AI Model

The mental health screening uses:
- **TF-IDF Vectorization**: Converts text to numerical features based on term frequency
- **Linear SVC**: Support Vector Classifier for multi-class categorization

Categories: Normal, Depression, Anxiety, Stress, Bipolar, PTSD

## Security

- Bcrypt password hashing (12 rounds)
- JWT access and refresh tokens
- HMAC-SHA256 for payment verification
- Role-based access control (RBAC)
- HTTPS enforcement in production

## License

This project is for educational purposes as part of the final year project at Madan Bhandari Memorial College.

## Authors

- Asim Pokharel (79010991)
- Ashal Pandey (79010989)

## Acknowledgments

- Madan Bhandari Memorial College
- Department of Computer Science and Information Technology
- Tribhuvan University
