import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { patientService, doctorService, auditLogService } from '@/lib/db';

/**
 * POST /api/auth/register-patient
 * Register a patient profile
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, gender, dob, phone } = body;

    if (!name || !gender || !dob || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, gender, dob, phone' },
        { status: 400 }
      );
    }

    // Create patient profile
    const { data: profile, error } = await patientService.createProfile(user.id, {
      name,
      gender,
      dob,
      phone,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Log audit
    await auditLogService.log({
      actor_id: user.id,
      entity: 'patients',
      action: 'create',
      before: {},
      after: { patient_id: profile?.id, name },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Register patient error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
