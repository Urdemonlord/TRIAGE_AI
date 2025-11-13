"""
IMPROVED Dataset Preparation with Better Category Mapping
Uses symptom_Description.csv for accurate disease categorization
"""

import pandas as pd
import os
import random
from collections import defaultdict

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'DATABASE', 'dataset')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'app', 'data')

print("[*] Loading datasets...")
df_main = pd.read_csv(os.path.join(DATASET_DIR, 'dataset.csv'))
df_desc = pd.read_csv(os.path.join(DATASET_DIR, 'symptom_Description.csv'))
df_severity = pd.read_csv(os.path.join(DATASET_DIR, 'Symptom-severity.csv'))

print(f"    Main: {len(df_main)} rows")
print(f"    Descriptions: {len(df_desc)} diseases")
print(f"    Severity: {len(df_severity)} symptoms\n")

# Create severity mapping
severity_map = dict(zip(df_severity['Symptom'], df_severity['weight']))

# IMPROVED symptom translation with medical accuracy
SYMPTOM_TRANSLATION = {
    # Respiratory
    'cough': 'batuk',
    'breathlessness': 'sesak napas',
    'rusty_sputum': 'dahak kemerahan',
    'continuous_sneezing': 'bersin terus-menerus',
    'runny_nose': 'pilek',
    'congestion': 'hidung tersumbat',
    'sinus_pressure': 'tekanan sinus',
    'loss_of_smell': 'hilang penciuman',
    'phlegm': 'dahak',
    'throat_irritation': 'tenggorokan gatal',

    # Cardiovascular
    'chest_pain': 'nyeri dada',
    'fast_heart_rate': 'jantung berdetak cepat',
    'palpitations': 'jantung berdebar',
    'irregular_sugar_level': 'gula darah tidak stabil',
    'prominent_veins_on_calf': 'pembuluh darah menonjol',
    'swollen_legs': 'kaki bengkak',
    'swollen_blood_vessels': 'pembuluh darah bengkak',
    'puffy_face_and_eyes': 'wajah dan mata bengkak',

    # Gastrointestinal
    'stomach_pain': 'sakit perut',
    'acidity': 'asam lambung',
    'vomiting': 'muntah',
    'nausea': 'mual',
    'diarrhoea': 'diare',
    'constipation': 'sembelit',
    'abdominal_pain': 'nyeri perut',
    'stomach_bleeding': 'pendarahan lambung',
    'distention_of_abdomen': 'perut kembung',
    'loss_of_appetite': 'hilang nafsu makan',
    'indigestion': 'gangguan pencernaan',
    'passage_of_gases': 'perut kembung',
    'belly_pain': 'sakit perut',
    'pain_during_bowel_movements': 'nyeri saat BAB',
    'bloody_stool': 'tinja berdarah',

    # Neurological
    'headache': 'sakit kepala',
    'dizziness': 'pusing',
    'loss_of_balance': 'kehilangan keseimbangan',
    'lack_of_concentration': 'sulit konsentrasi',
    'stiff_neck': 'leher kaku',
    'unsteadiness': 'tidak stabil',
    'weakness_of_one_body_side': 'lemah satu sisi tubuh',
    'altered_sensorium': 'penurunan kesadaran',
    'visual_disturbances': 'gangguan penglihatan',
    'spinning_movements': 'pusing berputar',
    'slurred_speech': 'bicara pelo',
    'loss_of_smell': 'hilang penciuman',

    # Dermatological
    'itching': 'gatal',
    'skin_rash': 'ruam kulit',
    'nodal_skin_eruptions': 'bintik kulit',
    'dischromic_patches': 'bercak kulit',
    'blackheads': 'komedo',
    'scurring': 'bekas luka',
    'skin_peeling': 'kulit mengelupas',
    'silver_like_dusting': 'kulit bersisik',
    'small_dents_in_nails': 'kuku berlubang',
    'inflammatory_nails': 'kuku meradang',
    'blister': 'lepuh',
    'red_sore_around_nose': 'luka merah hidung',
    'yellow_crust_ooze': 'kerak kuning',
    'pus_filled_pimples': 'jerawat bernanah',

    # Endocrine/Metabolic
    'weight_loss': 'berat badan turun',
    'weight_gain': 'berat badan naik',
    'excessive_hunger': 'sangat lapar',
    'increased_appetite': 'nafsu makan meningkat',
    'polyuria': 'sering buang air kecil',
    'dehydration': 'dehidrasi',
    'increased_appetite': 'nafsu makan tinggi',
    'lethargy': 'lesu',
    'patches_in_throat': 'bercak tenggorokan',
    'obesity': 'obesitas',

    # Musculoskeletal
    'joint_pain': 'nyeri sendi',
    'muscle_weakness': 'otot lemah',
    'muscle_pain': 'nyeri otot',
    'back_pain': 'sakit pinggang',
    'neck_pain': 'nyeri leher',
    'knee_pain': 'nyeri lutut',
    'hip_joint_pain': 'nyeri pinggul',
    'muscle_wasting': 'otot mengecil',
    'swelling_joints': 'sendi bengkak',
    'movement_stiffness': 'kaku bergerak',
    'painful_walking': 'nyeri saat jalan',

    # Urological
    'burning_micturition': 'nyeri saat buang air kecil',
    'spotting_urination': 'bercak saat BAK',
    'continuous_feel_of_urine': 'ingin BAK terus',
    'bladder_discomfort': 'tidak nyaman kandung kemih',
    'foul_smell_of_urine': 'bau urin tidak sedap',
    'dark_urine': 'urin gelap',
    'yellow_urine': 'urin kuning',

    # General symptoms
    'high_fever': 'demam tinggi',
    'mild_fever': 'demam ringan',
    'fatigue': 'lemas',
    'weakness': 'lemah',
    'restlessness': 'gelisah',
    'chills': 'meriang',
    'shivering': 'menggigil',
    'sweating': 'berkeringat',
    'cold_hands_and_feets': 'tangan kaki dingin',
    'anxiety': 'cemas',
    'depression': 'depresi',
    'irritability': 'mudah marah',
    'mood_swings': 'perubahan mood',
    'coma': 'tidak sadarkan diri',

    # Liver/Hepatic
    'yellowish_skin': 'kulit kuning',
    'yellowing_of_eyes': 'mata kuning',
    'acute_liver_failure': 'gagal hati akut',
    'swelling_of_stomach': 'perut bengkak',
    'fluid_overload': 'kelebihan cairan',
    'malaise': 'tidak enak badan',

    # Infectious
    'toxic_look_(typhos)': 'tampak sakit berat',
    'mild_fever': 'demam ringan',
    'red_spots_over_body': 'bintik merah',
    'watering_from_eyes': 'mata berair',
    'sunken_eyes': 'mata cekung',
}

