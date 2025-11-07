import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateReviewPoints } from '@/lib/pricing';

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
    const { workerId, rating, comment, workQuality, reliability, communication } = body;

    if (!workerId || !rating) {
      return NextResponse.json(
        { error: 'Worker ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find worker profile
    const workerProfile = db.getAllWorkerProfiles().find(
      (wp) => wp.id === workerId
    );

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Calculate points to award
    const pointsAwarded = calculateReviewPoints(rating);

    // Create review
    const review = db.createReview({
      workerId: workerProfile.id,
      companyId: companyProfile.id,
      rating,
      comment,
      workQuality,
      reliability,
      communication,
      pointsAwarded,
    });

    // Update company points and review count
    db.updateCompanyProfile(companyProfile.id, {
      points: companyProfile.points + pointsAwarded,
      totalReviews: companyProfile.totalReviews + 1,
    });

    // Update worker's average rating
    const allReviews = db.getWorkerReviews(workerProfile.id);
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.updateWorkerProfile(workerProfile.id, {
      averageRating: avgRating,
    });

    return NextResponse.json({
      success: true,
      review,
      pointsAwarded,
      newTotalPoints: companyProfile.points + pointsAwarded,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
