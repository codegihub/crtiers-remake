'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllGameModeTopPlayers, Player, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion, searchPlayers } from '../../lib/firestore';
import styles from './leaderboards.module.css';
import MobileNav from '../components/MobileNav';

const gameModes = [
  { id: 'overall', name: 'Overall', icon: '🏆' },
  { id: 'vanilla', name: 'Vanilla', icon: '🎇' },
  { id: 'uhc', name: 'UHC', icon: '💖' },
  { id: 'pot', name: 'Pot', icon: '🧪' },
  { id: 'nethop', name: 'NethOP', icon: '🔮' },
  { id: 'smp', name: 'Diamond SMP', icon: '🧿' },
  { id: 'sword', name: 'Sword', icon: '⚔️' },
  { id: 'axe', name: 'Axe', icon: '🪓' },
  { id: 'mace', name: 'Mace', icon: '🔨' },
];

export default function Leaderboards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [topPlayers, setTopPlayers] = useState<{ [gameMode: string]: Player | null }>({});
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchPlayers(term);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Error searching players:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`../../player/${encodeURIComponent(searchTerm.trim())}`);
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
            <h1 className="gradient-text">CrystalTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="../.." className={styles.navLink}>Home</a>
            <a href="#" className={styles.navLink}>Leaderboards</a>
            <a href="../../server" className={styles.navLink}>Server</a>
            <a href="../../more" className={styles.navLink}>More</a>
          </div>
          <MobileNav />
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.searchSection}>
          <h1 className={styles.title}>
            <span className="gradient-text">Leaderboards</span>
          </h1>
          <p className={styles.subtitle}>Search for players or browse rankings by game mode</p>
          
          <div className={styles.searchContainer}>
            <form onSubmit={handleFormSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                🔍 Search
              </button>
            </form>
            {searchLoading && <div className={styles.searchSpinner}></div>}
            
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((player) => (
                  <a
                    key={player.id}
                    href={`../../player/${encodeURIComponent(player.minecraftName)}`}
                    className={styles.searchResultItem}
                  >
                    <img 
                      src={`https://mc-heads.net/avatar/${player.minecraftName}/64`}
                      alt={`${player.minecraftName} avatar`}
                      className={styles.searchResultAvatar}
                      onError={(e) => {
                        e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
                      }}
                    />
                    <div className={styles.searchResultInfo}>
                      <span className={styles.searchResultName}>{player.minecraftName}</span>
                      <span className={`${styles.searchResultRegion} ${getRegionColorClass(player.region)}`}>
                        {normalizeRegion(player.region)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
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
          <a href={`../../player/${encodeURIComponent(topPlayer.minecraftName)}`}>
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