def translate_symptom(symptom: str) -> str:
    """Improved symptom translation"""
    symptom_clean = symptom.strip().replace(' ', '_').lower()
    return SYMPTOM_TRANSLATION.get(symptom_clean, symptom.replace('_', ' '))

# IMPROVED disease to category mapping using descriptions
def map_disease_to_category_improved(disease: str, description: str = "") -> str:
    """
    Improved category mapping using disease name + description
    """
    disease_lower = disease.lower()
    desc_lower = description.lower() if description else ""
    combined = f"{disease_lower} {desc_lower}"

    # Cardiovascular - heart, blood vessels, circulation
    if any(kw in combined for kw in [
        'heart', 'cardiac', 'hypertension', 'varicose', 'blood pressure',
        'artery', 'circulation', 'angina', 'myocardial'
    ]):
        return 'Kardiovaskular'

    # Respiratory - lungs, breathing
    if any(kw in combined for kw in [
        'bronchial', 'asthma', 'pneumonia', 'tuberculosis', 'lung',
        'respiratory', 'breathing', 'common cold', 'allergy', 'cough'
    ]):
        return 'Respirasi'

    # Gastrointestinal - stomach, intestines, digestion
    if any(kw in combined for kw in [
        'gastro', 'ulcer', 'gerd', 'peptic', 'stomach', 'intestin',
        'digest', 'bowel', 'diarr', 'constipat', 'hemorrhoid'
    ]):
        return 'Gastrointestinal'

    # Neurological - brain, nerves, nervous system
    if any(kw in combined for kw in [
        'migraine', 'vertigo', 'paralysis', 'cervical spondylosis',
        'brain', 'nerve', 'neurolog', 'seizure', 'stroke', 'paralys'
    ]):
        return 'Neurologi'

    # Dermatologi - skin
    if any(kw in combined for kw in [
        'fungal', 'acne', 'psoriasis', 'impetigo', 'urticaria',
        'skin', 'dermat', 'rash', 'itch'
    ]):
        return 'Dermatologi'

    # Endokrin - hormones, metabolism
    if any(kw in combined for kw in [
        'diabetes', 'hyperthyroid', 'hypothyroid', 'hypoglycemia',
        'thyroid', 'hormone', 'metabol', 'endocrin'
    ]):
        return 'Endokrin'

    # Muskuloskeletal - bones, joints, muscles
    if any(kw in combined for kw in [
        'arthritis', 'osteoarthritis', 'spondylosis', 'joint',
        'bone', 'muscle', 'skeletal'
    ]):
        return 'Muskuloskeletal'

    # Infeksi - infections
    if any(kw in combined for kw in [
        'malaria', 'dengue', 'typhoid', 'chicken pox', 'aids',
        'hepatitis', 'infection', 'virus', 'bacteria', 'fever'
    ]):
        return 'Infeksi'

    # Urologi - urinary system
    if any(kw in combined for kw in [
        'urinary tract infection', 'kidney', 'bladder', 'urin'
    ]):
        return 'Urologi'

    # Ginekologi
    if any(kw in combined for kw in [
        'pregnan', 'menstrua', 'gynecolog', 'uterus'
    ]):
        return 'Ginekologi'

    return 'Umum'

