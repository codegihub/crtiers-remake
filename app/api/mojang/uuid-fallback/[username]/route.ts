import { NextRequest, NextResponse } from 'next/server';

// API route configuration

interface MojangResponse {
  id: string;
}

interface PlayerDBResponse {
  data?: {
    player?: {
      raw_id: string;
    };
  };
}

interface MCAPIResponse {
  uuid: string;
}

type APIResponse = MojangResponse | PlayerDBResponse | MCAPIResponse;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  console.log(`[API FALLBACK] Fetching UUID for username: ${username}`);

  try {
    // Try multiple services in order
    const services = [
      {
        name: 'Mojang Official',
        url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
        parseResponse: (data: APIResponse) => (data as MojangResponse).id
      },
      {
        name: 'PlayerDB',
        url: `https://playerdb.co/api/player/minecraft/${username}`,
        parseResponse: (data: APIResponse) => (data as PlayerDBResponse).data?.player?.raw_id
      },
      {
        name: 'MC-API',
        url: `https://mc-api.net/v3/uuid/${username}`,
        parseResponse: (data: APIResponse) => (data as MCAPIResponse).uuid
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
