import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TriageRequest {
  complaint: string;
  patient_data?: {
    age?: number;
    gender?: string;
    [key: string]: any;
  };
}

export interface RedFlag {
  urgency: string;
  keyword: string;
  reason: string;
  action: string;
  severity: string;
}

export interface UrgencyResult {
  urgency_level: string;
  urgency_score: number;
  description: string;
  recommendation: string;
  detected_flags: RedFlag[];
  flags_summary: {
    total: number;
    red: number;
    yellow: number;
  };
}

export interface CategoryPrediction {
  category: string;
  probability: number;
  confidence: string;
}

export interface TriageResponse {
  success: boolean;
  triage_id: string;
  timestamp: string;
  original_complaint: string;
  processed_complaint: string;
  extracted_symptoms: string[];
  numeric_data: any;
  primary_category: string;
  category_confidence: string;
  category_probability: number;
  alternative_categories: CategoryPrediction[];
  requires_doctor_review: boolean;
  urgency: UrgencyResult;
  summary: string;
  category_explanation?: string;  // LLM-generated explanation
  first_aid_advice?: string;      // LLM-generated first aid tips
}

export const triageAPI = {
  // Main triage endpoint
  async performTriage(data: TriageRequest): Promise<TriageResponse> {
    const response = await api.post<TriageResponse>('/api/v1/triage', data);
    return response.data;
  },

  // Analyze symptoms only
  async analyzeSymptoms(complaint: string) {
    const response = await api.post('/api/v1/analyze-symptoms', { complaint });
    return response.data;
  },

  // Check urgency only
  async checkUrgency(complaint: string) {
    const response = await api.post('/api/v1/check-urgency', { complaint });
    return response.data;
  },

  // Get available categories
  async getCategories() {
    const response = await api.get('/api/v1/categories');
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/');
    return response.data;
  },
};

export default api;
