'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUserBySupabaseId, createUser, addCredits } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';

// Note: Authentication is now handled by Supabase on the client side
// These server actions are for account management and payments

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, user.id));

    return { name, success: 'Account updated successfully.' };
  }
);

// For purchasing credits via Stripe
export const purchaseCredits = validatedActionWithUser(
  z.object({
    priceId: z.string(),
    credits: z.number().min(1)
  }),
  async (data, _, user) => {
    const { priceId, credits } = data;

    // Create Stripe checkout session
    // Note: This would need to be adapted for individual users instead of teams
    // For now, we'll use a mock implementation
    return {
      success: true,
      message: `Checkout session created for ${credits} credits`,
      // In real implementation, return Stripe session URL
    };
  }
);

// Mock function to add credits (for testing)
export const addMockCredits = validatedActionWithUser(
  z.object({
    credits: z.number().min(1)
  }),
  async (data, _, user) => {
    const { credits } = data;

    await addCredits(user.id, credits, 'bonus', 'Mock credits added');

    return { success: `Added ${credits} credits to your account.` };
  }
);

// Server action for user authentication (called after Supabase auth)
export const handleUserAuth = validatedActionWithUser(
  z.object({
    email: z.string().email(),
    name: z.string().optional()
  }),
  async (data, _, user) => {
    const { email, name } = data;

    // Check if user exists in our database
    const dbUser = await getUserBySupabaseId(user.id);
    if (!dbUser) {
      // Create user in our database
      await createUser(user.id, email, name);
    }

    return { success: true };
  }
);

// Server action to ensure user exists in database after sign-in
export const ensureUserExists = async () => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op for server actions
        },
      },
    }
  );

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error('User is not authenticated');
  }

  // Check if user exists in our database
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  if (!dbUser) {
    // Create user in our database
    await createUser(supabaseUser.id, supabaseUser.email!, supabaseUser.user_metadata?.name);
  }

  return { success: true };
};

// Mock security actions (for individual user app)
export const updatePassword = validatedActionWithUser(
  z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8)
  }),
  async (data, _, user) => {
    // In a real app, you'd verify the current password and update it
    // For now, this is a mock implementation
    return { success: 'Password updated successfully' };
  }
);

export const deleteAccount = validatedActionWithUser(
  z.object({
    confirmEmail: z.string().email()
  }),
  async (data, _, user) => {
    // In a real app, you'd delete the user account
    // For now, this is a mock implementation
    return { success: 'Account deletion initiated' };
  }
);
