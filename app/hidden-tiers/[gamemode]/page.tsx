import HiddenGameModeClient from './HiddenGameModeClient';

export async function generateStaticParams(): Promise<{ gamemode: string }[]> {
  return [
    { gamemode: 'overall' },
    { gamemode: 'bed' },
    { gamemode: 'cart' },
    { gamemode: 'creeper' },
    { gamemode: 'bed'}
  ];
}

export default function Page() {
  return <HiddenGameModeClient />;
}
