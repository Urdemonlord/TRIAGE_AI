"""
Prepare larger dataset from DATABASE/dataset folder
Convert disease-symptom format to complaint format for training
"""

import pandas as pd
import os
import random
from collections import defaultdict

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'DATABASE', 'dataset')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'app', 'data')

# Load datasets
print("Loading datasets...")
df_main = pd.read_csv(os.path.join(DATASET_DIR, 'dataset.csv'))
df_desc = pd.read_csv(os.path.join(DATASET_DIR, 'symptom_Description.csv'))
df_severity = pd.read_csv(os.path.join(DATASET_DIR, 'Symptom-severity.csv'))

print(f"Main dataset: {len(df_main)} rows")
print(f"Diseases with descriptions: {len(df_desc)}")
print(f"Symptoms with severity: {len(df_severity)}")

# Create severity mapping
severity_map = dict(zip(df_severity['Symptom'], df_severity['weight']))

# Template sentences in Indonesian for complaint generation
COMPLAINT_TEMPLATES = [
    "Saya mengalami {symptoms}",
    "Saya merasa {symptoms}",
    "Saya menderita {symptoms}",
    "Saya merasakan {symptoms}",
    "Keluhan saya adalah {symptoms}",
    "Saya punya gejala {symptoms}",
]

# Symptom translation map (English to Indonesian - common symptoms)
SYMPTOM_TRANSLATION = {
    # Common symptoms
    'itching': 'gatal',
    'skin_rash': 'ruam kulit',
    'nodal_skin_eruptions': 'bintik kulit',
    'continuous_sneezing': 'bersin terus-menerus',
    'shivering': 'menggigil',
    'chills': 'meriang',
    'joint_pain': 'nyeri sendi',
    'stomach_pain': 'sakit perut',
    'acidity': 'asam lambung',
    'vomiting': 'muntah',
    'fatigue': 'lemas',
    'weight_loss': 'berat badan turun',
    'restlessness': 'gelisah',
    'lethargy': 'lesu',
    'cough': 'batuk',
    'high_fever': 'demam tinggi',
    'sunken_eyes': 'mata cekung',
    'breathlessness': 'sesak napas',
    'sweating': 'berkeringat',
    'dehydration': 'dehidrasi',
    'indigestion': 'gangguan pencernaan',
    'headache': 'sakit kepala',
    'yellowish_skin': 'kulit kuning',
    'dark_urine': 'urin gelap',
    'nausea': 'mual',
    'loss_of_appetite': 'hilang nafsu makan',
    'abdominal_pain': 'nyeri perut',
    'diarrhoea': 'diare',
    'mild_fever': 'demam ringan',
    'yellow_urine': 'urin kuning',
    'yellowing_of_eyes': 'mata kuning',
    'chest_pain': 'nyeri dada',
    'weakness': 'lemah',
    'muscle_weakness': 'otot lemah',
    'anxiety': 'cemas',
    'cold_hands_and_feets': 'tangan dan kaki dingin',
    'mood_swings': 'perubahan mood',
    'weight_gain': 'berat badan naik',
    'restlessness': 'gelisah',
    'irregular_sugar_level': 'gula darah tidak stabil',
    'blurred_and_distorted_vision': 'penglihatan kabur',
    'dizziness': 'pusing',
    'loss_of_balance': 'kehilangan keseimbangan',
    'lack_of_concentration': 'sulit konsentrasi',
    'stiff_neck': 'leher kaku',
    'depression': 'depresi',
    'irritability': 'mudah marah',
    'muscle_pain': 'nyeri otot',
    'back_pain': 'sakit pinggang',
    'neck_pain': 'nyeri leher',
    'weakness_in_limbs': 'lemah pada anggota badan',
    'dizziness': 'pusing',
    'loss_of_balance': 'kehilangan keseimbangan',
    'unsteadiness': 'tidak stabil',
    'weakness_of_one_body_side': 'lemah satu sisi tubuh',
    'loss_of_smell': 'hilang penciuman',
    'bladder_discomfort': 'ketidaknyamanan kandung kemih',
    'continuous_feel_of_urine': 'rasa ingin buang air kecil terus',
    'passage_of_gases': 'perut kembung',
    'internal_itching': 'gatal dalam',
    'toxic_look_(typhos)': 'tampak sakit (tifus)',
    'constipation': 'sembelit',
    'burning_micturition': 'nyeri saat buang air kecil',
    'spotting_ urination': 'bercak saat buang air kecil',
    'foul_smell_of urine': 'bau urin tidak sedap',
    'swelling_joints': 'sendi bengkak',
    'blackheads': 'komedo',
    'scurring': 'bekas luka',
    'skin_peeling': 'kulit mengelupas',
    'silver_like_dusting': 'kulit bersisik',
    'small_dents_in_nails': 'kuku berlubang kecil',
    'inflammatory_nails': 'kuku meradang',
    'blister': 'lepuh',
    'red_sore_around_nose': 'luka merah di sekitar hidung',
    'yellow_crust_ooze': 'kerak kuning',
    'prognosis': 'prognosis',
    'fast_heart_rate': 'jantung berdetak cepat',
    'rusty_sputum': 'dahak berkarat',
    'pain_during_bowel_movements': 'nyeri saat buang air besar',
    'pain_in_anal_region': 'nyeri di area anus',
    'bloody_stool': 'tinja berdarah',
    'irritation_in_anus': 'iritasi di anus',
}

