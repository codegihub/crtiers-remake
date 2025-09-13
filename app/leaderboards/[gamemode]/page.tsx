import GameModeClient from './GameModeClient';

export async function generateStaticParams(): Promise<{ gamemode: string }[]> {
  return [
    { gamemode: 'overall' },
    { gamemode: 'vanilla' },
    { gamemode: 'uhc' },
    { gamemode: 'pot' },
    { gamemode: 'nethop' },
    { gamemode: 'smp' },
    { gamemode: 'sword' },
    { gamemode: 'axe' },
    { gamemode: 'mace' },
  ];
}

export default function Page() {
  return <GameModeClient />;
}