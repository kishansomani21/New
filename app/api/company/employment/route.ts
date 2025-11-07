import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sign in a worker
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = db.findUserById(userId);
    if (!user || user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const companyProfile = db.findCompanyProfileByUserId(userId);
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { workerEmail, jobTitle, description } = body;

    if (!workerEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Worker email and job title are required' },
        { status: 400 }
      );
    }

    // Find worker by email
    const workerUser = db.findUserByEmail(workerEmail);
    if (!workerUser || workerUser.userType !== 'WORKER') {
      return NextResponse.json(
        { error: 'Worker not found with this email' },
        { status: 404 }
      );
    }

    const workerProfile = db.findWorkerProfileByUserId(workerUser.id);
    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    // Create employment record
    const employment = db.createEmploymentHistory({
      workerId: workerProfile.id,
      companyId: companyProfile.id,
      jobTitle,
      description,
      status: 'CURRENT',
      signedInAt: new Date().toISOString(),
      signedInBy: user.name,
      verified: true,
    });

    return NextResponse.json({
      success: true,
      employment,
      worker: {
        name: workerUser.name,
        email: workerUser.email,
      },
    });
  } catch (error) {
    console.error('Error signing in worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Sign out a worker
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = db.findUserById(userId);
    if (!user || user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { employmentId } = body;

    if (!employmentId) {
      return NextResponse.json(
        { error: 'Employment ID is required' },
        { status: 400 }
      );
    }

    // Update employment record
    const employment = db.updateEmploymentHistory(employmentId, {
      status: 'PAST',
      signedOutAt: new Date().toISOString(),
      signedOutBy: user.name,
    });

    if (!employment) {
      return NextResponse.json({ error: 'Employment record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      employment,
    });
  } catch (error) {
    console.error('Error signing out worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
