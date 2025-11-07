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
    if (!user || user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const skillFilter = searchParams.get('skill')?.toLowerCase();
    const locationFilter = searchParams.get('location')?.toLowerCase();
    const availableOnly = searchParams.get('available') === 'true';

    // Get all worker profiles
    let workers = db.getAllWorkerProfiles();

    // Filter by availability
    if (availableOnly) {
      workers = workers.filter(w => w.available);
    }

    // Get workers with their details
    const workersWithDetails = workers.map(worker => {
      const workerUser = db.findUserById(worker.userId);
      const workerSkills = db.getWorkerSkills(worker.id);
      const skills = workerSkills.map(ws => {
        const skill = db.findSkillById(ws.skillId);
        return {
          ...ws,
          skill,
        };
      });
      const employmentHistory = db.getWorkerEmploymentHistory(worker.id);
      const reviews = db.getWorkerReviews(worker.id);

      return {
        ...worker,
        name: workerUser?.name || 'Unknown',
        email: workerUser?.email,
        phone: workerUser?.phone,
        skills,
        employmentCount: employmentHistory.length,
        reviewCount: reviews.length,
      };
    });

    // Apply skill filter
    let filteredWorkers = workersWithDetails;
    if (skillFilter) {
      filteredWorkers = filteredWorkers.filter(w =>
        w.skills.some(s => s.skill?.name.toLowerCase().includes(skillFilter))
      );
    }

    // Apply location filter
    if (locationFilter) {
      filteredWorkers = filteredWorkers.filter(w =>
        w.location?.toLowerCase().includes(locationFilter)
      );
    }

    // Sort by rating (descending)
    filteredWorkers.sort((a, b) => b.averageRating - a.averageRating);

    // Don't send full contact details unless purchased
    const companyProfile = db.findCompanyProfileByUserId(userId);
    const workersForDisplay = filteredWorkers.map(w => {
      const hasPurchased = companyProfile
        ? db.hasCompanyPurchasedContact(companyProfile.id, w.id)
        : false;

      if (hasPurchased) {
        return w; // Show full details
      } else {
        // Hide contact details
        const { email, phone, ...rest } = w;
        return {
          ...rest,
          email: null,
          phone: null,
          contactPurchased: false,
        };
      }
    });

    return NextResponse.json({
      workers: workersForDisplay,
      total: workersForDisplay.length,
    });
  } catch (error) {
    console.error('Error searching workers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
