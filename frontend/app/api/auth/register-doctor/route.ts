import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { doctorService, auditLogService } from '@/lib/db';

/**
 * POST /api/auth/register-doctor
 * Register a doctor profile
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
    const { name, specialization, license_no } = body;

    if (!name || !specialization || !license_no) {
      return NextResponse.json(
        { error: 'Missing required fields: name, specialization, license_no' },
        { status: 400 }
      );
    }

    // Create doctor profile
    const { data: profile, error } = await doctorService.createProfile(user.id, {
      name,
      specialization,
      license_no,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Log audit
    await auditLogService.log({
      actor_id: user.id,
      entity: 'doctors',
      action: 'create',
      before: {},
      after: { doctor_id: profile?.id, name },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Register doctor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
