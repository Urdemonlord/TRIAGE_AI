import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, dbService } from '@/lib/supabase';

/**
 * POST /api/triage
 * Create a triage record with AI prediction
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Validate authentication
    if (authError) {
      console.error('[Triage API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login first' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { complaint, patient_data = {} } = body;

    // Validate complaint
    if (!complaint || typeof complaint !== 'string' || complaint.trim().length === 0) {
      return NextResponse.json(
        { error: 'Complaint is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (complaint.length > 5000) {
      return NextResponse.json(
        { error: 'Complaint is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Get patient profile with detailed error handling
    const { data: patientProfile, error: patientError } = await dbService.getPatient(user.id);

    if (patientError) {
      console.error('[Triage API] Patient fetch error:', patientError);

      // Check if it's RLS policy error
      if (patientError.code === 'PGRST116' || patientError.code === '406') {
        return NextResponse.json(
          {
            error: 'Patient profile not found',
            details: 'Please complete your patient registration first',
            action: 'redirect_to_signup',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch patient profile',
          details: patientError.message,
        },
        { status: 500 }
      );
    }

    if (!patientProfile) {
      return NextResponse.json(
        {
          error: 'Patient profile not found',
          details: 'Please complete your patient registration first',
          action: 'redirect_to_signup',
        },
        { status: 404 }
      );
    }

    // Call AI Service for triage prediction
    let triageResult;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${API_URL}/api/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaint,
          patient_data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `AI service returned ${response.status}`);
      }

      triageResult = await response.json();
    } catch (aiError: any) {
      console.error('[Triage API] AI Service error:', aiError);
      return NextResponse.json(
        {
          error: 'AI service unavailable',
          details: aiError.message || 'Failed to connect to AI backend',
          action: 'retry_later',
        },
        { status: 503 }
      );
    }

    // Validate AI result
    if (!triageResult || !triageResult.urgency_level || !triageResult.primary_category) {
      console.error('[Triage API] Invalid AI response:', triageResult);
      return NextResponse.json(
        {
          error: 'Invalid AI response',
          details: 'AI service returned incomplete data',
        },
        { status: 500 }
      );
    }

    // Generate unique triage ID
    const triageId = `TRG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Save triage record to database
    const { data: triageRecord, error: saveError } = await dbService.createTriageRecord({
      patient_id: patientProfile.id,
      triage_id: triageId,
      complaint: complaint.trim(),
      extracted_symptoms: triageResult.extracted_symptoms || [],
      numeric_data: patient_data,
      primary_category: triageResult.primary_category,
      category_confidence: triageResult.category_confidence || 'N/A',
      urgency_level: triageResult.urgency_level,
      urgency_score: triageResult.urgency_score || 0,
      detected_flags: triageResult.detected_flags || [],
      summary: triageResult.summary || '',
      category_explanation: triageResult.category_explanation || '',
      first_aid_advice: triageResult.first_aid_advice || '',
      result_json: triageResult,
      requires_doctor_review: triageResult.urgency_level === 'Red',
      doctor_reviewed: false,
    });

    if (saveError) {
      console.error('[Triage API] Database save error:', saveError);
      return NextResponse.json(
        {
          error: 'Failed to save triage record',
          details: saveError.message,
          ai_result: triageResult, // Return AI result even if save failed
        },
        { status: 500 }
      );
    }

    // Log successful triage
    console.log(`[Triage API] Success: ${triageId} - ${triageResult.urgency_level} (${triageResult.primary_category})`);

    // Return success response
    return NextResponse.json({
      success: true,
      triage_id: triageId,
      record_id: triageRecord?.id,
      urgency_level: triageResult.urgency_level,
      urgency_score: triageResult.urgency_score,
      primary_category: triageResult.primary_category,
      category_confidence: triageResult.category_confidence,
      extracted_symptoms: triageResult.extracted_symptoms,
      summary: triageResult.summary,
      category_explanation: triageResult.category_explanation,
      first_aid_advice: triageResult.first_aid_advice,
      detected_flags: triageResult.detected_flags,
      requires_doctor_review: triageResult.urgency_level === 'Red',
    });
  } catch (error: any) {
    console.error('[Triage API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/triage
 * Get triage records for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get patient profile
    const { data: patientProfile, error: patientError } = await dbService.getPatient(user.id);

    if (patientError || !patientProfile) {
      return NextResponse.json(
        {
          error: 'Patient profile not found',
          details: 'Please complete your registration first',
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1-100

    // Fetch triage records
    const { data: records, error: fetchError } = await dbService.getTriageRecords(
      patientProfile.id,
      validLimit
    );

    if (fetchError) {
      console.error('[Triage API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch triage records', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      records: records || [],
      count: records?.length || 0,
    });
  } catch (error: any) {
    console.error('[Triage API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
