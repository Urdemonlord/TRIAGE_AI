#!/usr/bin/env python3
"""
Integration Test Script
Tests the complete flow: Backend → Database → Frontend Integration
"""

import requests
import json
from datetime import datetime

# Configuration
API_URL = "https://triageai-production.up.railway.app"
SUPABASE_URL = "https://xxplcakpmqqfjrarchyd.supabase.co"

def test_api_health():
    """Test API health check"""
    print("\n🔍 TEST 1: API Health Check")
    print("-" * 50)
    
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Model Loaded: {data.get('model_loaded')}")
        print(f"✅ Timestamp: {data.get('timestamp')}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_triage_api():
    """Test main triage endpoint"""
    print("\n🔍 TEST 2: Triage API Endpoint")
    print("-" * 50)
    
    payload = {
        "complaint": "Saya demam tinggi 39 derajat, batuk dan sakit kepala sejak 2 hari",
        "patient_data": {
            "age": 30,
            "gender": "male"
        }
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/triage",
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Triage ID: {data.get('triage_id')}")
        print(f"✅ Primary Category: {data.get('primary_category')}")
        print(f"✅ Urgency Level: {data.get('urgency', {}).get('urgency_level')}")
        print(f"✅ Symptoms Extracted: {len(data.get('extracted_symptoms', []))} found")
        
        # Verify response structure
        required_fields = [
            'success', 'triage_id', 'timestamp', 'original_complaint',
            'primary_category', 'urgency_level', 'extracted_symptoms',
            'requires_doctor_review', 'urgency'
        ]
        
        missing_fields = [f for f in required_fields if f not in data and f not in data.get('urgency', {})]
        if missing_fields:
            print(f"⚠️ Missing fields: {missing_fields}")
            return False
            
        print("✅ Response structure valid")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_categories_endpoint():
    """Test categories endpoint"""
    print("\n🔍 TEST 3: Get Categories Endpoint")
    print("-" * 50)
    
    try:
        response = requests.get(
            f"{API_URL}/api/v1/categories",
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Total Categories: {data.get('total')}")
        print(f"✅ Sample Categories: {data.get('categories', [])[:3]}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_api_structure():
    """Test API response structure against frontend types"""
    print("\n🔍 TEST 4: API Response Structure vs Frontend Types")
    print("-" * 50)
    
    payload = {
        "complaint": "Demam dan batuk selama 3 hari"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/triage",
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Check TriageResponse structure from frontend types
        response_fields = {
            'success': 'boolean',
            'triage_id': 'string',
            'timestamp': 'string',
            'original_complaint': 'string',
            'processed_complaint': 'string',
            'extracted_symptoms': 'string[]',
            'numeric_data': 'object',
            'primary_category': 'string',
            'category_confidence': 'string',
            'category_probability': 'number',
            'alternative_categories': 'CategoryPrediction[]',
            'requires_doctor_review': 'boolean',
            'urgency': 'UrgencyResult',
            'summary': 'string',
            'category_explanation': 'string (optional)',
            'first_aid_advice': 'string (optional)'
        }
        
        print("Checking response fields:")
        all_valid = True
        for field, expected_type in response_fields.items():
            if field in data:
                print(f"  ✅ {field}: Present")
            else:
                print(f"  ⚠️ {field}: Missing")
                all_valid = False
        
        # Check urgency structure
        urgency_fields = ['urgency_level', 'urgency_score', 'description', 'recommendation', 'detected_flags', 'flags_summary']
        print("\nChecking urgency fields:")
        for field in urgency_fields:
            if field in data.get('urgency', {}):
                print(f"  ✅ urgency.{field}: Present")
            else:
                print(f"  ⚠️ urgency.{field}: Missing")
                all_valid = False
        
        if all_valid:
            print("\n✅ Response structure matches frontend types")
        return all_valid
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def print_summary(results):
    """Print test summary"""
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    tests = [
        ("API Health Check", results[0]),
        ("Triage API Endpoint", results[1]),
        ("Categories Endpoint", results[2]),
        ("Response Structure", results[3])
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All integration tests passed!")
        print("Backend → Frontend integration is working correctly.")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check errors above.")


def main():
    print("=" * 50)
    print("🧪 TRIAGE.AI INTEGRATION TEST SUITE")
    print("=" * 50)
    print(f"API URL: {API_URL}")
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    results = [
        test_api_health(),
        test_triage_api(),
        test_categories_endpoint(),
        test_api_structure()
    ]
    
    print_summary(results)


if __name__ == "__main__":
    main()
