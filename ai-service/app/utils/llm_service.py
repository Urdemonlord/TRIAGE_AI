"""
LLM Service for Enhanced Medical Explanations
Uses SumoPod AI (OpenAI-compatible API) with gpt-4o-mini
"""

import os
import hashlib
import time
from typing import Dict, Optional
from openai import OpenAI
from dotenv import load_dotenv
import redis

# Load environment variables
load_dotenv()

class RedisCache:
    def __init__(self, url: str, ttl_seconds: int = 3600, timeout: int = 5):
        self.ttl = ttl_seconds
        self.client = redis.from_url(
            url,
            decode_responses=True,
            socket_timeout=timeout,
            socket_connect_timeout=timeout,
        )

    def _generate_key(self, *args) -> str:
        key_string = "|".join(str(arg) for arg in args)
        return hashlib.md5(key_string.encode()).hexdigest()

    def get(self, *args) -> Optional[str]:
        key = self._generate_key(*args)
        try:
            return self.client.get(key)
        except Exception:
            return None

    def set(self, response: str, *args):
        key = self._generate_key(*args)
        try:
            self.client.setex(key, self.ttl, response)
        except Exception:
            pass

    def size(self) -> int:
        try:
            return self.client.dbsize()
        except Exception:
            return 0

class LLMService:
    """Service for generating AI-powered medical explanations"""

    def __init__(self, cache_ttl: int = 3600, max_retries: int = 3, timeout: int = 30):
        """Initialize OpenAI client with SumoPod AI and caching"""
        self.api_key = os.getenv('LLM_API_KEY', 'sk-JPw3J0m2-1f2FY1XgbMuXw')
        self.base_url = os.getenv('LLM_BASE_URL', 'https://ai.sumopod.com/v1')
        self.model = os.getenv('LLM_MODEL', 'gpt-4o-mini')

        redis_url = os.getenv('REDIS_URL')
        if redis_url:
            self.cache = RedisCache(url=redis_url, ttl_seconds=cache_ttl, timeout=5)
            cache_backend = "Redis"
        else:
            self.cache = RedisCache(url="redis://localhost:6379/0", ttl_seconds=cache_ttl, timeout=5)
            cache_backend = "Redis(local)"

        # Retry and timeout settings
        self.max_retries = max_retries
        self.timeout = timeout
        self.error_count = 0
        self.success_count = 0

        try:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=self.timeout
            )
            self.is_available = True
            print(f"[+] LLM Service initialized: {self.model}")
            print(f"[+] LLM Cache enabled (TTL: {cache_ttl}s, backend: {cache_backend})")
            print(f"[+] LLM Retry enabled (max: {max_retries}, timeout: {timeout}s)")
        except Exception as e:
            print(f"[!] LLM Service initialization failed: {e}")
            self.is_available = False

    def _retry_with_backoff(self, func, *args, **kwargs):
        """Execute function with exponential backoff retry logic"""
        for attempt in range(self.max_retries):
            try:
                result = func(*args, **kwargs)
                self.success_count += 1
                return result
            except Exception as e:
                self.error_count += 1

                if attempt == self.max_retries - 1:
                    # Last attempt failed
                    print(f"[ERROR] LLM call failed after {self.max_retries} attempts: {e}")
                    raise

                # Calculate exponential backoff
                wait_time = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s, 4s...
                print(f"[RETRY] LLM call failed (attempt {attempt + 1}/{self.max_retries}), retrying in {wait_time}s...")
                time.sleep(wait_time)

    def get_stats(self) -> Dict:
        """Get service statistics"""
        return {
            "is_available": self.is_available,
            "cache_size": self.cache.size(),
            "success_count": self.success_count,
            "error_count": self.error_count,
            "success_rate": f"{(self.success_count / (self.success_count + self.error_count) * 100):.1f}%" if (self.success_count + self.error_count) > 0 else "N/A"
        }

    def generate_medical_summary(
        self,
        complaint: str,
        category: str,
        urgency: str,
        symptoms: list,
        red_flags: list = None
    ) -> str:
        """
        Generate a comprehensive medical summary using LLM

        Args:
            complaint: Original patient complaint
            category: Predicted disease category
            urgency: Urgency level (Green/Yellow/Red)
            symptoms: List of detected symptoms
            red_flags: List of detected red flags

        Returns:
            AI-generated medical summary in Indonesian
        """
        if not self.is_available:
            return self._fallback_summary(category, urgency, symptoms)

        # Check cache first
        cache_key_args = (
            "summary",
            complaint,
            category,
            urgency,
            ",".join(symptoms) if symptoms else ""
        )
        cached_response = self.cache.get(*cache_key_args)
        if cached_response:
            return cached_response

        try:
            # Construct prompt
            prompt = self._build_medical_prompt(
                complaint, category, urgency, symptoms, red_flags
            )

            # Define LLM call function
            def make_llm_call():
                return self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "Anda adalah asisten medis AI yang membantu menjelaskan hasil triase kesehatan dalam Bahasa Indonesia. Berikan penjelasan yang jelas, akurat, dan mudah dipahami oleh pasien awam. Selalu tekankan bahwa ini adalah analisis pendukung, bukan diagnosis final."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=300,
                    temperature=0.7
                )

            # Call LLM with retry logic
            response = self._retry_with_backoff(make_llm_call)
            result = response.choices[0].message.content.strip()

            # Cache the response
            self.cache.set(result, *cache_key_args)

            return result

        except Exception as e:
            print(f"[FALLBACK] Using template summary due to LLM error: {e}")
            return self._fallback_summary(category, urgency, symptoms)

    def _build_medical_prompt(
        self,
        complaint: str,
        category: str,
        urgency: str,
        symptoms: list,
        red_flags: list = None
    ) -> str:
        """Build prompt for medical summary generation"""

        urgency_text = {
            'Red': 'URGENT (memerlukan penanganan segera)',
            'Yellow': 'PERLU PERHATIAN (konsultasi dokter dalam 24 jam)',
            'Green': 'RINGAN (observasi dan istirahat)'
        }.get(urgency, urgency)

        prompt = f"""Berdasarkan analisis AI terhadap keluhan pasien, berikan ringkasan medis yang komprehensif:

KELUHAN PASIEN:
"{complaint}"

HASIL ANALISIS:
- Kategori: {category}
- Tingkat Urgensi: {urgency_text}
- Gejala Terdeteksi: {', '.join(symptoms) if symptoms else 'tidak spesifik'}
"""

        if red_flags and len(red_flags) > 0:
            flags_text = '\n'.join([f"  • {flag.get('keyword', 'Unknown')}: {flag.get('reason', '')}"
                                   for flag in red_flags[:3]])
            prompt += f"\n- Red Flags Terdeteksi:\n{flags_text}\n"

        prompt += """
TUGAS:
Berikan ringkasan dalam 2-3 paragraf yang mencakup:
1. Penjelasan kondisi berdasarkan gejala
2. Mengapa tingkat urgensi ini ditetapkan
3. Rekomendasi tindakan yang jelas

Gunakan bahasa yang mudah dipahami, empatik, dan profesional. Akhiri dengan reminder bahwa ini adalah analisis AI pendukung."""

        return prompt

    def _fallback_summary(self, category: str, urgency: str, symptoms: list) -> str:
        """Fallback summary when LLM is unavailable"""
        urgency_desc = {
            'Red': 'Kondisi Anda tergolong URGENT dan memerlukan penanganan medis segera',
            'Yellow': 'Kondisi Anda memerlukan perhatian medis dalam waktu dekat',
            'Green': 'Kondisi Anda tergolong ringan'
        }.get(urgency, 'Kondisi Anda perlu dievaluasi')

        summary = f"{urgency_desc}. Gejala Anda mengarah pada kategori {category}. "

        if symptoms:
            summary += f"Gejala utama yang terdeteksi: {', '.join(symptoms[:3])}. "

        if urgency == 'Red':
            summary += "Segera cari bantuan medis atau pergi ke IGD terdekat."
        elif urgency == 'Yellow':
            summary += "Sebaiknya konsultasi dengan dokter dalam 24 jam untuk evaluasi lebih lanjut."
        else:
            summary += "Istirahat cukup dan monitor perkembangan gejala. Konsultasi dokter jika memburuk."

        return summary

    def generate_category_explanation(self, category: str, confidence: float) -> Optional[str]:
        """
        Generate explanation for category prediction

        Args:
            category: Predicted disease category
            confidence: Prediction confidence score

        Returns:
            AI-generated explanation or None if LLM unavailable
        """
        if not self.is_available:
            return None

        # Check cache first
        cache_key_args = ("explanation", category, f"{confidence:.3f}")
        cached_response = self.cache.get(*cache_key_args)
        if cached_response:
            return cached_response

        try:
            confidence_pct = confidence * 100

            prompt = f"""Jelaskan secara singkat (2-3 kalimat) dalam Bahasa Indonesia:

Kategori penyakit: {category}
Tingkat keyakinan AI: {confidence_pct:.1f}%

Jelaskan apa arti kategori ini dan mengapa tingkat keyakinan berada di level tersebut. Gunakan bahasa yang mudah dipahami."""

            # Define LLM call function
            def make_llm_call():
                return self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "Anda adalah asisten medis yang menjelaskan hasil analisis AI dalam Bahasa Indonesia dengan cara yang mudah dipahami."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=150,
                    temperature=0.7
                )

            # Call LLM with retry logic
            response = self._retry_with_backoff(make_llm_call)
            result = response.choices[0].message.content.strip()

            # Cache the response
            self.cache.set(result, *cache_key_args)

            return result

        except Exception as e:
            print(f"[FALLBACK] Category explanation unavailable due to LLM error: {e}")
            return None

    def generate_first_aid_advice(self, category: str, urgency: str) -> Optional[str]:
        """
        Generate first aid advice based on category and urgency

        Args:
            category: Disease category
            urgency: Urgency level

        Returns:
            First aid recommendations or None
        """
        if not self.is_available or urgency == 'Red':
            # Don't give first aid for urgent cases
            return None

        # Check cache first
        cache_key_args = ("firstaid", category, urgency)
        cached_response = self.cache.get(*cache_key_args)
        if cached_response:
            return cached_response

        try:
            prompt = f"""Berikan saran pertolongan pertama sederhana (3-5 poin) untuk kondisi:

Kategori: {category}
Tingkat Urgensi: {urgency}

Berikan saran praktis yang AMAN untuk dilakukan di rumah sebelum konsultasi dokter. Gunakan format bullet points. Tekankan untuk tetap konsultasi dokter."""

            # Define LLM call function
            def make_llm_call():
                return self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "Anda adalah asisten medis yang memberikan saran pertolongan pertama yang aman dan praktis dalam Bahasa Indonesia."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=200,
                    temperature=0.7
                )

            # Call LLM with retry logic
            response = self._retry_with_backoff(make_llm_call)
            result = response.choices[0].message.content.strip()

            # Cache the response
            self.cache.set(result, *cache_key_args)

            return result

        except Exception as e:
            print(f"[FALLBACK] First aid advice unavailable due to LLM error: {e}")
            return None


# Singleton instance
llm_service = LLMService()


# Helper functions for easy import
def generate_medical_summary(
    complaint: str,
    category: str,
    urgency: str,
    symptoms: list,
    red_flags: list = None
) -> str:
    """Generate medical summary using LLM"""
    return llm_service.generate_medical_summary(
        complaint, category, urgency, symptoms, red_flags
    )


def generate_category_explanation(category: str, confidence: float) -> Optional[str]:
    """Generate category explanation"""
    return llm_service.generate_category_explanation(category, confidence)


def generate_first_aid_advice(category: str, urgency: str) -> Optional[str]:
    """Generate first aid advice"""
    return llm_service.generate_first_aid_advice(category, urgency)
