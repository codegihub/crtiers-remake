'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getHiddenLeaderboard, HiddenPlayer, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion } from '../../../lib/firestore';
import styles from './hidden-gamemode.module.css';

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

export default function HiddenGameModeLeaderboard() {
  const params = useParams();
  const gamemode = params.gamemode as string;
  const [players, setPlayers] = useState<HiddenPlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<HiddenPlayer[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gamemodeName = gameModeNames[gamemode] || 'Unknown';
  const gamemodeIcon = gameModeIcons[gamemode] || '❓';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const leaderboardData = await getHiddenLeaderboard(gamemode, 100);
        
        let playersData = leaderboardData;
        
        if (playersData.length === 0) {
          // Create mock data if no players found
          const mockPlayers: HiddenPlayer[] = [];
          for (let i = 1; i <= 25; i++) {
            const mockScore = gamemode === 'overall' 
              ? Math.floor(Math.random() * 1000) + 1200 - (i * 10)
              : Math.floor(Math.random() * 40) + 60 - (i * 0.5);
            
            mockPlayers.push({
              id: `hidden-mock-${i}`,
              minecraftName: `HiddenPlayer${i.toString().padStart(2, '0')}`,
              name: `HiddenPlayer${i.toString().padStart(2, '0')}`,
              region: ['NA', 'EU', 'AS', 'OCE'][Math.floor(Math.random() * 4)],
              tiers: {
                bed: gamemode === 'bed' ? mockScore : Math.floor(Math.random() * 100),
                cart: gamemode === 'cart' ? mockScore : Math.floor(Math.random() * 100),
                creeper: gamemode === 'creeper' ? mockScore : Math.floor(Math.random() * 100),
                spleef: gamemode === 'spleef' ? mockScore : Math.floor(Math.random() * 100),
                overall: gamemode === 'overall' ? mockScore : Math.floor(Math.random() * 2000) + 1000,
              }
            });
          }
          playersData = mockPlayers;
        }
        
        // Filter out players with 0 score in the current gamemode
        const filteredData = playersData.filter(player => {
          const score = player.tiers[gamemode as keyof typeof player.tiers];
          return score > 0;
        });
        
        setPlayers(filteredData);
      } catch (err) {
        console.error('Error fetching hidden leaderboard:', err);
        setError('Failed to load hidden leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    if (gamemode && gameModeNames[gamemode]) {
      fetchLeaderboard();
    } else {
      setError('Invalid hidden game mode');
      setLoading(false);
    }
  }, [gamemode]);

  // Filter players by tier when selectedTier or players change
  useEffect(() => {
    if (selectedTier === 'all') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player => {
        const score = player.tiers[gamemode as keyof typeof player.tiers];
        const tierName = getTierName(score, gamemode === 'overall');
        return tierName === selectedTier;
      });
      setFilteredPlayers(filtered);
    }
  }, [players, selectedTier, gamemode]);

  // Get all available tiers from current players
  const getAvailableTiers = () => {
    const tiers = new Set<string>();
    players.forEach(player => {
      const score = player.tiers[gamemode as keyof typeof player.tiers];
      const tierName = getTierName(score, gamemode === 'overall');
      tiers.add(tierName);
    });
    
    // Sort tiers by rank (S+, S, A+, A, etc.)
    const tierOrder = gamemode === 'overall' 
      ? ['S+', 'S', 'A', 'B', 'C', 'D', 'F']
      : ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E+', 'E', 'F+', 'F'];
    
    return tierOrder.filter(tier => tiers.has(tier));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading {gamemodeName} hidden leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error Loading Hidden Leaderboard</h2>
          <p>{error}</p>
          <a href="/hidden-tiers" className={styles.backLink}>← Back to Hidden Tiers</a>
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
            <a href="/" className={styles.navLink}>Home</a>
            <a href="/leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="/server" className={styles.navLink}>Server</a>
            <a href="/more" className={styles.navLink}>More</a>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <a href="/hidden-tiers">← Back to Hidden Tiers</a>
        </div>

        <section className={styles.leaderboardSection}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <span className={styles.gameModeIcon}>{gamemodeIcon}</span>
              <h1 className={styles.title}>
                🔒 <span className="gradient-text">{gamemodeName}</span> Hidden Leaderboard
              </h1>
            </div>
            <p className={styles.subtitle}>
              {selectedTier === 'all' 
                ? `Top ${filteredPlayers.length} players ranked by ${gamemode === 'overall' ? 'overall score' : 'performance'}`
                : `${filteredPlayers.length} players in ${selectedTier} tier`
              }
            </p>
            
          </div>

          <div className={`${styles.leaderboardTable} ${gamemode === 'overall' ? styles.noTier : ''}`}>
            <div className={styles.tableHeader}>
              <div className={styles.rankColumn}>Rank</div>
              <div className={styles.playerColumn}>Player</div>
              {gamemode !== 'overall' && (
                <div className={styles.filterColumn}>
                  <label className={styles.filterLabel}>Filter:</label>
                  <select 
                    value={selectedTier} 
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className={styles.tierFilter}
                  >
                    <option value="all">All</option>
                    {getAvailableTiers().map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
              )}
              {gamemode !== 'overall' && <div className={styles.tierColumn}>Tier</div>}
              <div className={styles.regionColumn}>Region</div>
              <div className={styles.scoreColumn}>Score</div>
            </div>

            <div className={styles.tableBody}>
              {filteredPlayers.map((player, index) => {
                const score = player.tiers[gamemode as keyof typeof player.tiers];
                const tierName = getTierName(score, gamemode === 'overall');
                const rank = index + 1;

                return (
                  <div key={player.id} className={styles.tableRow}>
                    <div className={styles.rankColumn}>
                      <span className={`${styles.rank} ${rank <= 3 ? styles.topRank : ''}`}>
                        #{rank}
                      </span>
                    </div>

                    <div className={styles.playerColumn}>
                      <div className={styles.playerInfo}>
                        <img 
                          src={`https://mc-heads.net/avatar/${player.minecraftName}/64`}
                          alt={`${player.minecraftName} body`}
                          className={styles.playerAvatar}
                          onError={(e) => {
                            e.currentTarget.src = `https://mc-heads.net/body/steve/32`;
                          }}
                        />
                        <a 
                          href={`/hidden-player/${encodeURIComponent(player.minecraftName)}`}
                          className={styles.playerName}
                        >
                          {player.minecraftName}
                        </a>
                      </div>
                    </div>

                    {gamemode !== 'overall' && <div className={styles.filterColumn}></div>}

                    {gamemode !== 'overall' && (
                      <div className={styles.tierColumn}>
                        <span className={`${styles.tier} ${getTierColorClass(score, gamemode === 'overall')}`}>
                          {tierName}
                        </span>
                      </div>
                    )}

                    <div className={styles.regionColumn}>
                      <span className={`${styles.region} ${getRegionColorClass(player.region)}`}>
                        {normalizeRegion(player.region)}
                      </span>
                    </div>

                    <div className={styles.scoreColumn}>
                      <span className={styles.score}>{score}</span>
                    </div>
                  </div>
                );
              })}
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