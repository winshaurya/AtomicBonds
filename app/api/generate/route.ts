import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getUserCredits, createShapeGeneration } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parameters } = body;

    if (!parameters || !parameters.type) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Check credits
    const credits = await getUserCredits(user.id);
    const costPerGeneration = 10; // 10 credits per generation

    if (!credits || credits.credits < costPerGeneration) {
      return NextResponse.json({
        error: 'Insufficient credits. Please purchase more credits.',
        credits: credits?.credits || 0
      }, { status: 402 });
    }

    // Create generation record
    const generation = await createShapeGeneration(user.id, parameters, costPerGeneration);

    // TODO: Call Python backend API here
    // For now, we'll simulate the generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful generation
    const mockModelUrl = `/models/${generation.id}.glb`;

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      modelUrl: mockModelUrl,
      creditsRemaining: credits.credits - costPerGeneration
    });

  } catch (error) {
    console.error('Error generating shape:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
