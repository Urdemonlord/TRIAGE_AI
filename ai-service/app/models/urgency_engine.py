"""
Rule-based Urgency Detection Engine
Detects red flags and determines urgency level (Green/Yellow/Red)
"""

import json
import os
from typing import List, Dict, Tuple
import re


class UrgencyEngine:
    """Rule-based engine for detecting medical urgency"""

    def __init__(self, rules_path: str = None):
        """
        Initialize urgency engine with red flag rules

        Args:
            rules_path: Path to red_flags_rules.json
        """
        if rules_path is None:
            # Default path
            current_dir = os.path.dirname(__file__)
            rules_path = os.path.join(current_dir, '../data/red_flags_rules.json')

        self.rules = self._load_rules(rules_path)

        # Extract keywords by urgency level for quick matching
        self.red_keywords = self._extract_keywords(self.rules.get('critical_red_flags', []))
        self.yellow_keywords = self._extract_keywords(self.rules.get('warning_yellow_flags', []))
        self.green_keywords = self._extract_keywords(self.rules.get('green_flags', []))

    def _load_rules(self, rules_path: str) -> Dict:
        """Load red flag rules from JSON file"""
        try:
            with open(rules_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Rules file not found at {rules_path}")
            return {
                'critical_red_flags': [],
                'warning_yellow_flags': [],
                'green_flags': []
            }

    def _extract_keywords(self, flag_list: List[Dict]) -> List[Tuple[List[str], str, str]]:
        """Extract keywords from flag rules"""
        keywords = []
        for flag in flag_list:
            keywords.append((
                flag['keywords'],
                flag['reason'],
                flag['action']
            ))
        return keywords

    def detect_red_flags(self, text: str, numeric_data: Dict = None) -> List[Dict]:
        """
        Detect red flags in complaint text

        Args:
            text: Preprocessed complaint text
            numeric_data: Extracted numeric health data (temp, BP, etc.)

        Returns:
            List of detected red flags with details
        """
        text_lower = text.lower()
        detected_flags = []

        # Check critical red flags
        for keywords, reason, action in self.red_keywords:
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    detected_flags.append({
                        'urgency': 'Red',
                        'keyword': keyword,
                        'reason': reason,
                        'action': action,
                        'severity': 'Critical'
                    })
                    break  # One match per rule is enough

        # Check warning yellow flags
        if not detected_flags:  # Only check yellow if no red flags
            for keywords, reason, action in self.yellow_keywords:
                for keyword in keywords:
                    if keyword.lower() in text_lower:
                        detected_flags.append({
                            'urgency': 'Yellow',
                            'keyword': keyword,
                            'reason': reason,
                            'action': action,
                            'severity': 'Warning'
                        })
                        break

        # Check numeric data for additional red flags
        if numeric_data:
            numeric_flags = self._check_numeric_thresholds(numeric_data)
            detected_flags.extend(numeric_flags)

        return detected_flags

    def _check_numeric_thresholds(self, numeric_data: Dict) -> List[Dict]:
        """Check numeric health data against thresholds"""
        flags = []

        # Temperature thresholds
        if numeric_data.get('temperature'):
            temp = numeric_data['temperature']
            if temp >= 39.5:
                flags.append({
                    'urgency': 'Red',
                    'keyword': f'demam tinggi ({temp}°C)',
                    'reason': 'Demam sangat tinggi, risiko kejang/komplikasi',
                    'action': 'Segera ke IGD',
                    'severity': 'Critical'
                })
            elif temp >= 38.5:
                flags.append({
                    'urgency': 'Yellow',
                    'keyword': f'demam tinggi ({temp}°C)',
                    'reason': 'Demam tinggi perlu evaluasi',
                    'action': 'Konsultasi dokter dalam 24 jam',
                    'severity': 'Warning'
                })

        # Blood pressure thresholds
        if numeric_data.get('blood_pressure'):
            bp = numeric_data['blood_pressure']
            systolic = bp.get('systolic', 0)
            diastolic = bp.get('diastolic', 0)

            if systolic >= 180 or diastolic >= 120:
                flags.append({
                    'urgency': 'Red',
                    'keyword': f'hipertensi emergency ({systolic}/{diastolic})',
                    'reason': 'Krisis hipertensi',
                    'action': 'Segera ke IGD',
                    'severity': 'Critical'
                })
            elif systolic >= 160 or diastolic >= 100:
                flags.append({
                    'urgency': 'Yellow',
                    'keyword': f'hipertensi tinggi ({systolic}/{diastolic})',
                    'reason': 'Tekanan darah tinggi perlu evaluasi',
                    'action': 'Konsultasi dokter segera',
                    'severity': 'Warning'
                })

        # Duration thresholds
        if numeric_data.get('duration_days'):
            days = numeric_data['duration_days']
            if days >= 14:
                flags.append({
                    'urgency': 'Yellow',
                    'keyword': f'gejala berkepanjangan ({days} hari)',
                    'reason': 'Gejala kronis perlu evaluasi medis',
                    'action': 'Konsultasi dokter',
                    'severity': 'Warning'
                })

        return flags

    def calculate_urgency_score(self, detected_flags: List[Dict]) -> Tuple[str, int, Dict]:
        """
        Calculate overall urgency level based on detected flags

        Args:
            detected_flags: List of detected red/yellow flags

        Returns:
            Tuple of (urgency_level, urgency_score, details)
        """
        if not detected_flags:
            return 'Green', 0, {
                'urgency': 'Green',
                'description': 'Gejala ringan / non-urgent',
                'recommendation': 'Istirahat dan observasi. Konsultasi dokter jika memburuk.',
                'red_flags_count': 0,
                'yellow_flags_count': 0
            }

        # Count severity
        red_count = sum(1 for flag in detected_flags if flag['urgency'] == 'Red')
        yellow_count = sum(1 for flag in detected_flags if flag['urgency'] == 'Yellow')

        # Determine overall urgency
        if red_count > 0:
            urgency = 'Red'
            score = 90 + min(red_count * 5, 10)  # 90-100
            description = 'URGENT - Memerlukan penanganan medis segera'
            recommendation = 'Segera ke IGD atau hubungi ambulans (119)'
        elif yellow_count >= 2:
            urgency = 'Red'
            score = 80 + yellow_count * 2  # Multiple yellow = escalate to red
            description = 'URGENT - Kombinasi gejala memerlukan evaluasi segera'
            recommendation = 'Segera ke dokter atau IGD'
        elif yellow_count > 0:
            urgency = 'Yellow'
            score = 50 + yellow_count * 10
            description = 'Perlu perhatian medis'
            recommendation = 'Konsultasi dokter dalam 24 jam'
        else:
            urgency = 'Green'
            score = 20
            description = 'Gejala ringan'
            recommendation = 'Istirahat dan observasi'

        return urgency, score, {
            'urgency': urgency,
            'score': score,
            'description': description,
            'recommendation': recommendation,
            'red_flags_count': red_count,
            'yellow_flags_count': yellow_count
        }

    def analyze_urgency(self, complaint_text: str, numeric_data: Dict = None) -> Dict:
        """
        Main method to analyze urgency of a medical complaint

        Args:
            complaint_text: Preprocessed complaint text
            numeric_data: Optional extracted numeric health data

        Returns:
            Complete urgency analysis with flags and recommendations
        """
        # Detect red flags
        detected_flags = self.detect_red_flags(complaint_text, numeric_data)

        # Calculate urgency score
        urgency, score, details = self.calculate_urgency_score(detected_flags)

        # Prepare result
        result = {
            'urgency_level': urgency,
            'urgency_score': score,
            'description': details['description'],
            'recommendation': details['recommendation'],
            'detected_flags': detected_flags,
            'flags_summary': {
                'total': len(detected_flags),
                'red': details['red_flags_count'],
                'yellow': details['yellow_flags_count']
            }
        }

        return result


# Singleton instance
urgency_engine = UrgencyEngine()


# Helper function for easy import
def analyze_urgency(complaint_text: str, numeric_data: Dict = None) -> Dict:
    """Analyze urgency of medical complaint"""
    return urgency_engine.analyze_urgency(complaint_text, numeric_data)
