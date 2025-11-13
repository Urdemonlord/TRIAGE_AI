"""
Test script for TRIAGE.AI components
Tests preprocessor, classifier, and urgency engine
"""

import os
import sys
import json

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.utils.preprocessor import preprocess_text, extract_symptoms, extract_numeric_data
from app.models.urgency_engine import analyze_urgency
from app.models.classifier import SymptomClassifier


def print_header(text):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)


def print_section(text):
    """Print section header"""
    print(f"\n{'-'*70}")
    print(f"  {text}")
    print(f"{'-'*70}")


def test_preprocessor():
    """Test text preprocessing"""
    print_header("TEST 1: Text Preprocessor")

    test_cases = [
        "saya merasa nyeri dada menjalar ke lengan kiri dan sesak napas",
        "demam tinggi 39 derajat sudah 3 hari, kepala pusing",
        "tekanan darah 200/120, kepala sangat sakit dan mata kabur",
        "batuk berdarah dan berat badan turun 5kg dalam sebulan"
    ]

    for i, complaint in enumerate(test_cases, 1):
        print_section(f"Test Case {i}")
        print(f"Input: {complaint}\n")

        # Preprocess
        processed = preprocess_text(complaint)
        print(f"Processed: {processed['processed']}")

        # Extract symptoms
        symptoms = extract_symptoms(complaint)
        print(f"Symptoms: {symptoms}")

        # Extract numeric data
        numeric = extract_numeric_data(complaint)
        print(f"Numeric data: {json.dumps(numeric, indent=2)}")


