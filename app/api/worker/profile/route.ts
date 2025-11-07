import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = db.findUserById(userId);
    if (!user || user.userType !== 'WORKER') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const profile = db.findWorkerProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get skills
    const workerSkills = db.getWorkerSkills(profile.id);
    const skills = workerSkills.map(ws => {
      const skill = db.findSkillById(ws.skillId);
      return {
        ...ws,
        skill,
      };
    });

    // Get employment history
    const employmentHistory = db.getWorkerEmploymentHistory(profile.id);
    const employmentWithCompanies = employmentHistory.map(eh => {
      const company = db.findCompanyProfileById(eh.companyId);
      const companyUser = company ? db.findUserById(company.userId) : null;
      return {
        ...eh,
        company: company ? {
          ...company,
          name: companyUser?.name || company.companyName,
        } : null,
      };
    });

    // Get reviews
    const reviews = db.getWorkerReviews(profile.id);
    const reviewsWithCompanies = reviews.map(r => {
      const company = db.findCompanyProfileById(r.companyId);
      return {
        ...r,
        company,
      };
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      profile,
      skills,
      employmentHistory: employmentWithCompanies,
      reviews: reviewsWithCompanies,
    });
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = db.findUserById(userId);
    if (!user || user.userType !== 'WORKER') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const profile = db.findWorkerProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { bio, location, hourlyRate, available } = body;

    const updatedProfile = db.updateWorkerProfile(profile.id, {
      bio,
      location,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      available,
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating worker profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
