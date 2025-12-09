import { desc, and, eq } from 'drizzle-orm';
import { db } from './drizzle';
import { users, userCredits, shapeGenerations, creditTransactions } from './schema';

export async function getUserBySupabaseId(supabaseUserId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, supabaseUserId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createUser(supabaseUserId: string, email: string, name?: string) {
  const result = await db
    .insert(users)
    .values({
      id: supabaseUserId,
      email,
      name,
    })
    .returning();

  // Create initial credits record
  await db.insert(userCredits).values({
    userId: supabaseUserId,
    credits: 0, // Start with 0 credits
  });

  return result[0];
}

export async function getUserCredits(userId: string) {
  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserCredits(userId: string, credits: number) {
  await db
    .update(userCredits)
    .set({
      credits,
      updatedAt: new Date()
    })
    .where(eq(userCredits.userId, userId));
}

export async function createShapeGeneration(userId: string, parameters: any, creditsUsed: number) {
  const result = await db
    .insert(shapeGenerations)
    .values({
      userId,
      parameters,
      creditsUsed,
      status: 'pending',
    })
    .returning();

  // Deduct credits
  const currentCredits = await getUserCredits(userId);
  if (currentCredits && currentCredits.credits >= creditsUsed) {
    await updateUserCredits(userId, currentCredits.credits - creditsUsed);

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: -creditsUsed,
      type: 'usage',
      description: `Shape generation #${result[0].id}`,
      generationId: result[0].id,
    });
  }

  return result[0];
}

export async function updateShapeGenerationStatus(generationId: number, status: string, fileUrl?: string) {
  await db
    .update(shapeGenerations)
    .set({
      status,
      fileUrl,
      completedAt: status === 'completed' ? new Date() : undefined,
    })
    .where(eq(shapeGenerations.id, generationId));
}

export async function getUserGenerations(userId: string, limit = 10) {
  return await db
    .select()
    .from(shapeGenerations)
    .where(eq(shapeGenerations.userId, userId))
    .orderBy(desc(shapeGenerations.createdAt))
    .limit(limit);
}

export async function getCreditTransactions(userId: string, limit = 20) {
  return await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
}

export async function addCredits(userId: string, amount: number, type: string, description?: string, stripePaymentId?: string) {
  const currentCredits = await getUserCredits(userId);
  if (currentCredits) {
    await updateUserCredits(userId, currentCredits.credits + amount);

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount,
      type,
      description,
      stripePaymentId,
    });
  }
}

// Mock activity logs for dashboard compatibility
export async function getActivityLogs(limit = 10) {
  // This is a mock implementation - in a real app you'd have an activity log table
  // For now, return empty array since we don't have real activity logging
  return [];
}

// Mock getUser function for API compatibility
export async function getUser() {
  // This would normally get the current user from auth context
  // For now, return null
  return null;
}

// Mock getTeamForUser function for API compatibility
export async function getTeamForUser() {
  // This would normally get the user's team
  // For now, return null since we don't have teams
  return null;
}
