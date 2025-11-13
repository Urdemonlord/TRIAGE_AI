"""
Training script for TRIAGE.AI ML model
Run this before starting the API server
"""

import os
import sys

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.models.classifier import SymptomClassifier


def main():
    """Train and save the ML model"""

    print("\n" + "="*60)
    print("TRIAGE.AI - Model Training")
    print("="*60 + "\n")

    # Paths
    current_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(current_dir, 'app/data/symptoms_dataset.csv')
    model_save_path = os.path.join(current_dir, 'app/data/trained_model')

    # Check if dataset exists
    if not os.path.exists(dataset_path):
        print(f"❌ Error: Dataset not found at {dataset_path}")
        return

    print(f"📁 Dataset: {dataset_path}")
    print(f"💾 Model will be saved to: {model_save_path}\n")

    # Initialize and train classifier
    print("🔄 Initializing classifier...")
    classifier = SymptomClassifier()

    print("🚀 Starting training...\n")
    try:
        metrics = classifier.train(dataset_path)

        print("\n📊 Training Results:")
        print(f"   Accuracy: {metrics['accuracy']:.2%}")
        print(f"   Categories: {len(metrics['categories'])}")
        print(f"   Training samples: {metrics['train_size']}")
        print(f"   Test samples: {metrics['test_size']}\n")

        # Save model
        print("💾 Saving model...")
        classifier.save_model(model_save_path)

        print("\n✅ Training completed successfully!")
        print(f"✅ Model saved to: {model_save_path}\n")

        # Test prediction
        print("🧪 Testing model with sample complaint...\n")
        test_complaints = [
            "saya merasa nyeri dada yang menjalar ke lengan kiri dan sesak napas",
            "batuk pilek sudah 3 hari, hidung meler",
            "demam tinggi 39 derajat dan kepala pusing"
        ]

        for complaint in test_complaints:
            result = classifier.predict_with_details(complaint)
            print(f"Input: {complaint}")
            print(f"→ Category: {result['primary_category']}")
            print(f"→ Confidence: {result['confidence']} ({result['probability']:.1%})")
            print()

        print("="*60)
        print("🎉 Ready to start the API server!")
        print("   Run: python -m uvicorn app.main:app --reload")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
