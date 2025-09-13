'use client';

import { useState, useEffect } from 'react';
import { getAllHiddenGameModeTopPlayers, searchHiddenPlayers, HiddenPlayer } from '../../lib/firestore';
import styles from './hidden-tiers.module.css';

const gameModeNames: { [key: string]: string } = {
  overall: 'Overall',
  bed: 'Bed PVP',
  cart: 'Minecart',
  creeper: 'Creeper',
  spleef: 'Spleef',
};

const gameModeIcons: { [key: string]: string } = {
  overall: '🏆',
  bed: '🛏️',
  cart: '🛒',
  creeper: '💥',
  spleef: '🧹',
};

const gameModeDescriptions: { [key: string]: string } = {
  overall: 'Combined ranking across all hidden game modes',
  bed: 'Strategic bed destruction and defense gameplay',
  cart: 'Explosive minecart combat',
  creeper: 'Survive waves of explosive creeper attacks',
  spleef: 'Quick reflexes in block-breaking arena combat',
};

export default function HiddenTiers() {
  const [topPlayers, setTopPlayers] = useState<{ [gameMode: string]: HiddenPlayer | null }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<HiddenPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const data = await getAllHiddenGameModeTopPlayers();
        setTopPlayers(data);
      } catch (error) {
        console.error('Error fetching top players:', error);
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
      const results = await searchHiddenPlayers(term);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Error searching players:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading hidden tier lists...</p>
        </div>
      </div>
    );
  }

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
        <section className={styles.heroSection}>
          <h1 className={styles.title}>
            🔒 Hidden <span className="gradient-text">Tier Lists</span>
          </h1>
          <p className={styles.subtitle}>
            Exclusive rankings for special game modes. Discover hidden challenges and compete in unique arenas.
          </p>
        </section>

        <section className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search hidden players..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            {searchLoading && <div className={styles.searchSpinner}></div>}
            
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((player) => (
                  <a
                    key={player.id}
                    href={`./hidden-player/${encodeURIComponent(player.minecraftName)}`}
                    className={styles.searchResultItem}
                  >
                    <img 
                      src={`https://mc-heads.net/avatar/${player.minecraftName}/64`}
                      alt={`${player.minecraftName} body`}
                      className={styles.searchResultAvatar}
                      onError={(e) => {
                        e.currentTarget.src = `https://mc-heads.net/body/steve/24`;
                      }}
                    />
                    <div className={styles.searchResultInfo}>
                      <span className={styles.searchResultName}>{player.minecraftName}</span>
                      <span className={`${styles.searchResultRegion} region${player.region.toUpperCase()}`}>
                        {player.region.toUpperCase()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.gameModeSection}>
          <h2>Hidden Game Modes</h2>
          <div className={styles.gameModeGrid}>
            {Object.keys(gameModeNames).map((gameMode) => {
              const topPlayer = topPlayers[gameMode];
              const score = topPlayer ? topPlayer.tiers[gameMode as keyof typeof topPlayer.tiers] : 0;
              
              return (
                <a
                  key={gameMode}
                  href={`./hidden-tiers/${gameMode}`}
                  className={`${styles.gameModeCard} card`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.gameModeIcon}>
                      {gameModeIcons[gameMode]}
                    </div>
                    <div className={styles.gameModeInfo}>
                      <h3>{gameModeNames[gameMode]}</h3>
                      <p className={styles.gameModeDescription}>
                        {gameModeDescriptions[gameMode]}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.topPlayerSection}>
                    {topPlayer ? (
                      <div className={styles.topPlayer}>
                        <img 
                          src={`https://mc-heads.net/avatar/${topPlayer.minecraftName}/64`}
                          alt={`${topPlayer.minecraftName} body`}
                          className={styles.topPlayerAvatar}
                          onError={(e) => {
                            e.currentTarget.src = `https://mc-heads.net/body/steve/32`;
                          }}
                        />
                        <div className={styles.topPlayerInfo}>
                          <span className={styles.topPlayerName}>{topPlayer.minecraftName}</span>
                          <div className={styles.topPlayerStats}>
                            <span className={`${styles.topPlayerRegion} region${topPlayer.region.toUpperCase()}`}>
                              {topPlayer.region.toUpperCase()}
                            </span>
                            <span className={styles.topPlayerScore}>{score}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noPlayer}>
                        <span>No players ranked yet</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.viewLeaderboard}>View Leaderboard →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>About Hidden Tier Lists</h2>
            <p>
              Hidden tier lists feature exclusive game modes that push the boundaries of traditional Minecraft PvP. 
              These specialized arenas offer unique challenges and require different skill sets to master.
            </p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎯</span>
                <h3>Exclusive Access</h3>
                <p>Special game modes not available in standard rankings</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>⚡</span>
                <h3>Unique Challenges</h3>
                <p>Custom mechanics and specialized skill requirements</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏅</span>
                <h3>Elite Competition</h3>
                <p>Compete with the most dedicated players</p>
              </div>
            </div>
          </div>
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