# Create disease description mapping
disease_desc_map = dict(zip(df_desc['Disease'], df_desc['Description']))

def calculate_urgency(symptoms: list) -> str:
    """Improved urgency calculation"""
    if not symptoms:
        return 'Green'

    critical_symptoms = [
        'chest_pain', 'breathlessness', 'fast_heart_rate', 'weakness_of_one_body_side',
        'altered_sensorium', 'coma', 'bloody_stool', 'yellowing_of_eyes',
        'acute_liver_failure', 'swelling_of_stomach', 'distention_of_abdomen'
    ]

    # Check for critical symptoms
    for symptom in symptoms:
        symptom_clean = symptom.replace(' ', '_').lower()
        if any(crit in symptom_clean for crit in critical_symptoms):
            return 'Red'

    severities = [severity_map.get(s.replace(' ', '_'), 1) for s in symptoms if s]
    max_severity = max(severities) if severities else 1
    avg_severity = sum(severities) / len(severities) if severities else 1

    # Warning symptoms
    warning_symptoms = [
        'vomiting', 'burning_micturition', 'stomach_pain', 'high_fever',
        'dehydration', 'headache', 'weakness', 'dizziness'
    ]
    has_warning = any(
        any(warn in s.replace(' ', '_').lower() for warn in warning_symptoms)
        for s in symptoms
    )

    if max_severity >= 7 or avg_severity >= 5:
        return 'Red'
    elif max_severity >= 6 or avg_severity >= 4.5:
        return 'Yellow'
    elif max_severity >= 5 or avg_severity >= 3.5 or has_warning:
        return 'Yellow'
    else:
        return 'Green'

def generate_complaint_text(symptoms: list) -> str:
    """Generate natural complaint"""
    templates = [
        "Saya mengalami {symptoms}",
        "Saya merasa {symptoms}",
        "Keluhan saya adalah {symptoms}",
        "Saya menderita {symptoms}",
    ]

    if not symptoms or len(symptoms) == 0:
        return ""

    valid_symptoms = [s for s in symptoms if s and s.strip()]
    if not valid_symptoms:
        return ""

    translated = [translate_symptom(s) for s in valid_symptoms[:4]]

    if len(translated) == 1:
        symptoms_text = translated[0]
    elif len(translated) == 2:
        symptoms_text = f"{translated[0]} dan {translated[1]}"
    else:
        symptoms_text = ', '.join(translated[:-1]) + f", dan {translated[-1]}"

    template = random.choice(templates)
    return template.format(symptoms=symptoms_text)

# Process dataset
print("[*] Processing dataset with improved mapping...")
processed_data = []

for idx, row in df_main.iterrows():
    disease = row['Disease']

    symptom_cols = [f'Symptom_{i}' for i in range(1, 18)]
    symptoms = [row[col] for col in symptom_cols if pd.notna(row[col]) and row[col].strip()]

    if not symptoms:
        continue

    complaint = generate_complaint_text(symptoms)
    if not complaint:
        continue

    # Use description for better categorization
    description = disease_desc_map.get(disease, "")
    category = map_disease_to_category_improved(disease, description)

    urgency = calculate_urgency(symptoms)

    red_flags = ""
    if urgency == 'Red':
        high_severity_symptoms = [s for s in symptoms if severity_map.get(s.replace(' ', '_'), 0) >= 5]
        if high_severity_symptoms:
            red_flags = ', '.join([translate_symptom(s) for s in high_severity_symptoms[:2]])

    symptoms_list = ', '.join([translate_symptom(s) for s in symptoms[:5]])

    processed_data.append({
        'complaint': complaint,
        'symptoms': symptoms_list,
        'category': category,
        'urgency': urgency,
        'red_flags': red_flags,
        'disease': disease
    })

df_processed = pd.DataFrame(processed_data)
df_processed = df_processed.drop_duplicates(subset=['complaint'])

print(f"\n[+] Processed {len(df_processed)} unique complaints\n")
print("Category distribution:")
print(df_processed['category'].value_counts())
print(f"\nUrgency distribution:")
print(df_processed['urgency'].value_counts())

# Save
output_path = os.path.join(OUTPUT_DIR, 'symptoms_dataset_improved.csv')
df_processed.to_csv(output_path, index=False)

print(f"\n[SUCCESS] Improved dataset saved to:")
print(f"  {output_path}")
print(f"  Total: {len(df_processed)} samples")
print(f"  Categories: {df_processed['category'].nunique()}")
print(f"  Ready for training!\n")
