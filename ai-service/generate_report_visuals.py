"""Generate confusion matrix and per-class metrics bar chart for the report.

Re-creates the same train/test split used in train_model.py (random_state=42,
test_size=0.15, stratify=y) and evaluates the saved model on the test set.
"""
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    classification_report,
    accuracy_score,
)

from train_model import preprocess_text, LABEL_MAP, CATEGORIES

HERE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(HERE, 'models')
OUT_DIR = os.path.join(HERE, 'report_visuals')
os.makedirs(OUT_DIR, exist_ok=True)

LABELS = [CATEGORIES[i]['category'] for i in range(len(CATEGORIES))]


def load_test_split():
    df = pd.read_csv(os.path.join(HERE, 'Combined Data.csv'))
    df = df.dropna(subset=['statement', 'status'])
    df['text'] = df['statement'].apply(preprocess_text)
    df['label'] = df['status'].map(LABEL_MAP)
    df = df.dropna(subset=['label'])
    df['label'] = df['label'].astype(int)

    _, X_test, _, y_test = train_test_split(
        df['text'], df['label'],
        test_size=0.15, random_state=42, stratify=df['label']
    )
    return X_test, y_test


def main():
    print('Loading saved model and vectorizer...')
    vectorizer = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    model = joblib.load(os.path.join(MODEL_DIR, 'mental_health_model.pkl'))

    print('Rebuilding test split...')
    X_test, y_test = load_test_split()
    print(f'Test samples: {len(y_test)}')

    print('Predicting...')
    X_test_tfidf = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_tfidf)

    acc = accuracy_score(y_test, y_pred)
    print(f'Test accuracy: {acc:.4f}')

    # --- Confusion matrix ---
    fig, ax = plt.subplots(figsize=(9, 7))
    ConfusionMatrixDisplay.from_predictions(
        y_test, y_pred,
        display_labels=LABELS,
        xticks_rotation=45,
        cmap='Blues',
        ax=ax,
        colorbar=True,
    )
    ax.set_title(f'Confusion Matrix - Mental Health Classification (acc={acc:.3f})')
    plt.tight_layout()
    cm_path = os.path.join(OUT_DIR, 'confusion_matrix.png')
    plt.savefig(cm_path, dpi=150)
    plt.close(fig)
    print(f'Saved: {cm_path}')

    # Normalized confusion matrix (row-normalized) - useful for the report too
    fig, ax = plt.subplots(figsize=(9, 7))
    ConfusionMatrixDisplay.from_predictions(
        y_test, y_pred,
        display_labels=LABELS,
        xticks_rotation=45,
        cmap='Blues',
        ax=ax,
        normalize='true',
        values_format='.2f',
        colorbar=True,
    )
    ax.set_title('Confusion Matrix (row-normalized) - Recall per class')
    plt.tight_layout()
    cm_norm_path = os.path.join(OUT_DIR, 'confusion_matrix_normalized.png')
    plt.savefig(cm_norm_path, dpi=150)
    plt.close(fig)
    print(f'Saved: {cm_norm_path}')

    # --- Per-class metrics bar chart ---
    report = classification_report(
        y_test, y_pred, target_names=LABELS, output_dict=True, zero_division=0
    )
    df = pd.DataFrame(report).T.loc[LABELS, ['precision', 'recall', 'f1-score']]

    fig, ax = plt.subplots(figsize=(11, 5.5))
    df.plot(kind='bar', ax=ax, width=0.8,
            color=['#4C72B0', '#55A868', '#C44E52'])
    ax.set_title('Per-Class Precision / Recall / F1')
    ax.set_ylabel('Score')
    ax.set_ylim(0, 1.05)
    ax.set_xticklabels(LABELS, rotation=30, ha='right')
    ax.legend(loc='lower right')
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    for container in ax.containers:
        ax.bar_label(container, fmt='%.2f', fontsize=8, padding=2)
    plt.tight_layout()
    bar_path = os.path.join(OUT_DIR, 'classification_metrics.png')
    plt.savefig(bar_path, dpi=150)
    plt.close(fig)
    print(f'Saved: {bar_path}')

    # Save the textual report too
    report_text = classification_report(
        y_test, y_pred, target_names=LABELS, zero_division=0
    )
    txt_path = os.path.join(OUT_DIR, 'classification_report.txt')
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(f'Test accuracy: {acc:.4f}\n\n')
        f.write(report_text)
    print(f'Saved: {txt_path}')

    print('\nDone.')


if __name__ == '__main__':
    main()
