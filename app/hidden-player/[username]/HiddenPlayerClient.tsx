'use client';

import { useState, useEffect } from 'react';
import { getHiddenPlayerByUsername, getHiddenPlayerRank, HiddenPlayer, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion, searchHiddenPlayers } from '../../../lib/firestore';
import styles from './hidden-player.module.css';
import MobileNav from '../../components/MobileNav';

const gameModes = [
  { id: 'overall', name: 'Overall', icon: '🏆' },
  { id: 'bed', name: 'Bed PVP', icon: '🛏️' },
  { id: 'cart', name: 'Minecart', icon: '🛒' },
  { id: 'creeper', name: 'Creeper', icon: '💥' },
  { id: 'spleef', name: 'Spleef', icon: '🧹' },
];

interface HiddenPlayerClientProps {
  username: string;
}

export default function HiddenPlayerClient({ username }: HiddenPlayerClientProps) {
  const [activeTab, setActiveTab] = useState('overall');
  const [player, setPlayer] = useState<HiddenPlayer | null>(null);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<HiddenPlayer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        const playerData = await getHiddenPlayerByUsername(username);
        
        if (!playerData) {
          setError('Hidden player not found');
          return;
        }
        
        setPlayer(playerData);
      } catch (err) {
        console.error('Error fetching hidden player:', err);
        setError('Failed to load hidden player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [username]);

  // Fetch player rank when active tab changes
  useEffect(() => {
    const fetchRank = async () => {
      if (player && player.tiers[activeTab as keyof typeof player.tiers]) {
        const rank = await getHiddenPlayerRank(activeTab, player.tiers[activeTab as keyof typeof player.tiers]);
        setPlayerRank(rank);
      }
    };

    if (player) {
      fetchRank();
    }
  }, [player, activeTab]);

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
      console.error('Error searching hidden players:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `../../hidden-player/${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading hidden player data...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <nav className={styles.nav}>
            <div className={styles.logo}>
              <h1 className="gradient-text">CrystalTiers</h1>
            </div>
            <div className={styles.navLinks}>
              <a href="../.." className={styles.navLink}>Home</a>
              <a href="../../leaderboards" className={styles.navLink}>Leaderboards</a>
              <a href="../../server" className={styles.navLink}>Server</a>
              <a href="../../more" className={styles.navLink}>More</a>
            </div>
            <MobileNav />
          </nav>
        </header>
        <div className={styles.error}>
          <h2>Hidden Player Not Found</h2>
          <p>The hidden player "{username}" could not be found in our database.</p>
          <a href="../../hidden-tiers" className={styles.backLink}>← Back to Hidden Tiers</a>
        </div>
      </div>
    );
  }

  const currentTierScore = player.tiers[activeTab as keyof typeof player.tiers];
  const currentTierName = currentTierScore ? getTierName(currentTierScore, activeTab === 'overall') : 'F';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="../.." className={styles.navLink}>Home</a>
            <a href="../../leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="../../server" className={styles.navLink}>Server</a>
            <a href="../../more" className={styles.navLink}>More</a>
          </div>
          <MobileNav />
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <a href="../../hidden-tiers">← Back to Hidden Tiers</a>
        </div>

        <section className={styles.playerSection}>
          <div className={styles.playerHeader}>
            <div className={styles.avatarContainer}>
              <img 
                src={`https://mc-heads.net/body/${player.minecraftName}/128`}
                alt={`${player.minecraftName} avatar`}
                className={styles.playerAvatar}
                onError={(e) => {
                  e.currentTarget.src = `https://mc-heads.net/body/steve/128`;
                }}
              />
              <div className={styles.playerName}>
                <h1>🔒 {player.minecraftName}</h1>
                <a 
                  href={`https://namemc.com/profile/${player.minecraftName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.nameMcLink}
                >
                  View on NameMC →
                </a>
              </div>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.searchContainer}>
                <form onSubmit={handleFormSearch} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Search hidden players..."
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
                    {searchResults.map((searchPlayer) => (
                      <a
                        key={searchPlayer.id}
                        href={`../../hidden-player/${encodeURIComponent(searchPlayer.minecraftName)}`}
                        className={styles.searchResultItem}
                      >
                        <img 
                          src={`https://mc-heads.net/avatar/${searchPlayer.minecraftName}/64`}
                          alt={`${searchPlayer.minecraftName} avatar`}
                          className={styles.searchResultAvatar}
                          onError={(e) => {
                            e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
                          }}
                        />
                        <div className={styles.searchResultInfo}>
                          <span className={styles.searchResultName}>🔒 {searchPlayer.minecraftName}</span>
                          <span className={`${styles.searchResultRegion} ${getRegionColorClass(searchPlayer.region)}`}>
                            {normalizeRegion(searchPlayer.region)}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.gameModeTabsContainer}>
                <div className={styles.gameModeTabs}>
                  {gameModes.map((mode) => (
                    <button
                      key={mode.id}
                      className={`${styles.gameModeTab} ${
                        activeTab === mode.id ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab(mode.id)}
                    >
                      <span className={styles.tabIcon}>{mode.icon}</span>
                      <span className={styles.tabName}>{mode.name}</span>
                    </button>
                  ))}
                </div>

                {currentTierScore ? (
                  <div className={styles.statsContent}>
                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <h3>Rank</h3>
                        <div className={styles.statValue}>#{playerRank}</div>
                      </div>

                      {activeTab !== 'overall' && (
                        <div className={styles.statCard}>
                          <h3>Tier</h3>
                          <div className={`${styles.statValue} ${styles.tierValue}`}>
                            <span className={`${styles.tier} ${getTierColorClass(currentTierScore, activeTab === 'overall')}`}>
                              {currentTierName}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className={styles.statCard}>
                        <h3>Region</h3>
                        <div className={styles.statValue}>
                          <span className={`${styles.region} ${getRegionColorClass(player.region)}`}>
                            {normalizeRegion(player.region)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.statCard}>
                        <h3>Score</h3>
                        <div className={styles.statValue}>{currentTierScore}</div>
                      </div>

                      {activeTab !== 'overall' && (
                        <div className={styles.statCard}>
                          <h3>Next Tier</h3>
                          <div className={styles.statValue}>
                            {currentTierScore >= 100 ? 'MAX' : getTierName(Math.min(currentTierScore + 5, 100), false)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.noData}>
                    <p>No data available for {gameModes.find(m => m.id === activeTab)?.name}</p>
                  </div>
                )}
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
