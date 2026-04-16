"""
Flask API Server for ICD Code Prediction
Serves the trained ML model via REST API.
"""

import os
import json
import re
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from icd_mapping import KEYWORD_TO_ICD, SPECIALTY_TO_ICD

app = Flask(__name__)
CORS(app)

# Global model objects
model_dir = os.path.join(os.path.dirname(__file__), "model")
tfidf = None
classifier = None  
mlb = None
code_metadata = {}

# In-memory stores
audit_log = []
review_queue = []
approved_predictions = []

# Confidence thresholds
HIGH_CONFIDENCE = 0.85
MEDIUM_CONFIDENCE = 0.60


def load_model():
    """Load trained model artifacts."""
    global tfidf, classifier, mlb, code_metadata
    
    try:
        tfidf = joblib.load(os.path.join(model_dir, "tfidf_vectorizer.joblib"))
        classifier = joblib.load(os.path.join(model_dir, "classifier.joblib"))
        mlb = joblib.load(os.path.join(model_dir, "label_binarizer.joblib"))
        
        with open(os.path.join(model_dir, "code_metadata.json"), 'r') as f:
            code_metadata = json.load(f)
        
        print("✓ Model loaded successfully")
        print(f"  Classes: {len(mlb.classes_)}")
        return True
    except Exception as e:
        print(f"✗ Failed to load model: {e}")
        return False


def find_evidence_spans(text, keyword, context_size=80):
    """Find evidence spans in the clinical text for a matched keyword."""
    text_lower = text.lower()
    keyword_lower = keyword.lower()
    spans = []
    
    start = 0
    while True:
        idx = text_lower.find(keyword_lower, start)
        if idx == -1:
            break
        
        span_start = max(0, idx - context_size)
        span_end = min(len(text), idx + len(keyword) + context_size)
        
        span = text[span_start:span_end].strip()
        if span_start > 0:
            span = "..." + span
        if span_end < len(text):
            span = span + "..."
        
        spans.append({
            "text": span,
            "start": idx,
            "end": idx + len(keyword),
            "keyword": keyword
        })
        
        start = idx + len(keyword)
        if len(spans) >= 3:
            break
    
    return spans


