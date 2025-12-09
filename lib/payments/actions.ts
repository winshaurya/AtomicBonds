'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createCheckoutSession } from './stripe';
import { validatedActionWithUser } from '@/lib/auth/middleware';

export const checkoutAction = validatedActionWithUser(
  z.object({
    priceId: z.string(),
    credits: z.number().optional().default(100),
  }),
  async (data, _, user) => {
    const { priceId, credits } = data;

    // For individual users, create a checkout session for credit purchase
    await createCheckoutSession({
      userId: user.id,
      priceId,
      credits,
    });
  }
);

// Customer portal removed for individual user credit system
