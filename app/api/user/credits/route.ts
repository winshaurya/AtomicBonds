import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getUserCredits } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await getUserCredits(user.id);
    return NextResponse.json({ credits: credits?.credits || 0 });
  } catch (error) {
    // Handle prerendering errors gracefully
    if (error instanceof Error && error.message.includes('cookies')) {
      return NextResponse.json({ credits: 0 });
    }
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
