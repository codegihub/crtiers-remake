'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllGameModeTopPlayers, Player, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion } from '../../lib/firestore';
import styles from './leaderboards.module.css';

const gameModes = [
  { id: 'overall', name: 'Overall', icon: '🏆' },
  { id: 'vanilla', name: 'Vanilla', icon: '🎇' },
  { id: 'uhc', name: 'UHC', icon: '💖' },
  { id: 'pot', name: 'Pot', icon: '🧪' },
  { id: 'nethop', name: 'NethPot', icon: '🔮' },
  { id: 'smp', name: 'SMP', icon: '🧿' },
  { id: 'sword', name: 'Sword', icon: '⚔️' },
  { id: 'axe', name: 'Axe', icon: '🪓' },
  { id: 'mace', name: 'Mace', icon: '🔨' },
];

export default function Leaderboards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topPlayers, setTopPlayers] = useState<{ [gameMode: string]: Player | null }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const players = await getAllGameModeTopPlayers();
        setTopPlayers(players);
      } catch (error) {
        console.error('Error fetching top players:', error);
        // Fallback to mock data
        const mockData: { [gameMode: string]: Player | null } = {};
        gameModes.forEach(mode => {
          const mockScore = Math.floor(Math.random() * 1000) + 1500;
          mockData[mode.id] = {
            id: `mock-${mode.id}`,
            minecraftName: `TopPlayer${mode.id}`,
            name: `TopPlayer${mode.id}`,
            region: ['NA', 'EU', 'AS', 'OCE'][Math.floor(Math.random() * 4)],
            tiers: {
              axe: mockScore,
              mace: mockScore,
              nethop: mockScore,
              overall: mockScore,
              pot: mockScore,
              smp: mockScore,
              sword: mockScore,
              uhc: mockScore,
              vanilla: mockScore,
            }
          };
        });
        setTopPlayers(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`./player/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSeeMore = (gameMode: string) => {
    router.push(`/leaderboards/${gameMode}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="./" className={styles.navLink}>Home</a>
            <a href="./leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="./server" className={styles.navLink}>Server</a>
            <a href="./more" className={styles.navLink}>More</a>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.searchSection}>
          <h1 className={styles.title}>
            <span className="gradient-text">Leaderboards</span>
          </h1>
          <p className={styles.subtitle}>Search for players or browse rankings by game mode</p>
          
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search for a player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              🔍 Search
            </button>
          </form>
        </section>

        <section className={styles.gameModes}>
          <h2 className={styles.sectionTitle}>Game Modes</h2>
          {loading ? (
            <div className={styles.loadingGrid}>
              {gameModes.map((mode) => (
                <div key={mode.id} className={styles.skeletonCard}>
                  <div className={styles.skeleton}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.gameModeGrid}>
              {gameModes.map((mode) => (
                <GameModeCard 
                  key={mode.id} 
                  mode={mode} 
                  topPlayer={topPlayers[mode.id]}
                  onSeeMore={handleSeeMore} 
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 CrTiers. All rights reserved.</p>
          <p>Server IP: <span className="gradient-text">crystaltiers.club</span></p>
        </div>
      </footer>
    </div>
  );
}

function GameModeCard({ mode, topPlayer, onSeeMore }: { 
  mode: { id: string; name: string; icon: string }; 
  topPlayer: Player | null;
  onSeeMore: (gameMode: string) => void;
}) {
  if (!topPlayer) {
    return (
      <div className="card">
        <div className={styles.cardHeader}>
          <span className={styles.modeIcon}>{mode.icon}</span>
          <h3>{mode.name}</h3>
        </div>
        <div className={styles.noData}>
          <p>No players found</p>
        </div>
        <button 
          className={styles.seeMoreButton}
          onClick={() => onSeeMore(mode.id)}
          disabled
        >
          See more...
        </button>
      </div>
    );
  }

  const tierScore = topPlayer.tiers[mode.id as keyof typeof topPlayer.tiers];
  if (!tierScore) {
    return (
      <div className="card">
        <div className={styles.cardHeader}>
          <span className={styles.modeIcon}>{mode.icon}</span>
          <h3>{mode.name}</h3>
        </div>
        <div className={styles.noData}>
          <p>No data available</p>
        </div>
        <button 
          className={styles.seeMoreButton}
          onClick={() => onSeeMore(mode.id)}
          disabled
        >
          See more...
        </button>
      </div>
    );
  }

  const tierName = getTierName(tierScore, mode.id === 'overall');

  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <span className={styles.modeIcon}>{mode.icon}</span>
        <h3>{mode.name}</h3>
      </div>
      
      <div className={styles.topPlayer}>
        <div className={styles.playerAvatar}>
          <a href={`./player/${encodeURIComponent(topPlayer.minecraftName)}`}>
            <img 
              src={`https://mc-heads.net/avatar/${topPlayer.minecraftName}/64`}
              alt={`${topPlayer.minecraftName} avatar`}
              className={styles.avatar}
              onError={(e) => {
                e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
              }}
            />
          </a>
        </div>
        <div className={styles.playerInfo}>
          <h4>{topPlayer.minecraftName}</h4>
          <div className={styles.playerStats}>
            {mode.id !== 'overall' && (
              <span className={`${styles.tier} ${getTierColorClass(tierScore, mode.id === 'overall')}`}>{tierName}</span>
            )}
            <span className={`${styles.region} ${getRegionColorClass(topPlayer.region)}`}>
              {normalizeRegion(topPlayer.region)}
            </span>
            <span className={styles.score}>{tierScore}</span>
          </div>
        </div>
      </div>

      <button 
        className={styles.seeMoreButton}
        onClick={() => onSeeMore(mode.id)}
      >
        See more...
      </button>
    </div>
  );
}