def predict_icd_codes(clinical_text, doc_type="discharge_summary"):
    """Predict ICD codes for given clinical text."""
    if not tfidf or not classifier or not mlb:
        return {"error": "Model not loaded"}
    
    # Clean text
    clean = re.sub(r'\s+', ' ', clinical_text).strip()
    
    # Get ML predictions with probabilities
    X = tfidf.transform([clean])
    
    # Get decision function scores (proxy for confidence)
    try:
        decision_scores = classifier.decision_function(X)[0]
    except:
        decision_scores = np.zeros(len(mlb.classes_))
    
    # Convert to probabilities using sigmoid
    proba = 1 / (1 + np.exp(-decision_scores))
    
    # Get predictions above threshold
    predictions = []
    seen_codes = set()
    
    # ML model predictions
    for idx in np.argsort(-proba):
        code = mlb.classes_[idx]
        confidence = float(proba[idx])
        
        if confidence < 0.15:  # Minimum threshold
            break
        
        if code in seen_codes:
            continue
        seen_codes.add(code)
        
        description = code_metadata.get(code, "Unknown")
        
        # Find evidence spans
        evidence_spans = []
        text_lower = clean.lower()
        for keyword, info in KEYWORD_TO_ICD.items():
            if info['code'] == code and keyword in text_lower:
                evidence_spans.extend(find_evidence_spans(clinical_text, keyword))
        
        predictions.append({
            "code": code,
            "description": description,
            "confidence": round(confidence, 4),
            "evidence_spans": evidence_spans[:3],
            "source": "ml_model"
        })
        
        if len(predictions) >= 15:
            break
    
    # Supplement with keyword matches not already found
    for keyword, info in KEYWORD_TO_ICD.items():
        if keyword in clean.lower() and info['code'] not in seen_codes:
            evidence_spans = find_evidence_spans(clinical_text, keyword)
            predictions.append({
                "code": info['code'],
                "description": info['description'],
                "confidence": round(0.70 + (0.2 * len(evidence_spans) / 3), 4),
                "evidence_spans": evidence_spans[:3],
                "source": "keyword_match"
            })
            seen_codes.add(info['code'])
    
    # Sort by confidence
    predictions.sort(key=lambda x: -x['confidence'])
    
    # Determine routing
    high_conf = [p for p in predictions if p['confidence'] >= HIGH_CONFIDENCE]
    low_conf = [p for p in predictions if p['confidence'] < MEDIUM_CONFIDENCE]
    
    if len(high_conf) == len(predictions) and predictions:
        routing = "auto_approve"
    elif len(low_conf) > len(predictions) * 0.5:
        routing = "human_review"
    else:
        routing = "partial_review"
    
    return {
        "predictions": predictions[:10],
        "routing": routing,
        "total_codes": len(predictions),
        "high_confidence_count": len(high_conf),
        "document_type": doc_type
    }


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict ICD codes for clinical text."""
    data = request.json
    clinical_text = data.get('text', '')
    doc_type = data.get('document_type', 'discharge_summary')
    
    if not clinical_text or len(clinical_text.strip()) < 20:
        return jsonify({"error": "Clinical text too short. Minimum 20 characters required."}), 400
    
    result = predict_icd_codes(clinical_text, doc_type)
    
    if "error" in result:
        return jsonify(result), 500
    
    # Create prediction record
    prediction_id = str(uuid.uuid4())[:8]
    record = {
        "id": prediction_id,
        "timestamp": datetime.now().isoformat(),
        "document_type": doc_type,
        "text_preview": clinical_text[:200] + "..." if len(clinical_text) > 200 else clinical_text,
        "predictions": result['predictions'],
        "routing": result['routing'],
        "status": "auto_approved" if result['routing'] == "auto_approve" else "pending_review",
        "reviewer": None,
        "review_changes": []
    }
    
    # Add to appropriate queue
    if result['routing'] == "auto_approve":
        approved_predictions.append(record)
    else:
        review_queue.append(record)
    
    # Log audit entry
    audit_log.append({
        "id": str(uuid.uuid4())[:8],
        "prediction_id": prediction_id,
        "action": "prediction_created",
        "timestamp": datetime.now().isoformat(),
        "routing": result['routing'],
        "codes": [p['code'] for p in result['predictions']],
        "user": "system",
        "details": f"Document type: {doc_type}, {len(result['predictions'])} codes predicted"
    })
    
    result['prediction_id'] = prediction_id
    result['status'] = record['status']
    
    return jsonify(result)


@app.route('/api/review', methods=['GET'])
def get_review_queue():
    """Get items pending human review."""
    return jsonify({
        "queue": review_queue,
        "total": len(review_queue),
        "approved_total": len(approved_predictions)
    })


@app.route('/api/review/<prediction_id>', methods=['POST'])
def submit_review(prediction_id):
    """Submit human review for a prediction."""
    data = request.json
    action = data.get('action')  # approve, reject, modify
    reviewer = data.get('reviewer', 'anonymous')
    changes = data.get('changes', [])
    
    # Find in review queue
    record = None
    for r in review_queue:
        if r['id'] == prediction_id:
            record = r
            break
    
    if not record:
        return jsonify({"error": "Prediction not found in review queue"}), 404
    
    # Process review
    record['status'] = f"reviewed_{action}"
    record['reviewer'] = reviewer
    record['review_changes'] = changes
    record['reviewed_at'] = datetime.now().isoformat()
    
    if action == 'modify':
        # Apply changes to predictions
        added = data.get('added_codes', [])
        removed = data.get('removed_codes', [])
        for code_info in added:
            record['predictions'].append({
                "code": code_info['code'],
                "description": code_info.get('description', ''),
                "confidence": 1.0,
                "evidence_spans": [],
                "source": "human_reviewer"
            })
        record['predictions'] = [
            p for p in record['predictions'] 
            if p['code'] not in removed
        ]
    
    # Move to approved
    approved_predictions.append(record)
    review_queue.remove(record)
    
    # Audit log
    audit_log.append({
        "id": str(uuid.uuid4())[:8],
        "prediction_id": prediction_id,
        "action": f"review_{action}",
        "timestamp": datetime.now().isoformat(),
        "routing": "reviewed",
        "codes": [p['code'] for p in record['predictions']],
        "user": reviewer,
        "details": f"Action: {action}, Changes: {len(changes)}"
    })
    
    return jsonify({"success": True, "record": record})


@app.route('/api/audit', methods=['GET'])
def get_audit_log():
    """Get the full audit log."""
    return jsonify({
        "log": sorted(audit_log, key=lambda x: x['timestamp'], reverse=True),
        "total": len(audit_log)
    })


@app.route('/api/export/fhir/<prediction_id>', methods=['GET'])
def export_fhir(prediction_id):
    """Export prediction as FHIR-style JSON."""
    # Search in both queues
    record = None
    for r in approved_predictions + review_queue:
        if r['id'] == prediction_id:
            record = r
            break
    
    if not record:
        return jsonify({"error": "Record not found"}), 404
    
    # Build FHIR-style Condition resources
    fhir_bundle = {
        "resourceType": "Bundle",
        "id": prediction_id,
        "type": "collection",
        "timestamp": datetime.now().isoformat(),
        "meta": {
            "source": "ICD-Decoder-ML-v1.0",
            "lastUpdated": datetime.now().isoformat()
        },
        "entry": []
    }
    
    for i, pred in enumerate(record.get('predictions', [])):
        condition = {
            "fullUrl": f"urn:uuid:{prediction_id}-condition-{i}",
            "resource": {
                "resourceType": "Condition",
                "id": f"{prediction_id}-{i}",
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active"
                    }]
                },
                "code": {
                    "coding": [{
                        "system": "http://hl7.org/fhir/sid/icd-10-cm",
                        "code": pred['code'],
                        "display": pred['description']
                    }],
                    "text": pred['description']
                },
                "evidence": [{
                    "detail": [{
                        "display": span.get('text', '')
                    } for span in pred.get('evidence_spans', [])]
                }] if pred.get('evidence_spans') else [],
                "extension": [{
                    "url": "http://icd-decoder.ai/fhir/confidence",
                    "valueDecimal": pred['confidence']
                }, {
                    "url": "http://icd-decoder.ai/fhir/source",
                    "valueString": pred.get('source', 'ml_model')
                }],
                "note": [{
                    "text": f"Predicted by ICD Decoder ML Model. Confidence: {pred['confidence']:.1%}. "
                            f"Status: {record.get('status', 'unknown')}. "
                            f"Reviewer: {record.get('reviewer', 'N/A')}"
                }]
            }
        }
        fhir_bundle['entry'].append(condition)
    
    # Add audit provenance
    fhir_bundle['entry'].append({
        "fullUrl": f"urn:uuid:{prediction_id}-provenance",
        "resource": {
            "resourceType": "Provenance",
            "id": f"{prediction_id}-provenance",
            "recorded": record.get('timestamp', datetime.now().isoformat()),
            "activity": {
                "coding": [{
                    "system": "http://icd-decoder.ai/fhir/activity",
                    "code": "icd-prediction",
                    "display": "ICD Code Prediction"
                }]
            },
            "agent": [{
                "type": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        "code": "author"
                    }]
                },
                "who": {
                    "display": "ICD Decoder ML Model v1.0"
                }
            }]
        }
    })
    
    return jsonify(fhir_bundle)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics."""
    total = len(approved_predictions) + len(review_queue)
    auto_approved = len([r for r in approved_predictions if r.get('status') == 'auto_approved'])
    human_reviewed = len([r for r in approved_predictions if r.get('status', '').startswith('reviewed_')])
    
    return jsonify({
        "total_predictions": total,
        "auto_approved": auto_approved,
        "human_reviewed": human_reviewed,
        "pending_review": len(review_queue),
        "automation_rate": round(auto_approved / max(total, 1) * 100, 1),
        "audit_entries": len(audit_log)
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_loaded": tfidf is not None,
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("Loading model...")
    if load_model():
        print("Starting ICD Decoder API Server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("ERROR: Could not load model. Run train_model.py first.")
        sys.exit(1)
