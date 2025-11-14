import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { triageSessionService, auditLogService } from '@/lib/db';
import { triageAPI } from '@/lib/api';
import { cacheService, cacheKeys, cacheTTL } from '@/lib/redis';
import { notifyRedUrgencyCase } from '@/lib/notifications';

/**
 * POST /api/triage
 * Create a triage session with AI prediction
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { complaint, symptoms = [], patient_data = {} } = body;

    if (!complaint || complaint.trim().length === 0) {
      return NextResponse.json({ error: 'Complaint is required' }, { status: 400 });
    }

    // Get patient profile
    const { data: patientProfile, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Call AI Service for triage prediction
    let triageResult;
    try {
      triageResult = await triageAPI.performTriage({
        complaint,
        patient_data,
      });
    } catch (aiError: any) {
      console.error('AI Service error:', aiError);
      return NextResponse.json(
        { error: 'AI service unavailable', details: aiError.message },
        { status: 503 }
      );
    }

    // Save triage session to Supabase
    const { data: session, error: sessionError } = await triageSessionService.create({
      patient_id: patientProfile.id,
      complaint,
      symptoms: triageResult.extracted_symptoms,
      categories: [triageResult.primary_category],
      urgency: triageResult.urgency.urgency_level,
      risk_score: triageResult.urgency.urgency_score,
      recommendation: triageResult.urgency.recommendation,
      summary: triageResult.summary,
      status: 'pending',
    });

    if (sessionError) {
      console.error('Database error:', sessionError);
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }

    // Cache the triage result
    if (session?.id) {
      await cacheService.set(
        cacheKeys.triageSession(session.id),
        { ai_result: triageResult, db_session: session },
        cacheTTL.LONG
      );

      // Invalidate patient history cache
      await cacheService.delete(cacheKeys.triageHistory(patientProfile.id));
    }

    // Send notification for Red urgency cases
    if (triageResult.urgency.urgency_level === 'Red' && session?.id) {
      // Get patient name for notification
      const { data: patient } = await supabase
        .from('patients')
        .select('name')
        .eq('id', patientProfile.id)
        .single();

      if (patient) {
        await notifyRedUrgencyCase(
          session.id,
          patient.name,
          complaint
        );
      }
    }

    // Log audit
    await auditLogService.log({
      actor_id: user.id,
      entity: 'triage_sessions',
      action: 'create',
      before: {},
      after: {
        session_id: session?.id,
        complaint,
        urgency: triageResult.urgency.urgency_level,
      },
    });

    // Return combined response
    return NextResponse.json({
      success: true,
      session_id: session?.id,
      ai_result: triageResult,
      db_session: session,
    });
  } catch (error: any) {
    console.error('Triage API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/triage
 * Get triage sessions for authenticated user with caching
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get patient profile
    const { data: patientProfile, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Try cache first
    const cacheKey = cacheKeys.triageHistory(patientProfile.id);
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, sessions: cached, cached: true });
    }

    // Fetch from database
    const { data: sessions, error: sessionsError } = await supabase
      .from('triage_sessions')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (sessionsError) {
      console.error('Database error:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Cache the result
    await cacheService.set(cacheKey, sessions, cacheTTL.MEDIUM);

    return NextResponse.json({ success: true, sessions, cached: false });
  } catch (error: any) {
    console.error('Triage GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
