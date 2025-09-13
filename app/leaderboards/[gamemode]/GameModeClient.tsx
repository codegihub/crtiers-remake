'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAllPlayers, Player, getTierName, getTierColorClass, getRegionColorClass, normalizeRegion } from '../../../lib/firestore';
import styles from './gamemode.module.css';

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

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await getAllPlayers();
        
        // Filter players who have a score in this gamemode
        const playersWithScore = data.filter(player => 
          player.tiers[gamemode as keyof typeof player.tiers] > 0
        );
        
        // Sort by the gamemode score (descending)
        const sortedPlayers = playersWithScore.sort((a, b) => 
          b.tiers[gamemode as keyof typeof b.tiers] - a.tiers[gamemode as keyof typeof a.tiers]
        );
        
        setPlayers(sortedPlayers);
        setFilteredPlayers(sortedPlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    if (gamemode) {
      fetchPlayers();
    }
  }, [gamemode]);

  useEffect(() => {
    if (selectedTier === 'all') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player => {
        const score = player.tiers[gamemode as keyof typeof player.tiers];
        const tier = getTierName(score, gamemode === 'overall');
        return tier === selectedTier;
      });
      setFilteredPlayers(filtered);
    }
  }, [selectedTier, players, gamemode]);

  if (!gamemode || !gameModeIcons[gamemode]) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Invalid Game Mode</h2>
          <p>The game mode "{gamemode}" does not exist.</p>
          <a href="../leaderboards" className={styles.backLink}>← Back to Leaderboards</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <a href="../leaderboards" className={styles.backLink}>← Back to Leaderboards</a>
        </div>
      </div>
    );
  }

  const gameModeName = gamemode.charAt(0).toUpperCase() + gamemode.slice(1);
  const gameModeIcon = gameModeIcons[gamemode];

  // Get unique tiers for filter
  const availableTiers = Array.from(new Set(
    players.map(player => {
      const score = player.tiers[gamemode as keyof typeof player.tiers];
      return getTierName(score, gamemode === 'overall');
    })
  )).sort();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <h1 className="gradient-text">CrTiers</h1>
          </div>
          <div className={styles.navLinks}>
            <a href="../" className={styles.navLink}>Home</a>
            <a href="../leaderboards" className={styles.navLink}>Leaderboards</a>
            <a href="../server" className={styles.navLink}>Server</a>
            <a href="../more" className={styles.navLink}>More</a>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <a href="../leaderboards">← Back to Leaderboards</a>
        </div>

        <div className={styles.headerSection}>
          <h1 className={styles.title}>
            <span className={styles.gameIcon}>{gameModeIcon}</span>
            {gameModeName} Leaderboard
          </h1>
          <p className={styles.subtitle}>
            Top players in {gameModeName} ranked by their tier points
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.filterSection}>
            <label htmlFor="tier-filter">Filter by Tier:</label>
            <select 
              id="tier-filter"
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value)}
              className={styles.tierFilter}
            >
              <option value="all">All Tiers</option>
              {availableTiers.map(tier => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.stats}>
            <span className={styles.playerCount}>
              {filteredPlayers.length} players
            </span>
          </div>
        </div>

        <div className={styles.leaderboard}>
          {filteredPlayers.length > 0 ? (
            <div className={styles.playersList}>
              {filteredPlayers.map((player, index) => {
                const score = player.tiers[gamemode as keyof typeof player.tiers];
                const tier = getTierName(score, gamemode === 'overall');
                const rank = index + 1;
                
                return (
                  <div key={player.id} className={styles.playerCard}>
                    <div className={styles.rank}>#{rank}</div>
                    
                    <div className={styles.playerInfo}>
                      <img 
                        src={`https://mc-heads.net/avatar/${player.minecraftName}/32`}
                        alt={player.minecraftName}
                        className={styles.avatar}
                        onError={(e) => {
                          e.currentTarget.src = `https://mc-heads.net/avatar/steve/32`;
                        }}
                      />
                      <div className={styles.playerDetails}>
                        <a 
                          href={`../player/${encodeURIComponent(player.minecraftName)}`}
                          className={styles.playerName}
                        >
                          {player.minecraftName}
                        </a>
                        <div className={styles.playerSubtext}>
                          {player.name}
                        </div>
                      </div>
                    </div>

                    <div className={styles.playerStats}>
                      <div className={styles.score}>
                        <span className={styles.scoreValue}>{score}</span>
                        <span className={styles.scoreLabel}>points</span>
                      </div>
                      
                      {gamemode !== 'overall' && (
                        <div className={`${styles.tier} ${getTierColorClass(score, gamemode === 'overall')}`}>
                          {tier}
                        </div>
                      )}
                      
                      <div className={`${styles.region} ${getRegionColorClass(player.region)}`}>
                        {normalizeRegion(player.region)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No players found</h3>
              <p>No players have scores in {gameModeName} for the selected filter.</p>
            </div>
          )}
        </div>
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