def translate_symptom(symptom: str) -> str:
    """Translate English symptom to Indonesian"""
    # Clean symptom
    symptom = symptom.strip().replace('_', ' ').lower()

    # Try direct translation
    if symptom.replace(' ', '_') in SYMPTOM_TRANSLATION:
        return SYMPTOM_TRANSLATION[symptom.replace(' ', '_')]

    # Return cleaned version if no translation
    return symptom.replace('_', ' ')


def calculate_urgency(symptoms: list) -> str:
    """Calculate urgency based on symptom severity and critical keywords"""
    if not symptoms:
        return 'Green'

    # Critical symptoms that always mean Red
    critical_symptoms = [
        'chest_pain', 'breathlessness', 'fast_heart_rate', 'weakness_of_one_body_side',
        'altered_sensorium', 'coma', 'bloody_stool', 'yellowing_of_eyes',
        'acute_liver_failure', 'swelling_of_stomach', 'distention_of_abdomen',
        'severe_headache', 'dizziness', 'loss_of_balance', 'unsteadiness',
        'seizure', 'high_fever', 'toxic_look_(typhos)', 'belly_pain'
    ]

    # Warning symptoms that suggest Yellow
    warning_symptoms = [
        'vomiting', 'burning_micturition', 'spotting_urination',
        'continuous_sneezing', 'shivering', 'chills', 'joint_pain',
        'stomach_pain', 'dehydration', 'headache', 'back_pain',
        'weakness', 'blurred_and_distorted_vision'
    ]

    # Check for critical symptoms
    for symptom in symptoms:
        symptom_clean = symptom.replace(' ', '_').lower()
        if any(crit in symptom_clean for crit in critical_symptoms):
            return 'Red'

    # Calculate severity scores
    severities = [severity_map.get(s.replace(' ', '_'), 1) for s in symptoms if s]
    max_severity = max(severities) if severities else 1
    avg_severity = sum(severities) / len(severities) if severities else 1

    # Check for warning symptoms
    has_warning = any(
        any(warn in s.replace(' ', '_').lower() for warn in warning_symptoms)
        for s in symptoms
    )

    # Determine urgency
    if max_severity >= 7:  # Highest severity
        return 'Red'
    elif max_severity >= 6 or avg_severity >= 5:
        return 'Yellow'
    elif max_severity >= 5 or avg_severity >= 4 or has_warning:
        return 'Yellow'
    else:
        return 'Green'


