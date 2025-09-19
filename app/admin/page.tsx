'use client';

import { useState, useEffect } from 'react';
import { getAllPlayers, getAllHiddenPlayers, syncAllPlayersUuids } from '../../lib/firestore';
import styles from './admin.module.css';

interface SyncResult {
  player: string;
  changes: string[];
}

interface SyncResults {
  regularPlayers: {
    total: number;
    updated: number;
    results: SyncResult[];
  };
  hiddenPlayers: {
    total: number;
    updated: number;
    results: SyncResult[];
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalHiddenPlayers: 0,
    totalRegularPlayers: 0,
    totalRankedPlayers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);

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

  const handleSyncUuids = async () => {
    setSyncLoading(true);
    setSyncResults(null);
    try {
      const results = await syncAllPlayersUuids();
      setSyncResults(results);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Check console for details.');
    } finally {
      setSyncLoading(false);
    }
  };

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

        
      </div>

      <div className={styles.quickActions}>
        <div className={styles.actionCard}>
          <h3>View Changelogs</h3>
          <p>
            See a history of edits: who changed what, when, and the before/after scores.
          </p>
          <a href="../../admin/changelogs" className={styles.actionButton}>
            Open Changelogs
          </a>
        </div>

        

        <div className={styles.actionCard}>
          <h3>🆔 Sync Player UUIDs</h3>
          <p>
            Update all player UUIDs and usernames using Mojang API. Fetches UUIDs for new players and updates usernames for existing ones.
          </p>
          <button 
            onClick={handleSyncUuids} 
            className={styles.actionButton}
            disabled={syncLoading}
            style={{ background: syncLoading ? '#666' : undefined }}
          >
            {syncLoading ? 'Syncing...' : 'Sync All UUIDs'}
          </button>
        </div>

        
        <div className={styles.actionCard}>
          <h3>Manage Regular Players</h3>
          <p>
            Add, edit, and delete regular players. Manage their tiers across all game modes 
            including Vanilla, UHC, Pot, NethPot, SMP, Sword, Axe, and Mace.
          </p>
          <a href="../../admin/players" className={styles.actionButton}>
            Manage Players
          </a>
        </div>

        <div className={styles.actionCard}>
          <h3>Manage Hidden Players</h3>
          <p>
            Manage the exclusive hidden tier list players. Control access to special game modes 
            including Bed PVP, Minecart, Creeper, and Spleef.
          </p>
          <a href="../../admin/hidden-players" className={styles.actionButton}>
            Manage Hidden Players
          </a>
        </div>

        
      </div>

      {syncResults && (
        <div className={styles.syncResults}>
          <h2>UUID Sync Results</h2>
          
          {/* Only show regular players section if there are changes */}
          {syncResults.regularPlayers.updated > 0 && (
            <div className={styles.syncSection}>
              <h3>Regular Players</h3>
              <p>Updated {syncResults.regularPlayers.updated} of {syncResults.regularPlayers.total} players</p>
              <div className={styles.syncDetails}>
                {syncResults.regularPlayers.results
                  .filter((result: SyncResult) => !result.changes.includes('No changes needed'))
                  .map((result: SyncResult, index: number) => (
                    <div key={index} className={styles.syncResult}>
                      <strong>{result.player}:</strong>
                      <ul>
                        {result.changes.map((change: string, changeIndex: number) => (
                          <li key={changeIndex}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Only show hidden players section if there are changes */}
          {syncResults.hiddenPlayers.updated > 0 && (
            <div className={styles.syncSection}>
              <h3>Hidden Players</h3>
              <p>Updated {syncResults.hiddenPlayers.updated} of {syncResults.hiddenPlayers.total} players</p>
              <div className={styles.syncDetails}>
                {syncResults.hiddenPlayers.results
                  .filter((result: SyncResult) => !result.changes.includes('No changes needed'))
                  .map((result: SyncResult, index: number) => (
                    <div key={index} className={styles.syncResult}>
                      <strong>{result.player}:</strong>
                      <ul>
                        {result.changes.map((change: string, changeIndex: number) => (
                          <li key={changeIndex}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Show message if no changes were made */}
          {syncResults.regularPlayers.updated === 0 && syncResults.hiddenPlayers.updated === 0 && (
            <div className={styles.syncSection}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No changes were needed. All player UUIDs and usernames are up to date!
              </p>
            </div>
          )}

          <button 
            onClick={() => setSyncResults(null)} 
            className={styles.closeButton}
          >
            Close Results
          </button>
        </div>
      )}
    </div>
  );
}