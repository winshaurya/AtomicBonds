import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, userCredits, creditTransactions } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const userId = session.client_reference_id;

    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    // For individual users, we handle credit purchases
    // Extract credits from metadata or use default
    const creditsPurchased = parseInt(session.metadata?.credits || '100');

    // Add credits to user account
    const existingCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (existingCredits.length > 0) {
      // Update existing credits
      await db
        .update(userCredits)
        .set({
          credits: existingCredits[0].credits + creditsPurchased,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
    } else {
      // Create credits record
      await db.insert(userCredits).values({
        userId,
        credits: creditsPurchased,
      });
    }

    // Record the transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: creditsPurchased,
      type: 'purchase',
      description: `Purchased ${creditsPurchased} credits`,
      stripePaymentId: session.payment_intent as string,
    });

    return NextResponse.redirect(new URL('/dashboard?success=purchase', request.url));
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/dashboard?error=purchase_failed', request.url));
  }
}
