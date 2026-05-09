# AI-Assisted Mental Health Platform

A comprehensive mental health platform for Nepal, featuring AI-powered symptom screening, therapist matching, appointment booking, and secure consultations.

## Project Structure

```
mental-health-platform/
├── frontend/           # React + Vite + Tailwind CSS (Shadcn UI style)
├── backend/           # Node.js + Express + MongoDB (Mongoose)
├── ai-service/        # Python Flask AI service (TF-IDF + Linear SVC)
└── README.md
```

## Tech Stack

### Frontend
- **React 18** with **Vite 6**
- **Tailwind CSS 4**
- **Radix UI** components
- **Lucide React** icons
- **React Router 7**
- **Sonner** for toast notifications
- **Socket.io Client** for real-time features

### Backend
- **Node.js** + **Express**
- **MongoDB** with **Mongoose** ODM
- **JWT Authentication** (Access & Refresh tokens)
- **Socket.io** for real-time communication
- **Zod** for schema validation
- **Express Validator** for request sanitization

### AI Service
- **Python Flask**
- **Scikit-learn** (TF-IDF Vectorizer + Linear SVC)
- **CalibratedClassifierCV** for probability (confidence) scores
- **Joblib** for model serialization
- **Pandas** for data handling

## Features

### For Patients
- **AI Screening**: Symptom analysis using NLP to identify potential mental health concerns.
- **Therapist Matching**: Intelligent recommendation system based on specialization, budget, gender, and language.
- **Booking System**: Real-time availability check and appointment scheduling.
- **Dashboard**: Track screening history, view confidence scores, and manage appointments.
- **Secure Payments**: Integration with local payment gateways (eSewa).

### For Therapists
- **Professional Dashboard**: Manage schedule, view upcoming appointments, and patient details.
- **Profile Management**: Update professional bio, qualifications, and hourly rates.
- **Availability Control**: Set and update weekly availability slots.
- **Verification System**: Secure process for professional credential verification.

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB instance (local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env based on the environment variables section
npm run dev
```

### 2. AI Service Setup
```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt
# Train the model with the dataset
python train_model.py
# Start the service
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI="mongodb://localhost:27017/mental_health_db"
JWT_SECRET="your_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret"
AI_SERVICE_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001/api"
VITE_AI_URL="http://localhost:5001"
```

## AI Model & Accuracy
The platform uses a **Linear Support Vector Classifier (SVC)** calibrated for probability estimates.
- **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Classification**: Multi-class classification (7 categories)
- **Confidence**: Displayed as "Match accuracy" to help users understand the model's certainty.

## License
Educational project for Madan Bhandari Memorial College.

## Authors
- **Asim Pokharel**
- **Ashal Pandey**
