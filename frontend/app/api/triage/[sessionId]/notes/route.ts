import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { triageNoteService, triageSessionService, auditLogService } from '@/lib/db';
import { cacheService, cacheKeys } from '@/lib/redis';
import { notifyDoctorNote, notifyStatusUpdate } from '@/lib/notifications';

/**
 * POST /api/triage/[sessionId]/notes
 * Create or update triage notes by doctor
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a doctor
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (doctorError || !doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 403 });
    }

    // Get triage session
    const { sessionId } = await context.params
    const { data: session, error: sessionError } = await supabase
      .from('triage_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get request body
    const body = await request.json();
    const { note, decision } = body;

    if (!note || note.trim().length === 0) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'modified'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    // Create triage note
    const { data: triageNote, error: noteError } = await triageNoteService.create({
      session_id: sessionId,
      doctor_id: doctorProfile.id,
      note,
      decision,
    });

    if (noteError) {
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    // Update session status and assign doctor
    const { data: updatedSession, error: updateError } = await triageSessionService.update(
      sessionId,
      {
        status: 'completed',
        doctor_id: doctorProfile.id,
      }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Invalidate caches
    await cacheService.delete(cacheKeys.triageSession(sessionId));
    await cacheService.delete(cacheKeys.triageHistory(session.patient_id));

    // Send notifications to patient
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name')
      .eq('id', doctorProfile.id)
      .single();

    if (doctor) {
      await notifyDoctorNote(
        session.patient_id,
        doctor.name,
        sessionId
      );

      await notifyStatusUpdate(
        session.patient_id,
        sessionId,
        'completed'
      );
    }

    // Log audit
    await auditLogService.log({
      actor_id: user.id,
      entity: 'triage_notes',
      action: 'create',
      before: { session_id: sessionId },
      after: {
        note_id: triageNote?.id,
        decision,
        session_status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      note: triageNote,
      session: updatedSession,
    });
  } catch (error: any) {
    console.error('Triage notes API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/triage/[sessionId]/notes
 * Get all notes for a triage session
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get notes
    const { sessionId } = await context.params
    const { data: notes, error } = await triageNoteService.getBySessionId(sessionId);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error('Get notes API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
