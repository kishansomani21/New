import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get all available skills
export async function GET(request: NextRequest) {
  try {
    const skills = db.getAllSkills();
    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add a skill to worker's profile
export async function POST(request: NextRequest) {
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
    const { skillName, category, yearsExperience } = body;

    if (!skillName) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    // Find or create skill
    let skill = db.findSkillByName(skillName);
    if (!skill) {
      skill = db.createSkill({
        name: skillName,
        category: category || 'General',
      });
    }

    // Add skill to worker
    const workerSkill = db.addWorkerSkill({
      workerId: profile.id,
      skillId: skill.id,
      yearsExperience: yearsExperience || 0,
      verified: false,
    });

    return NextResponse.json({
      success: true,
      workerSkill: {
        ...workerSkill,
        skill,
      },
    });
  } catch (error: any) {
    console.error('Error adding skill:', error);
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Skill already added' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
