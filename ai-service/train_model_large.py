"""
Training script for TRIAGE.AI ML model with larger dataset
Run this to retrain with 927 samples from DATABASE
"""

import os
import sys

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.models.classifier import SymptomClassifier


def main():
    """Train and save the ML model with larger dataset"""

    print("\n" + "="*60)
    print("TRIAGE.AI - Model Retraining (Large Dataset)")
    print("="*60 + "\n")

    # Paths
    current_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(current_dir, 'app/data/symptoms_dataset_improved.csv')
    model_save_path = os.path.join(current_dir, 'app/data/trained_model')

    # Check if dataset exists
    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset not found at {dataset_path}")
        print("Please run: python prepare_dataset_improved.py first")
        return

    print(f"[INFO] Dataset: {dataset_path}")
    print(f"[INFO] Model will be saved to: {model_save_path}\n")

    # Initialize and train classifier
    print("[*] Initializing classifier...")
    classifier = SymptomClassifier()

    print("[*] Starting training with large dataset...")
    print("    This may take 1-2 minutes...\n")

    try:
        metrics = classifier.train(dataset_path)

        print("\n" + "="*60)
        print("TRAINING RESULTS")
        print("="*60)
        print(f"  Accuracy: {metrics['accuracy']:.2%}")
        print(f"  Categories: {len(metrics['categories'])}")
        print(f"  Training samples: {metrics['train_size']}")
        print(f"  Test samples: {metrics['test_size']}")
        print("\n  Category list:")
        for cat in metrics['categories']:
            print(f"    - {cat}")
        print("="*60 + "\n")

        # Save model
        print("[*] Saving model...")
        classifier.save_model(model_save_path)

        print("\n[SUCCESS] Training completed successfully!")
        print(f"[SUCCESS] Model saved to: {model_save_path}\n")

        # Test prediction with various cases
        print("="*60)
        print("TESTING MODEL WITH SAMPLE CASES")
        print("="*60 + "\n")

        test_cases = [
            "Saya merasa nyeri dada yang menjalar ke lengan kiri dan sesak napas",
            "Saya mengalami gatal, ruam kulit, dan bintik kulit",
            "Keluhan saya adalah sakit perut, mual, dan muntah",
            "Saya punya gejala demam tinggi, batuk, dan sesak napas",
            "Saya menderita pusing, kehilangan keseimbangan, dan leher kaku"
        ]

        for i, complaint in enumerate(test_cases, 1):
            result = classifier.predict_with_details(complaint)
            print(f"[{i}] {complaint[:60]}...")
            print(f"    Category: {result['primary_category']}")
            print(f"    Confidence: {result['confidence']} ({result['probability']:.1%})")

            if result['alternative_categories']:
                alt = result['alternative_categories'][0]
                print(f"    Alternative: {alt['category']} ({alt['probability']:.1%})")
            print()

        print("="*60)
        print("[READY] System is ready to serve predictions!")
        print("        Run: uvicorn app.main:app --reload")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
