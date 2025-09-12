'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getLeaderboard, Player, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion } from '../../../lib/firestore';
import styles from './gamemode.module.css';

const gameModeNames: { [key: string]: string } = {
  overall: 'Overall',
  vanilla: 'Vanilla',
  uhc: 'UHC',
  pot: 'Pot',
  nethop: 'NethPot',
  smp: 'SMP',
  sword: 'Sword',
  axe: 'Axe',
  mace: 'Mace',
};

const gameModeIcons: { [key: string]: string } = {
  overall: '🏆',
  vanilla: '🎇',
  uhc: '💖',
  pot: '🧪',
  nethop: '🔮',
  smp: '🧿',
  sword: '⚔️',
  axe: '🪓',
  mace: '🔨',
};

export default function GameModeLeaderboard() {
  const params = useParams();
  const gamemode = params.gamemode as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
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
        
        const leaderboardData = await getLeaderboard(gamemode, 100);
        
        let playersData = leaderboardData;
        
        if (playersData.length === 0) {
          // Create mock data if no players found
          const mockPlayers: Player[] = [];
          for (let i = 1; i <= 50; i++) {
            const mockScore = gamemode === 'overall' 
              ? Math.floor(Math.random() * 1000) + 1200 - (i * 10)
              : Math.floor(Math.random() * 40) + 60 - (i * 0.5);
            
            mockPlayers.push({
              id: `mock-${i}`,
              minecraftName: `Player${i.toString().padStart(2, '0')}`,
              name: `Player${i.toString().padStart(2, '0')}`,
              region: ['NA', 'EU', 'AS', 'OCE'][Math.floor(Math.random() * 4)],
              tiers: {
                axe: gamemode === 'axe' ? mockScore : Math.floor(Math.random() * 100),
                mace: gamemode === 'mace' ? mockScore : Math.floor(Math.random() * 100),
                nethop: gamemode === 'nethop' ? mockScore : Math.floor(Math.random() * 100),
                overall: gamemode === 'overall' ? mockScore : Math.floor(Math.random() * 2000) + 1000,
                pot: gamemode === 'pot' ? mockScore : Math.floor(Math.random() * 100),
                smp: gamemode === 'smp' ? mockScore : Math.floor(Math.random() * 100),
                sword: gamemode === 'sword' ? mockScore : Math.floor(Math.random() * 100),
                uhc: gamemode === 'uhc' ? mockScore : Math.floor(Math.random() * 100),
                vanilla: gamemode === 'vanilla' ? mockScore : Math.floor(Math.random() * 100),
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
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    if (gamemode && gameModeNames[gamemode]) {
      fetchLeaderboard();
    } else {
      setError('Invalid game mode');
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
          <p>Loading {gamemodeName} leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error Loading Leaderboard</h2>
          <p>{error}</p>
          <a href="/leaderboards" className={styles.backLink}>← Back to Leaderboards</a>
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
          <a href="/leaderboards">← Back to Leaderboards</a>
        </div>

        <section className={styles.leaderboardSection}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <span className={styles.gameModeIcon}>{gamemodeIcon}</span>
              <h1 className={styles.title}>
                <span className="gradient-text">{gamemodeName}</span> Leaderboard
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
                          src={`https://mc-heads.net/avatar/${player.minecraftName}/32`}
                          alt={`${player.minecraftName} avatar`}
                          className={styles.playerAvatar}
                          onError={(e) => {
                            e.currentTarget.src = `https://mc-heads.net/avatar/steve/32`;
                          }}
                        />
                        <a 
                          href={`/player/${encodeURIComponent(player.minecraftName)}`}
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