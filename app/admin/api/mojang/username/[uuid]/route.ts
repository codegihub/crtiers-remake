import { NextRequest, NextResponse } from 'next/server';

// Configure dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { uuid } = params;

  console.log(`[API] Fetching username for UUID: ${uuid}`);

  try {
    const mojangUrl = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;
    console.log(`[API] Making request to: ${mojangUrl}`);

    const response = await fetch(mojangUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CrTiers-UUID-Sync/1.0'
      },
      // Add timeout and other options
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log(`[API] Mojang API response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[API] UUID ${uuid} not found`);
        return NextResponse.json({ error: 'UUID not found' }, { status: 404 });
      }
      const errorText = await response.text();
      console.error(`[API] Mojang API error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: `Mojang API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    console.log(`[API] Successfully fetched username for ${uuid}: ${data.name}`);
    return NextResponse.json({ name: data.name || null });
  } catch (error) {
    console.error(`[API] Error fetching username for UUID ${uuid}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch username', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
