import HiddenPlayerClient from './HiddenPlayerClient';
import { getHiddenPlayerByUsername, getHiddenPlayerRank } from '../../../lib/firestore';
import { Metadata } from 'next';

// Enable dynamic rendering for all hidden players
export const dynamicParams = true;

// Generate static params for some hidden players (optional - for performance)
export async function generateStaticParams(): Promise<{ username: string }[]> {
  try {
    // Fetch all hidden players from Firebase during build time
    const players = await getHiddenPlayerByUsername('CrystalPT'); // This will be replaced with getAllHiddenPlayers when available
    
    // For now, use hardcoded list if Firebase is not accessible during build
    const fallbackPlayers = [
      'CrystalPT',
      '4SureNotGay',
      'atai1293',
      'Blandful',
      'Dinosour4201',
      'matrexe',
      'Peperoni9'
    ];
    
    return fallbackPlayers.map(username => ({ username }));
  } catch (error) {
    console.error('Error fetching hidden players for static generation:', error);
    
    // Fallback to hardcoded list if Firebase is not accessible during build
    const fallbackPlayers = [
      'CrystalPT',
      '4SureNotGay',
      'atai1293',
      'Blandful',
      'Dinosour4201',
      'matrexe',
      'Peperoni9'
    ];
    
    return fallbackPlayers.map(username => ({ username }));
  }
}

// Generate metadata for Open Graph and social media previews
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  try {
    const player = await getHiddenPlayerByUsername(decodedUsername);
    
    if (!player) {
      return {
        title: `🔒 Hidden Player ${decodedUsername} - CrTiers`,
        description: 'Exclusive subtiers player rankings and tier system',
      };
    }

    const overallScore = player.tiers.overall || 0;
    const globalRank = await getHiddenPlayerRank('overall', overallScore);
    const rankDescription = overallScore > 0 ? `#${globalRank} globally` : 'Unranked';
    
    return {
      title: `🔒 ${player.minecraftName} - CrTiers Hidden`,
      description: `🔒 ${player.minecraftName} - ${rankDescription}. Exclusive subtiers player rankings and tier system.`,

      openGraph: {
        title: `🔒 ${player.minecraftName} - CrTiers Hidden`,
        description: ` ${player.minecraftName} - ${rankDescription}. Exclusive subtiers player rankings and tier system.`,
        type: 'profile',
        url: `https://crystaltiers.com/hidden-player/${encodeURIComponent(decodedUsername)}/`,
        siteName: 'CrTiers',
        images: [
          {
            url: `https://mc-heads.net/avatar/${player.minecraftName}/64`,
            width: 64,
            height: 64,
            alt: `🔒 ${player.minecraftName} Hidden Minecraft avatar`,
          }
        ],
        locale: 'en_US',
      },
      
      twitter: {
        card: 'summary',
        title: `🔒 ${player.minecraftName} - CrTiers Hidden`,
        description: ` ${player.minecraftName} - ${rankDescription}. Exclusive subtiers player rankings and tier system.`,
        images: [`https://mc-heads.net/avatar/${player.minecraftName}/64`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for hidden player:', error);

    return {
      title: `🔒 Hidden Player ${decodedUsername} - CrTiers`,
      description: 'Exclusive subtiers player rankings and tier system',
      openGraph: {
        title: `🔒 Hidden Player ${decodedUsername} - CrTiers`,
        description: 'Exclusive subtiers player rankings and tier system',
        type: 'website',
        siteName: 'CrTiers',
      },
    };
  }
}

export default async function HiddenPlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  return <HiddenPlayerClient username={decodedUsername} />;
}
