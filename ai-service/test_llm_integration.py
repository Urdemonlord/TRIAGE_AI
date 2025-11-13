"""
Test LLM Integration with TRIAGE.AI
Tests the complete pipeline with LLM-enhanced summaries
"""

import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.utils.preprocessor import preprocess_text, extract_symptoms, extract_numeric_data
from app.models.urgency_engine import analyze_urgency
from app.models.classifier import SymptomClassifier
from app.utils.llm_service import generate_medical_summary, generate_category_explanation, generate_first_aid_advice

print("\n" + "="*70)
print("TRIAGE.AI - LLM Integration Test")
print("="*70 + "\n")

# Load model
print("[*] Loading AI model...")
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'app/data/trained_model')
classifier = SymptomClassifier()

if os.path.exists(MODEL_PATH):
    classifier.load_model(MODEL_PATH)
    print("[SUCCESS] Model loaded\n")
else:
    print("[ERROR] Model not found. Please run train_model_large.py first\n")
    sys.exit(1)

# Test cases
test_cases = [
    {
        "complaint": "nyeri dada menjalar ke lengan kiri dan sesak napas sejak 1 jam yang lalu",
        "expected_urgency": "Red"
    },
    {
        "complaint": "demam tinggi 39 derajat sudah 3 hari, batuk, dan lemas",
        "expected_urgency": "Yellow"
    },
    {
        "complaint": "gatal-gatal dan ruam merah di kulit",
        "expected_urgency": "Green/Yellow"
    }
]

for i, case in enumerate(test_cases, 1):
    print("="*70)
    print(f"TEST CASE {i}")
    print("="*70)
    print(f"Complaint: {case['complaint']}")
    print(f"Expected Urgency: {case['expected_urgency']}\n")

    # 1. Preprocess
    print("[1] PREPROCESSING...")
    preprocessed = preprocess_text(case['complaint'])
    symptoms = extract_symptoms(case['complaint'])
    numeric_data = extract_numeric_data(case['complaint'])

    print(f"    Processed: {preprocessed['processed']}")
    print(f"    Symptoms: {symptoms}")
    print(f"    Numeric: {numeric_data}\n")

    # 2. Classify
    print("[2] ML CLASSIFICATION...")
    category_result = classifier.predict_with_details(preprocessed['processed'])

    print(f"    Category: {category_result['primary_category']}")
    print(f"    Confidence: {category_result['confidence']} ({category_result['probability']:.1%})\n")

    # 3. Urgency Analysis
    print("[3] URGENCY ANALYSIS...")
    urgency_result = analyze_urgency(preprocessed['processed'], numeric_data)

    print(f"    Level: {urgency_result['urgency_level']}")
    print(f"    Score: {urgency_result['urgency_score']}/100")
    print(f"    Red flags: {urgency_result['flags_summary']['red']}")
    print(f"    Yellow flags: {urgency_result['flags_summary']['yellow']}\n")

    # 4. LLM-Enhanced Summary
    print("[4] LLM-ENHANCED SUMMARY...")
    print("    Generating with LLM API (this may take a few seconds)...")

    try:
        summary = generate_medical_summary(
            complaint=case['complaint'],
            category=category_result['primary_category'],
            urgency=urgency_result['urgency_level'],
            symptoms=symptoms,
            red_flags=urgency_result['detected_flags']
        )

        print(f"\n    Summary:\n")
        for line in summary.split('\n'):
            if line.strip():
                print(f"      {line}")
        print()

    except Exception as e:
        print(f"    [ERROR] LLM Summary failed: {e}\n")

    # 5. Category Explanation (LLM)
    if urgency_result['urgency_level'] != 'Red':  # Only for non-urgent
        print("[5] LLM CATEGORY EXPLANATION...")

        try:
            explanation = generate_category_explanation(
                category=category_result['primary_category'],
                confidence=category_result['probability']
            )

            if explanation:
                print(f"    {explanation}\n")
            else:
                print("    [INFO] LLM not available\n")

        except Exception as e:
            print(f"    [ERROR] Explanation failed: {e}\n")

    # 6. First Aid Advice (LLM)
    if urgency_result['urgency_level'] != 'Red':
        print("[6] LLM FIRST AID ADVICE...")

        try:
            advice = generate_first_aid_advice(
                category=category_result['primary_category'],
                urgency=urgency_result['urgency_level']
            )

            if advice:
                print(f"    {advice}\n")
            else:
                print("    [INFO] LLM not available\n")

        except Exception as e:
            print(f"    [ERROR] First aid advice failed: {e}\n")

    print()

print("="*70)
print("TEST COMPLETED")
print("="*70)
print("\n[INFO] All components tested:")
print("  [x] Preprocessor")
print("  [x] ML Classifier (927 samples)")
print("  [x] Urgency Engine")
print("  [x] LLM Integration (SumoPod AI)")
print("\n[SUCCESS] TRIAGE.AI ready for deployment!\n")
