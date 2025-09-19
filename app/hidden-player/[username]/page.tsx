import HiddenPlayerClient from './HiddenPlayerClient';

// Generate static params for all hidden players
export async function generateStaticParams(): Promise<{ username: string }[]> {
  // Use a hardcoded list of hidden players for static generation
  // This ensures the build works even if Firebase is not accessible during build time
  const players = [
    'CrystalPT',
    '4SureNotGay',
    'atai1293',
    'Blandful',
    'Dinosour4201',
    'matrexe',
    'Peperoni9'
  ];
  
  return players.map(username => ({ username }));
}

export default async function HiddenPlayerProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  return <HiddenPlayerClient username={decodedUsername} />;
}