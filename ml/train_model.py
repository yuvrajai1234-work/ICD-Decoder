"""
ICD Code Prediction Model Training Script
Trains a TF-IDF + Multi-label classifier on the MTSamples dataset.
"""

import os
import sys
import pandas as pd
import numpy as np
import json
import joblib
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from icd_mapping import SPECIALTY_TO_ICD, KEYWORD_TO_ICD


def download_dataset():
    """Download the mtsamples dataset."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "mtsamples.csv")
    if os.path.exists(data_path):
        print(f"Dataset already exists at {data_path}")
        return data_path
    
    os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)
    
    import urllib.request
    url = "https://raw.githubusercontent.com/socd06/medical-nlp/master/data/mtsamples.csv"
    print(f"Downloading dataset from {url}...")
    urllib.request.urlretrieve(url, data_path)
    print(f"Dataset saved to {data_path}")
    return data_path


def clean_text(text):
    """Clean clinical text for model input."""
    if pd.isna(text):
        return ""
    text = str(text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def assign_icd_codes(row):
    """Assign ICD codes based on specialty and keywords."""
    codes = set()
    specialty = str(row.get('medical_specialty', '')).strip()
    text = clean_text(row.get('transcription', '')) + ' ' + clean_text(row.get('description', ''))
    keywords_str = str(row.get('keywords', ''))
    text_lower = (text + ' ' + keywords_str).lower()
    
    # Keyword matches (more specific)
    for keyword, icd_info in KEYWORD_TO_ICD.items():
        if keyword in text_lower:
            codes.add(icd_info['code'])
    
    # Specialty matches
    if specialty in SPECIALTY_TO_ICD:
        for icd_info in SPECIALTY_TO_ICD[specialty][:3]:  # Top 3 per specialty
            codes.add(icd_info['code'])
    
    # Ensure at least one code
    if not codes and specialty in SPECIALTY_TO_ICD:
        codes.add(SPECIALTY_TO_ICD[specialty][0]['code'])
    
    return list(codes) if codes else ['R69']  # R69 = Illness, unspecified


def train_model():
    """Main training pipeline."""
    print("=" * 60)
    print("ICD Code Prediction Model Training")
    print("=" * 60)
    
    # 1. Load data
    data_path = download_dataset()
    print("\n[1/6] Loading dataset...")
    df = pd.read_csv(data_path)
    print(f"  Loaded {len(df)} records")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Specialties: {df['medical_specialty'].nunique()} unique")
    
    # 2. Clean text
    print("\n[2/6] Preprocessing text...")
    df['clean_text'] = df.apply(
        lambda r: clean_text(r.get('transcription', '')) + ' ' + 
                  clean_text(r.get('description', '')) + ' ' +
                  clean_text(r.get('keywords', '')),
        axis=1
    )
    df = df[df['clean_text'].str.len() > 50]  # Filter too-short entries
    print(f"  {len(df)} records after filtering")
    
    # 3. Assign ICD codes
    print("\n[3/6] Assigning ICD codes...")
    df['icd_codes'] = df.apply(assign_icd_codes, axis=1)
    
    # Collect all unique codes
    all_codes = set()
    for codes in df['icd_codes']:
        all_codes.update(codes)
    print(f"  {len(all_codes)} unique ICD codes assigned")
    
    # Show distribution
    code_counts = {}
    for codes in df['icd_codes']:
        for c in codes:
            code_counts[c] = code_counts.get(c, 0) + 1
    top_codes = sorted(code_counts.items(), key=lambda x: -x[1])[:15]
    print(f"  Top 15 codes: {top_codes}")
    
    # 4. Vectorize text
    print("\n[4/6] Training TF-IDF vectorizer...")
    tfidf = TfidfVectorizer(
        max_features=15000,
        ngram_range=(1, 3),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
        stop_words='english'
    )
    X = tfidf.fit_transform(df['clean_text'])
    print(f"  Feature matrix shape: {X.shape}")
    
    # 5. Train multi-label classifier
    print("\n[5/6] Training multi-label classifier...")
    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(df['icd_codes'])
    print(f"  Label matrix shape: {Y.shape}")
    print(f"  Number of classes: {len(mlb.classes_)}")
    
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=0.2, random_state=42
    )
    
    classifier = OneVsRestClassifier(
        LogisticRegression(
            C=5.0,
            max_iter=1000,
            solver='lbfgs',
            class_weight='balanced'
        ),
        n_jobs=-1
    )
    classifier.fit(X_train, Y_train)
    
    # Evaluate
    Y_pred = classifier.predict(X_test)
    print("\n  Classification Report (top classes):")
    
    # Get non-zero columns for report
    nonzero_cols = Y_test.sum(axis=0) > 0
    if nonzero_cols.sum() > 0:
        active_classes = [mlb.classes_[i] for i in range(len(mlb.classes_)) if nonzero_cols[i]]
        print(f"  Active test classes: {len(active_classes)}")
    
    # 6. Save model artifacts
    print("\n[6/6] Saving model artifacts...")
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(tfidf, os.path.join(model_dir, "tfidf_vectorizer.joblib"))
    joblib.dump(classifier, os.path.join(model_dir, "classifier.joblib"))
    joblib.dump(mlb, os.path.join(model_dir, "label_binarizer.joblib"))
    
    # Save code metadata
    code_metadata = {}
    for keyword, info in KEYWORD_TO_ICD.items():
        code = info['code']
        if code not in code_metadata:
            code_metadata[code] = info['description']
    for specialty, codes in SPECIALTY_TO_ICD.items():
        for info in codes:
            code = info['code']
            if code not in code_metadata:
                code_metadata[code] = info['description']
    
    with open(os.path.join(model_dir, "code_metadata.json"), 'w') as f:
        json.dump(code_metadata, f, indent=2)
    
    # Save specialty list
    specialties = df['medical_specialty'].dropna().unique().tolist()
    with open(os.path.join(model_dir, "specialties.json"), 'w') as f:
        json.dump(sorted(specialties), f, indent=2)
    
    print(f"\n  Model artifacts saved to {model_dir}/")
    print("  Files:")
    print("    - tfidf_vectorizer.joblib")
    print("    - classifier.joblib") 
    print("    - label_binarizer.joblib")
    print("    - code_metadata.json")
    print("    - specialties.json")
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)
    
    return tfidf, classifier, mlb


if __name__ == "__main__":
    train_model()
