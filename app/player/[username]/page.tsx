import PlayerClient from './PlayerClient';

// Generate static params for all players
export async function generateStaticParams(): Promise<{ username: string }[]> {
  // Use a hardcoded list of players for static generation
  // This ensures the build works even if Firebase is not accessible during build time
  const players = [
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
  
  return players.map(username => ({ username }));
}

export default async function PlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  return <PlayerClient username={decodedUsername} />;
}