def test_urgency_engine():
    """Test urgency detection"""
    print_header("TEST 2: Urgency Engine")

    test_cases = [
        {
            "complaint": "nyeri dada menjalar ke lengan kiri dan sesak napas",
            "expected": "Red"
        },
        {
            "complaint": "demam tinggi 39 derajat sudah 3 hari",
            "expected": "Yellow"
        },
        {
            "complaint": "batuk pilek biasa, hidung meler",
            "expected": "Green"
        },
        {
            "complaint": "pingsan tadi pagi dan sekarang pusing",
            "expected": "Red"
        },
        {
            "complaint": "sakit kepala hebat dan muntah-muntah",
            "expected": "Yellow"
        }
    ]

    correct = 0
    total = len(test_cases)

    for i, case in enumerate(test_cases, 1):
        print_section(f"Test Case {i}")
        complaint = case["complaint"]
        expected = case["expected"]

        print(f"Input: {complaint}")
        print(f"Expected urgency: {expected}\n")

        # Preprocess
        processed = preprocess_text(complaint)
        numeric = extract_numeric_data(complaint)

        # Analyze urgency
        result = analyze_urgency(processed['processed'], numeric)

        print(f"Detected urgency: {result['urgency_level']}")
        print(f"Urgency score: {result['urgency_score']}")
        print(f"Description: {result['description']}")
        print(f"Recommendation: {result['recommendation']}")

        if result['detected_flags']:
            print(f"\nDetected flags ({len(result['detected_flags'])}):")
            for flag in result['detected_flags']:
                print(f"  - [{flag['urgency']}] {flag['keyword']}: {flag['reason']}")

        # Check if correct
        if result['urgency_level'] == expected:
            print("\n[PASS]")
            correct += 1
        else:
            print(f"\n[FAIL] (expected {expected}, got {result['urgency_level']})")

    print(f"\n\n{'='*70}")
    print(f"Urgency Detection Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
    print(f"{'='*70}")


def test_classifier():
    """Test ML classifier"""
    print_header("TEST 3: Disease Category Classifier")

    # Check if model exists
    model_path = os.path.join(os.path.dirname(__file__), 'app/data/trained_model')

    if not os.path.exists(model_path):
        print("\n[!] Model not found. Training model first...\n")

        # Train model
        dataset_path = os.path.join(os.path.dirname(__file__), 'app/data/symptoms_dataset.csv')
        classifier = SymptomClassifier()
        classifier.train(dataset_path)
        classifier.save_model(model_path)
        print("\n[+] Model trained and saved\n")
    else:
        print("\n[+] Model found, loading...\n")
        classifier = SymptomClassifier()
        classifier.load_model(model_path)

    # Test cases
    test_cases = [
        {
            "complaint": "nyeri dada menjalar ke lengan kiri dan sesak napas",
            "expected": "Kardiovaskular"
        },
        {
            "complaint": "batuk berdarah dan demam tinggi",
            "expected": "Respirasi"
        },
        {
            "complaint": "sakit perut hebat di kanan bawah dan mual",
            "expected": "Gastrointestinal"
        },
        {
            "complaint": "kepala pusing berputar dan mual muntah",
            "expected": "Neurologi"
        },
        {
            "complaint": "gatal-gatal seluruh badan dan bentol merah",
            "expected": "Dermatologi"
        }
    ]

    correct = 0
    total = len(test_cases)

    for i, case in enumerate(test_cases, 1):
        print_section(f"Test Case {i}")
        complaint = case["complaint"]
        expected = case["expected"]

        print(f"Input: {complaint}")
        print(f"Expected category: {expected}\n")

        # Preprocess
        processed = preprocess_text(complaint)

        # Predict
        result = classifier.predict_with_details(processed['processed'])

        print(f"Predicted category: {result['primary_category']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Probability: {result['probability']:.2%}")

        if result['alternative_categories']:
            print("\nAlternative categories:")
            for alt in result['alternative_categories']:
                print(f"  - {alt['category']}: {alt['probability']:.2%}")

        # Check if correct
        if result['primary_category'] == expected:
            print("\n[PASS]")
            correct += 1
        else:
            print(f"\n[FAIL] (expected {expected})")

    print(f"\n\n{'='*70}")
    print(f"Classification Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
    print(f"{'='*70}")


def test_full_pipeline():
    """Test complete triage pipeline"""
    print_header("TEST 4: Full Triage Pipeline")

    # Load classifier
    model_path = os.path.join(os.path.dirname(__file__), 'app/data/trained_model')
    classifier = SymptomClassifier()

    if os.path.exists(model_path):
        classifier.load_model(model_path)
    else:
        print("Model not found. Please run test_classifier first.")
        return

    # Test cases
    test_cases = [
        "saya merasa nyeri dada yang sangat sakit menjalar ke lengan kiri dan sesak napas",
        "batuk pilek biasa sudah 2 hari, hidung meler",
        "demam tinggi 40 derajat sudah 5 hari, leher kaku dan sakit kepala"
    ]

    for i, complaint in enumerate(test_cases, 1):
        print_section(f"Full Triage Test {i}")
        print(f"Patient Complaint:\n  \"{complaint}\"\n")

        # Step 1: Preprocess
        processed = preprocess_text(complaint)
        symptoms = extract_symptoms(complaint)
        numeric = extract_numeric_data(complaint)

        print(f"Extracted Symptoms: {symptoms}")
        print(f"Numeric Data: {json.dumps(numeric, indent=2)}\n")

        # Step 2: Classify
        category_result = classifier.predict_with_details(processed['processed'])

        print(f"Category: {category_result['primary_category']}")
        print(f"Confidence: {category_result['confidence']} ({category_result['probability']:.1%})\n")

        # Step 3: Urgency
        urgency_result = analyze_urgency(processed['processed'], numeric)

        print(f"Urgency Level: {urgency_result['urgency_level']}")
        print(f"Urgency Score: {urgency_result['urgency_score']}/100")
        print(f"Description: {urgency_result['description']}")
        print(f"Recommendation: {urgency_result['recommendation']}")

        if urgency_result['detected_flags']:
            print(f"\nRed Flags Detected ({len(urgency_result['detected_flags'])}):")
            for flag in urgency_result['detected_flags']:
                print(f"  [{flag['severity']}] {flag['keyword']}")
                print(f"    > {flag['reason']}")
                print(f"    > {flag['action']}")

        print("\n" + "-"*70)


def main():
    """Run all tests"""
    print("\n")
    print("=" * 70)
    print("  TRIAGE.AI - AI Model Test Suite".center(70))
    print("=" * 70)

    try:
        # Test 1: Preprocessor
        test_preprocessor()

        # Test 2: Urgency Engine
        test_urgency_engine()

        # Test 3: Classifier
        test_classifier()

        # Test 4: Full Pipeline
        test_full_pipeline()

        print_header("ALL TESTS COMPLETED")
        print("\n[SUCCESS] Test suite finished successfully!\n")

    except Exception as e:
        print(f"\n[ERROR] Error during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
