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
        'description': 'No significant mental health concerns detected'
    },
    1: {
        'category': 'Depression',
        'description': 'Symptoms consistent with depression'
    },
    2: {
        'category': 'Anxiety',
        'description': 'Symptoms consistent with anxiety disorder'
    },
    3: {
        'category': 'Stress',
        'description': 'Elevated stress levels detected'
    },
    4: {
        'category': 'Bipolar',
        'description': 'Symptoms may indicate bipolar disorder'
    },
    5: {
        'category': 'Suicidal',
        'description': 'Signs of severe distress and suicidal ideation'
    },
    6: {
        'category': 'Personality disorder',
        'description': 'Symptoms consistent with personality-related concerns'
    }
}

LABEL_MAP = {
    'Normal': 0,
    'Depression': 1,
    'Anxiety': 2,
    'Stress': 3,
    'Bipolar': 4,
    'Suicidal': 5,
    'Personality disorder': 6
}

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = ''.join(c for c in text if c.isalnum() or c.isspace())
    return text

def train_and_save_models():
    print("Preparing training data...")
    
    csv_path = os.path.join(os.path.dirname(__file__), 'Combined Data.csv')
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return
    
    df = pd.read_csv(csv_path)
    # Drop rows with missing values
    df = df.dropna(subset=['statement', 'status'])
    
    print(f"Loaded {len(df)} rows of data.")
    
    df['text'] = df['statement'].apply(preprocess_text)
    df['label'] = df['status'].map(LABEL_MAP)
    
    # Filter out rows with unmapped labels if any
    df = df.dropna(subset=['label'])
    df['label'] = df['label'].astype(int)
    
    X = df['text']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    
    print("Creating TF-IDF vectorizer...")
    tfidf_vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.9,
        sublinear_tf=True
    )
    
    X_train_tfidf = tfidf_vectorizer.fit_transform(X_train)
    X_test_tfidf = tfidf_vectorizer.transform(X_test)
    
    print(f"Training Linear SVC model on {X_train_tfidf.shape[0]} samples...")
    base_svc = LinearSVC(C=0.5, max_iter=10000, random_state=42, dual='auto')
    
    calibrated_svc = CalibratedClassifierCV(base_svc, cv=3)
    calibrated_svc.fit(X_train_tfidf, y_train)
    
    print("Evaluating model...")
    y_pred = calibrated_svc.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    
    target_names = [CATEGORIES[i]['category'] for i in range(len(CATEGORIES))]
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))
    
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

