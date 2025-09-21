import PlayerClient from './PlayerClient';
import { getAllPlayers } from '../../../lib/firestore';

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
      'wingfallfan',
      'ruBolf_'
    ];
    
    return fallbackPlayers.map(username => ({ username }));
  }
}

export default async function PlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  return <PlayerClient username={decodedUsername} />;
}