def map_disease_to_category(disease: str) -> str:
    """Map disease name to medical category"""
    disease_lower = disease.lower()

    category_keywords = {
        'Kardiovaskular': ['heart', 'cardiac', 'hypertension', 'varicose'],
        'Respirasi': ['bronchial', 'asthma', 'pneumonia', 'tuberculosis', 'common cold', 'allergy'],
        'Gastrointestinal': ['gastro', 'ulcer', 'gerd', 'hepatitis', 'jaundice', 'peptic', 'chronic cholestasis'],
        'Neurologi': ['migraine', 'vertigo', 'paralysis', 'cervical spondylosis'],
        'Dermatologi': ['fungal', 'acne', 'psoriasis', 'impetigo', 'urticaria'],
        'Endokrin': ['diabetes', 'hyperthyroidism', 'hypothyroidism', 'hypoglycemia'],
        'Muskuloskeletal': ['arthritis', 'osteoarthritis', 'spondylosis'],
        'Infeksi': ['malaria', 'dengue', 'typhoid', 'chicken pox', 'hepatitis', 'aids', 'tuberculosis'],
        'Urologi': ['urinary tract infection', 'kidney', 'dimorphic hemmorhoids'],
        'Ginekologi': ['(vertigo) paroymsal  positional vertigo'],
    }

    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in disease_lower:
                return category

    return 'Umum'


def generate_complaint_text(symptoms: list) -> str:
    """Generate natural language complaint from symptoms"""
    if not symptoms or len(symptoms) == 0:
        return ""

    # Filter out empty symptoms
    valid_symptoms = [s for s in symptoms if s and s.strip()]

    if not valid_symptoms:
        return ""

    # Translate symptoms
    translated = [translate_symptom(s) for s in valid_symptoms[:4]]  # Max 4 symptoms

    # Join symptoms
    if len(translated) == 1:
        symptoms_text = translated[0]
    elif len(translated) == 2:
        symptoms_text = f"{translated[0]} dan {translated[1]}"
    else:
        symptoms_text = ', '.join(translated[:-1]) + f", dan {translated[-1]}"

    # Choose random template
    template = random.choice(COMPLAINT_TEMPLATES)

    return template.format(symptoms=symptoms_text)


# Process dataset
print("\nProcessing dataset...")
processed_data = []

for idx, row in df_main.iterrows():
    disease = row['Disease']

    # Get symptoms (columns 1-17)
    symptom_cols = [f'Symptom_{i}' for i in range(1, 18)]
    symptoms = [row[col] for col in symptom_cols if pd.notna(row[col]) and row[col].strip()]

    if not symptoms:
        continue

    # Generate complaint
    complaint = generate_complaint_text(symptoms)

    if not complaint:
        continue

    # Map to category
    category = map_disease_to_category(disease)

    # Calculate urgency
    urgency = calculate_urgency(symptoms)

    # Create red flags (simplified)
    red_flags = ""
    if urgency == 'Red':
        high_severity_symptoms = [s for s in symptoms if severity_map.get(s.replace(' ', '_'), 0) >= 5]
        if high_severity_symptoms:
            red_flags = ', '.join([translate_symptom(s) for s in high_severity_symptoms[:2]])

    # Format symptoms list
    symptoms_list = ', '.join([translate_symptom(s) for s in symptoms[:5]])

    processed_data.append({
        'complaint': complaint,
        'symptoms': symptoms_list,
        'category': category,
        'urgency': urgency,
        'red_flags': red_flags
    })

# Create DataFrame
df_processed = pd.DataFrame(processed_data)

# Remove duplicates
df_processed = df_processed.drop_duplicates(subset=['complaint'])

print(f"\nProcessed {len(df_processed)} unique complaints")
print(f"\nCategory distribution:")
print(df_processed['category'].value_counts())
print(f"\nUrgency distribution:")
print(df_processed['urgency'].value_counts())

# Save to CSV
output_path = os.path.join(OUTPUT_DIR, 'symptoms_dataset_large.csv')
df_processed.to_csv(output_path, index=False)

print(f"\n[SUCCESS] Dataset saved to: {output_path}")
print(f"  Total samples: {len(df_processed)}")
print(f"  Ready for training!")

# Create a summary
print("\n" + "="*60)
print("DATASET SUMMARY")
print("="*60)
print(f"Original dataset: {len(df_main)} rows")
print(f"Processed dataset: {len(df_processed)} unique complaints")
print(f"Categories: {df_processed['category'].nunique()}")
print(f"Average symptoms per complaint: {df_processed['symptoms'].str.split(',').str.len().mean():.1f}")
print("="*60)
