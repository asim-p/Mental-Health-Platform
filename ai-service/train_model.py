import numpy as np
import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.calibration import CalibratedClassifierCV

CATEGORIES = {
    0: {
        'category': 'Normal',
        'description': 'No significant mental health concerns detected',
        'specializations': ['Wellness Coaching']
    },
    1: {
        'category': 'Depression',
        'description': 'Symptoms consistent with depression',
        'specializations': ['Depression', 'Clinical Psychology', 'Psychiatry']
    },
    2: {
        'category': 'Anxiety',
        'description': 'Symptoms consistent with anxiety disorder',
        'specializations': ['Anxiety', 'Clinical Psychology', 'Psychiatry']
    },
    3: {
        'category': 'Stress',
        'description': 'Elevated stress levels detected',
        'specializations': ['Stress Management', 'Counseling Psychology']
    },
    4: {
        'category': 'Bipolar',
        'description': 'Symptoms may indicate bipolar disorder',
        'specializations': ['Bipolar Disorder', 'Psychiatry', 'Clinical Psychology']
    },
    5: {
        'category': 'PTSD',
        'description': 'Symptoms consistent with post-traumatic stress',
        'specializations': ['Trauma', 'PTSD', 'Clinical Psychology']
    }
}

SAMPLE_DATA = {
    'text': [
        "I feel great today, everything is going well and I'm happy",
        "I'm so excited about my new job and life is wonderful",
        "Life is good, no complaints, feeling optimistic",
        "I feel worthless and hopeless all the time, nothing matters anymore",
        "I can't stop crying, I feel empty inside and don't want to get out of bed",
        "I've lost interest in everything I used to enjoy, nothing makes me happy",
        "I feel like a failure and constantly blame myself for everything",
        "Sometimes I think about ending it all, life feels unbearable",
        "I'm always worried about things that might go wrong",
        "My heart races and I feel like I can't breathe when I'm in social situations",
        "I'm afraid of being judged by others and avoid meeting people",
        "Panic attacks make me feel like I'm dying when I'm in crowds",
        "I worry constantly about my health, family, and work",
        "I can't control my anxiety, it's affecting my daily life",
        "I'm exhausted from work stress and can't relax anymore",
        "The pressure from my family expectations is overwhelming me",
        "I have too much to do and not enough time, I'm burning out",
        "Academic stress is giving me headaches and sleep problems",
        "My mood swings between extremely happy and deeply sad",
        "I have periods of intense energy and creativity followed by depression",
        "I make impulsive decisions during high phases and regret them later",
        "Sometimes I don't need sleep for days and feel invincible",
        "I experienced a traumatic event and I keep reliving it",
        "Nightmares about the accident won't stop, I feel on edge all the time",
        "I avoid anything that reminds me of the trauma",
        "Flashbacks from the abuse keep coming back to me",
        "I feel jumpy and hypervigilant since the incident",
        "Normal day to day feeling okay",
        "feeling a bit tired but overall fine",
        "Had a good night's sleep and feeling refreshed"
    ],
    'label': [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 0, 0, 0]
}

def preprocess_text(text):
    text = text.lower()
    text = ''.join(c for c in text if c.isalnum() or c.isspace())
    return text

def train_and_save_models():
    print("Preparing training data...")
    
    df = pd.DataFrame(SAMPLE_DATA)
    df['text'] = df['text'].apply(preprocess_text)
    
    X = df['text']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Creating TF-IDF vectorizer...")
    tfidf_vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        sublinear_tf=True
    )
    
    X_train_tfidf = tfidf_vectorizer.fit_transform(X_train)
    X_test_tfidf = tfidf_vectorizer.transform(X_test)
    
    print("Training Linear SVC model...")
    base_svc = LinearSVC(C=1.0, max_iter=10000, random_state=42)
    
    calibrated_svc = CalibratedClassifierCV(base_svc, cv=2)
    calibrated_svc.fit(X_train_tfidf, y_train)
    
    print("Evaluating model...")
    y_pred = calibrated_svc.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=[CATEGORIES[i]['category'] for i in range(len(CATEGORIES))]))
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    print("Saving models...")
    joblib.dump(tfidf_vectorizer, os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
    joblib.dump(calibrated_svc, os.path.join(model_dir, 'mental_health_model.pkl'))
    joblib.dump(CATEGORIES, os.path.join(model_dir, 'category_mapping.pkl'))
    
    print("Models saved successfully!")
    
    return tfidf_vectorizer, calibrated_svc, CATEGORIES

if __name__ == '__main__':
    train_and_save_models()
