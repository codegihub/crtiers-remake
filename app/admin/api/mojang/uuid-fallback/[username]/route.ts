import { NextRequest, NextResponse } from 'next/server';

// Configure dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  console.log(`[API FALLBACK] Fetching UUID for username: ${username}`);

  try {
    // Try multiple services in order
    const services = [
      {
        name: 'Mojang Official',
        url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
        parseResponse: (data: any) => data.id
      },
      {
        name: 'PlayerDB',
        url: `https://playerdb.co/api/player/minecraft/${username}`,
        parseResponse: (data: any) => data.data?.player?.raw_id
      },
      {
        name: 'MC-API',
        url: `https://mc-api.net/v3/uuid/${username}`,
        parseResponse: (data: any) => data.uuid
      }
    ];

    for (const service of services) {
      try {
        console.log(`[API FALLBACK] Trying ${service.name}: ${service.url}`);
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'CrTiers-UUID-Sync/1.0'
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout per service
        });

        if (response.ok) {
          const data = await response.json();
          const uuid = service.parseResponse(data);
          
          if (uuid) {
            console.log(`[API FALLBACK] Success with ${service.name}: ${uuid}`);
            return NextResponse.json({ id: uuid });
          }
        } else if (response.status === 404) {
          console.log(`[API FALLBACK] ${service.name} returned 404 for ${username}`);
          continue; // Try next service
        }
      } catch (error) {
        console.log(`[API FALLBACK] ${service.name} failed:`, error);
        continue; // Try next service
      }
    }

    // All services failed
    console.log(`[API FALLBACK] All services failed for username: ${username}`);
    return NextResponse.json({ error: 'Username not found' }, { status: 404 });

  } catch (error) {
    console.error(`[API FALLBACK] Error fetching UUID for ${username}:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch UUID', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
