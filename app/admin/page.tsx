'use client';

import { useState, useEffect } from 'react';
import { getAllPlayers, getAllHiddenPlayers } from '../../lib/firestore';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalHiddenPlayers: 0,
    totalRegularPlayers: 0,
    totalRankedPlayers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const [players, hiddenPlayers] = await Promise.all([
          getAllPlayers(),
          getAllHiddenPlayers()
        ]);

        const rankedPlayers = players.filter(player => 
          Object.values(player.tiers).some(score => score > 0)
        );

        setStats({
          totalPlayers: players.length + hiddenPlayers.length,
          totalHiddenPlayers: hiddenPlayers.length,
          totalRegularPlayers: players.length,
          totalRankedPlayers: rankedPlayers.length,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={`${styles.dashboardTitle} gradient-text`}>Admin Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Manage players, tiers, and database operations
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statValue}>{stats.totalPlayers}</div>
          <div className={styles.statLabel}>Total Players</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎮</div>
          <div className={styles.statValue}>{stats.totalRegularPlayers}</div>
          <div className={styles.statLabel}>Regular Players</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔒</div>
          <div className={styles.statValue}>{stats.totalHiddenPlayers}</div>
          <div className={styles.statLabel}>Hidden Players</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statValue}>{stats.totalRankedPlayers}</div>
          <div className={styles.statLabel}>Ranked Players</div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <div className={styles.actionCard}>
          <h3>Manage Regular Players</h3>
          <p>
            Add, edit, and delete regular players. Manage their tiers across all game modes 
            including Vanilla, UHC, Pot, NethPot, SMP, Sword, Axe, and Mace.
          </p>
          <a href="./admin/players" className={styles.actionButton}>
            Manage Players
          </a>
        </div>

        <div className={styles.actionCard}>
          <h3>Manage Hidden Players</h3>
          <p>
            Manage the exclusive hidden tier list players. Control access to special game modes 
            including Bed PVP, Minecart, Creeper, and Spleef.
          </p>
          <a href="./admin/hidden-players" className={styles.actionButton}>
            Manage Hidden Players
          </a>
        </div>

        <div className={styles.actionCard}>
          <h3>View Live Website</h3>
          <p>
            Check how your changes appear on the live website. View leaderboards, 
            player profiles, and tier rankings in real-time.
          </p>
          <a href="./" target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
            Open Website →
          </a>
        </div>
      </div>
    </div>
  );
}