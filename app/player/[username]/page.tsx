import PlayerClient from './PlayerClient';
import { getAllPlayers, getPlayerByUsername, getPlayerRank } from '../../../lib/firestore';
import { Metadata } from 'next';

// Generate static params for all players from Firebase
export async function generateStaticParams(): Promise<{ username: string }[]> {
  try {
    // Fetch all players from Firebase during build time
    const players = await getAllPlayers();
    
    // Return all player usernames for static generation
    return players.map(player => ({ username: player.minecraftName }));
  } catch (error) {
    console.error('Error fetching players for static generation:', error);
    
    // Fallback to hardcoded list if Firebase is not accessible during build
    const fallbackPlayers = [
      'CrystalPT',
      '4SureNotGay',
      'Altrei',
      'Birk2210',
      'Blandful',
      'bubbles201011111',
      'Charmien',
      'DetectiveStrokes',
      'Diamantblokk',
      'Dinosaur4201',
      'Froto_',
      'Herbalchest99',
      'IL1keUrMom',
      'Itz_7',
      'Justitie',
      'Luluc567',
      'Lynflippen',
      'MFD00M_',
      'Noamyaz171',
      'NoLimitTrash',
      'Payourtaxfee',
      'Peperoni9',
      'Real_Vortx',
      'robb1978',
      'thecheesymouse',
      'venm8in',
      'wingfallfan'
    ];
    
    return fallbackPlayers.map(username => ({ username }));
  }
}

// Generate metadata for Open Graph and social media previews
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  try {
    const player = await getPlayerByUsername(decodedUsername);
    
    if (!player) {
      return {
        title: `Player ${decodedUsername} - CrTiers`,
        description: 'Professional Minecraft player rankings and tier system',
      };
    }
    
    // Get the overall tier score and global rank for the description
    const overallScore = player.tiers.overall || 0;
    const globalRank = await getPlayerRank('overall', overallScore);
    const rankDescription = overallScore > 0 ? `#${globalRank} globally` : 'Unranked';
    
    return {
      title: `${player.minecraftName} - CrTiers`,
      description: `${player.minecraftName} - ${rankDescription}. Minecraft player rankings and tier system.`,
      
      // Open Graph meta tags
      openGraph: {
        title: `${player.minecraftName} - CrTiers`,
        description: `${player.minecraftName} - ${rankDescription}. Minecraft player rankings and tier system.`,
        type: 'profile',
        url: `https://crystaltiers.com/player/${encodeURIComponent(decodedUsername)}`,
        siteName: 'CrTiers',
        images: [
          {
            url: `https://mc-heads.net/body/${player.minecraftName}/80`,
            width: 60,
            height: 80,
            alt: `${player.minecraftName} Minecraft avatar`,
          }
        ],
        locale: 'en_US',
      },
      
      // Twitter Card meta tags
      twitter: {
        card: 'summary',
        title: `${player.minecraftName} - CrTiers`,
        description: `${player.minecraftName} - ${rankDescription}. Professional Minecraft player rankings and tier system.`,
        images: [`https://mc-heads.net/body/${player.minecraftName}/64`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for player:', error);
    
    // Fallback metadata
    return {
      title: `Player ${decodedUsername} - CrTiers`,
      description: 'Minecraft player rankings and tier system',
      openGraph: {
        title: `Player ${decodedUsername} - CrTiers`,
        description: 'Minecraft player rankings and tier system',
        type: 'website',
        siteName: 'CrTiers',
      },
    };
  }
}

export default async function PlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  return <PlayerClient username={decodedUsername} />;
}
