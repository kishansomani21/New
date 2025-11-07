import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateContactPrice } from '@/lib/pricing';

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
    const { workerId, purchaseType } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // Check if already purchased
    const alreadyPurchased = db.hasCompanyPurchasedContact(companyProfile.id, workerId);
    if (alreadyPurchased) {
      return NextResponse.json(
        { error: 'Contact already purchased' },
        { status: 400 }
      );
    }

    // Get worker
    const worker = db.findWorkerProfileByUserId(workerId);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Calculate price based on company points
    const priceCalculation = calculateContactPrice(companyProfile.points);

    // Create contact purchase
    const purchase = db.createContactPurchase({
      companyId: companyProfile.id,
      workerId: worker.id,
      basePrice: priceCalculation.basePrice,
      discountApplied: priceCalculation.discountPercentage,
      finalPrice: priceCalculation.finalPrice,
      pointsUsed: 0, // Points are not consumed, just provide discounts
      phoneAccess: purchaseType === 'phone' || purchaseType === 'both',
      emailAccess: purchaseType === 'email' || purchaseType === 'both',
    });

    // Update worker stats
    db.updateWorkerProfile(worker.id, {
      contactPurchases: worker.contactPurchases + 1,
    });

    // Get worker user details for contact info
    const workerUser = db.findUserById(worker.userId);

    return NextResponse.json({
      success: true,
      purchase,
      contact: {
        email: purchase.emailAccess ? workerUser?.email : null,
        phone: purchase.phoneAccess ? workerUser?.phone : null,
      },
      pricing: priceCalculation,
    });
  } catch (error) {
    console.error('Error purchasing contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
