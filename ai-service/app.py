from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

tfidf_vectorizer = None
model = None
category_mapping = None

def load_models():
    global tfidf_vectorizer, model, category_mapping
    
    try:
        tfidf_vectorizer = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
        model = joblib.load(os.path.join(MODEL_DIR, 'mental_health_model.pkl'))
        category_mapping = joblib.load(os.path.join(MODEL_DIR, 'category_mapping.pkl'))
        print("Models loaded successfully!")
    except FileNotFoundError:
        print("Models not found. Please run train_model.py first to train the model.")
        category_mapping = {
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

def preprocess_text(text):
    text = text.lower()
    text = ''.join(c for c in text if c.isalnum() or c.isspace())
    return text

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': tfidf_vectorizer is not None and model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text field is required'}), 400
        
        text = data['text']
        
        if len(text.strip()) < 10:
            return jsonify({'error': 'Text must be at least 10 characters'}), 400
        
        preprocessed_text = preprocess_text(text)
        
        text_vectorized = tfidf_vectorizer.transform([preprocessed_text])
        
        prediction = model.predict(text_vectorized)[0]
        prediction_proba = model.predict_proba(text_vectorized)[0]
        
        confidence = float(np.max(prediction_proba))
        
        if category_mapping and prediction in category_mapping:
            result = category_mapping[prediction]
        else:
            result = {
                'category': f'Category_{prediction}',
                'description': 'Mental health concern detected',
                'specializations': ['General Mental Health']
            }
        
        return jsonify({
            'category': result['category'],
            'confidence': confidence,
            'description': result['description'],
            'recommendedSpecializations': result['specializations'],
            'all_probabilities': {
                cat: float(prob) for cat, prob in zip(range(len(prediction_proba)), prediction_proba)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    if category_mapping:
        return jsonify({
            'categories': [
                {'id': k, **v} for k, v in category_mapping.items()
            ]
        })
    return jsonify({'categories': []})

@app.route('/train', methods=['POST'])
def trigger_training():
    try:
        from train_model import train_and_save_models
        train_and_save_models()
        load_models()
        return jsonify({'message': 'Model trained and loaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs(MODEL_DIR, exist_ok=True)
    load_models()
    app.run(host='0.0.0.0', port=5001, debug=True)
