"""
ML-based Disease Category Classifier
Uses TF-IDF + Logistic Regression for multi-class classification
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
from typing import Dict, List, Tuple
import json


class SymptomClassifier:
    """ML Classifier for disease category prediction"""

    def __init__(self, model_path: str = None):
        """
        Initialize classifier

        Args:
            model_path: Path to saved model directory
        """
        self.vectorizer = None
        self.model = None
        self.categories = []
        self.is_trained = False

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def train(self, dataset_path: str) -> Dict:
        """
        Train classifier on dataset

        Args:
            dataset_path: Path to symptoms_dataset.csv

        Returns:
            Training metrics
        """
        # Load dataset
        df = pd.read_csv(dataset_path)

        # Prepare data
        X = df['complaint'].values
        y = df['category'].values
        self.categories = list(df['category'].unique())

        # Check if we can stratify (need at least 2 samples per class)
        from collections import Counter
        class_counts = Counter(y)
        min_class_count = min(class_counts.values())
        can_stratify = min_class_count >= 2

        # Split data
        if can_stratify:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
        else:
            print(f"Warning: Some classes have <2 samples. Splitting without stratification.")
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

        # Create TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),  # unigrams and bigrams
            min_df=1,
            max_df=0.8,
            lowercase=True
        )

        # Fit vectorizer and transform data
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)

        # Train Logistic Regression
        self.model = LogisticRegression(
            max_iter=1000,
            multi_class='multinomial',
            random_state=42,
            class_weight='balanced'  # Handle class imbalance
        )

        self.model.fit(X_train_tfidf, y_train)
        self.is_trained = True

        # Evaluate
        y_pred = self.model.predict(X_test_tfidf)
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)

        print(f"\n{'='*50}")
        print("TRAINING COMPLETED")
        print(f"{'='*50}")
        print(f"Accuracy: {accuracy:.3f}")
        print(f"Categories: {len(self.categories)}")
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        print(f"{'='*50}\n")

        return {
            'accuracy': accuracy,
            'report': report,
            'categories': self.categories,
            'train_size': len(X_train),
            'test_size': len(X_test)
        }

    def predict(self, complaint_text: str, top_k: int = 3) -> List[Dict]:
        """
        Predict disease category from complaint text

        Args:
            complaint_text: Preprocessed complaint text
            top_k: Number of top predictions to return

        Returns:
            List of predictions with probabilities
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first or load a trained model.")

        # Vectorize input
        X = self.vectorizer.transform([complaint_text])

        # Get probabilities for all classes
        probabilities = self.model.predict_proba(X)[0]

        # Get top K predictions
        top_indices = np.argsort(probabilities)[-top_k:][::-1]

        predictions = []
        for idx in top_indices:
            predictions.append({
                'category': self.categories[idx],
                'probability': float(probabilities[idx]),
                'confidence': self._get_confidence_level(probabilities[idx])
            })

        return predictions

    def _get_confidence_level(self, probability: float) -> str:
        """Convert probability to confidence level"""
        if probability >= 0.7:
            return 'Tinggi'
        elif probability >= 0.4:
            return 'Sedang'
        else:
            return 'Rendah'

    def predict_with_details(self, complaint_text: str) -> Dict:
        """
        Predict with additional details

        Args:
            complaint_text: Preprocessed complaint text

        Returns:
            Detailed prediction result
        """
        predictions = self.predict(complaint_text, top_k=3)

        # Primary prediction
        primary = predictions[0]

        # Alternative predictions
        alternatives = predictions[1:] if len(predictions) > 1 else []

        result = {
            'primary_category': primary['category'],
            'confidence': primary['confidence'],
            'probability': primary['probability'],
            'alternative_categories': alternatives,
            'requires_review': primary['probability'] < 0.5  # Flag for doctor review if low confidence
        }

        return result

    def save_model(self, save_path: str):
        """Save trained model and vectorizer"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        os.makedirs(save_path, exist_ok=True)

        # Save vectorizer
        joblib.dump(self.vectorizer, os.path.join(save_path, 'vectorizer.pkl'))

        # Save model
        joblib.dump(self.model, os.path.join(save_path, 'model.pkl'))

        # Save categories
        with open(os.path.join(save_path, 'categories.json'), 'w', encoding='utf-8') as f:
            json.dump({'categories': self.categories}, f, ensure_ascii=False, indent=2)

        print(f"Model saved to {save_path}")

    def load_model(self, model_path: str):
        """Load trained model from disk"""
        try:
            self.vectorizer = joblib.load(os.path.join(model_path, 'vectorizer.pkl'))
            self.model = joblib.load(os.path.join(model_path, 'model.pkl'))

            with open(os.path.join(model_path, 'categories.json'), 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.categories = data['categories']

            self.is_trained = True
            print(f"Model loaded from {model_path}")

        except Exception as e:
            print(f"Error loading model: {e}")
            raise


# Training script
def train_model(dataset_path: str, save_path: str = None) -> SymptomClassifier:
    """
    Train and save classifier model

    Args:
        dataset_path: Path to symptoms_dataset.csv
        save_path: Path to save trained model

    Returns:
        Trained classifier
    """
    classifier = SymptomClassifier()
    metrics = classifier.train(dataset_path)

    if save_path:
        classifier.save_model(save_path)

    return classifier


if __name__ == "__main__":
    # Training example
    current_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(current_dir, '../data/symptoms_dataset.csv')
    model_save_path = os.path.join(current_dir, '../data/trained_model')

    print("Training classifier...")
    classifier = train_model(dataset_path, model_save_path)

    # Test prediction
    test_complaint = "saya merasa nyeri dada yang menjalar ke lengan dan sesak napas"
    result = classifier.predict_with_details(test_complaint)

    print("\nTest Prediction:")
    print(f"Input: {test_complaint}")
    print(f"Category: {result['primary_category']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Probability: {result['probability']:.3f}")
