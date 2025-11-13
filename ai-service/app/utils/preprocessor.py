"""
Text Preprocessor untuk Bahasa Indonesia
Handles cleaning, normalization, and tokenization of medical complaints
"""

import re
import string
from typing import List, Dict
import unicodedata

class IndonesianPreprocessor:
    """Preprocessor for Indonesian medical text"""

    def __init__(self):
        # Common medical terms normalization
        self.medical_terms_map = {
            # Symptoms
            'pusing': 'pusing',
            'puzing': 'pusing',
            'mumet': 'pusing',
            'demem': 'demam',
            'panas': 'demam',
            'batuk2': 'batuk',
            'batuk-batuk': 'batuk',
            'pilek': 'pilek',
            'meler': 'pilek',
            'sesek': 'sesak napas',
            'sesak': 'sesak napas',
            'napas pendek': 'sesak napas',
            'dada sakit': 'nyeri dada',
            'sakit dada': 'nyeri dada',
            'perut sakit': 'sakit perut',
            'mual2': 'mual',
            'muntah2': 'muntah',
            'mencret': 'diare',
            'diare': 'diare',
            'lemas': 'lemas',
            'capek': 'lemas',
            'lelah': 'lemas',
            'gatel': 'gatal',
            'gatal2': 'gatal',
            'pegel': 'pegal',
            'pegel2': 'pegal',
            'keringetan': 'keringat dingin',

            # Body parts
            'kepala': 'kepala',
            'dada': 'dada',
            'perut': 'perut',
            'tangan': 'tangan',
            'kaki': 'kaki',
            'mata': 'mata',
            'telinga': 'telinga',
            'hidung': 'hidung',
            'tenggorokan': 'tenggorokan',
            'leher': 'leher',
            'punggung': 'punggung',

            # Severity descriptors
            'sangat': 'sangat',
            'sekali': 'sangat',
            'banget': 'sangat',
            'hebat': 'hebat',
            'parah': 'hebat',
            'ringan': 'ringan',
            'sedikit': 'ringan',

            # Time descriptors
            'tiba-tiba': 'tiba-tiba',
            'tiba2': 'tiba-tiba',
            'mendadak': 'tiba-tiba',
            'lama': 'lama',
            'terus': 'terus-menerus',
            'terus-menerus': 'terus-menerus',
            'sering': 'sering',

            # Medical conditions
            'jantung': 'jantung',
            'darah tinggi': 'hipertensi',
            'diabetes': 'diabetes',
            'kencing manis': 'diabetes',
            'asma': 'asma',
            'alergi': 'alergi',
        }

        # Stopwords bahasa Indonesia (minimal set - we want to keep medical context)
        self.stopwords = set([
            'yang', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk',
            'dengan', 'ini', 'itu', 'saya', 'aku', 'adalah',
            'sudah', 'juga', 'atau', 'akan', 'tidak', 'ya'
        ])

    def clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower()

        # Normalize unicode characters
        text = unicodedata.normalize('NFKD', text)

        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)

        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)

        # Remove leading/trailing whitespace
        text = text.strip()

        return text

    def normalize_medical_terms(self, text: str) -> str:
        """Normalize common medical term variations"""
        normalized = text

        # Replace known variations
        for term, standard in self.medical_terms_map.items():
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(term) + r'\b'
            normalized = re.sub(pattern, standard, normalized)

        return normalized

    def remove_punctuation(self, text: str, keep_medical: bool = True) -> str:
        """Remove punctuation but keep medical-relevant ones"""
        if keep_medical:
            # Keep hyphen and slash for medical terms
            translator = str.maketrans('', '', string.punctuation.replace('-', '').replace('/', ''))
        else:
            translator = str.maketrans('', '', string.punctuation)

        return text.translate(translator)

    def tokenize(self, text: str) -> List[str]:
        """Simple whitespace tokenization"""
        return text.split()

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """Remove stopwords but keep medical context"""
        return [token for token in tokens if token not in self.stopwords]

    def extract_numbers(self, text: str) -> Dict[str, any]:
        """Extract numeric values (temperature, blood pressure, etc.)"""
        extracted = {
            'temperature': None,
            'blood_pressure': None,
            'duration_days': None,
            'age': None
        }

        # Temperature (in Celsius)
        temp_pattern = r'(\d{2,3})\s*(?:derajat|°|c|celcius)'
        temp_match = re.search(temp_pattern, text, re.IGNORECASE)
        if temp_match:
            extracted['temperature'] = float(temp_match.group(1))

        # Blood pressure
        bp_pattern = r'(\d{2,3})/(\d{2,3})'
        bp_match = re.search(bp_pattern, text)
        if bp_match:
            extracted['blood_pressure'] = {
                'systolic': int(bp_match.group(1)),
                'diastolic': int(bp_match.group(2))
            }

        # Duration in days
        day_pattern = r'(\d+)\s*(?:hari|hr|day)'
        day_match = re.search(day_pattern, text, re.IGNORECASE)
        if day_match:
            extracted['duration_days'] = int(day_match.group(1))

        # Week pattern
        week_pattern = r'(\d+)\s*(?:minggu|week)'
        week_match = re.search(week_pattern, text, re.IGNORECASE)
        if week_match:
            extracted['duration_days'] = int(week_match.group(1)) * 7

        return extracted

    def preprocess(self, text: str, remove_stops: bool = False) -> Dict[str, any]:
        """Full preprocessing pipeline"""

        # Extract numeric data first (before cleaning)
        numeric_data = self.extract_numbers(text)

        # Clean text
        cleaned = self.clean_text(text)

        # Normalize medical terms
        normalized = self.normalize_medical_terms(cleaned)

        # Remove punctuation
        no_punct = self.remove_punctuation(normalized, keep_medical=True)

        # Tokenize
        tokens = self.tokenize(no_punct)

        # Optionally remove stopwords
        if remove_stops:
            tokens = self.remove_stopwords(tokens)

        # Reconstruct processed text
        processed_text = ' '.join(tokens)

        return {
            'original': text,
            'processed': processed_text,
            'tokens': tokens,
            'numeric_data': numeric_data
        }

    def extract_symptoms(self, text: str) -> List[str]:
        """Extract symptom keywords from text"""
        processed = self.preprocess(text, remove_stops=True)

        # Define symptom keywords
        symptom_keywords = [
            'demam', 'batuk', 'pilek', 'pusing', 'sakit kepala',
            'nyeri dada', 'sesak napas', 'mual', 'muntah', 'diare',
            'sakit perut', 'lemas', 'pegal', 'gatal', 'ruam',
            'keringat dingin', 'menggigil', 'bengkak', 'kejang',
            'pingsan', 'berdarah', 'mata kuning', 'leher kaku'
        ]

        found_symptoms = []
        tokens = processed['tokens']
        text_lower = processed['processed']

        for symptom in symptom_keywords:
            if symptom in text_lower:
                found_symptoms.append(symptom)

        return list(set(found_symptoms))


# Singleton instance
preprocessor = IndonesianPreprocessor()


# Helper functions for easy import
def preprocess_text(text: str, remove_stopwords: bool = False) -> Dict[str, any]:
    """Preprocess Indonesian medical text"""
    return preprocessor.preprocess(text, remove_stops=remove_stopwords)


def extract_symptoms(text: str) -> List[str]:
    """Extract symptoms from text"""
    return preprocessor.extract_symptoms(text)


def extract_numeric_data(text: str) -> Dict[str, any]:
    """Extract numeric health data from text"""
    return preprocessor.extract_numbers(text)
