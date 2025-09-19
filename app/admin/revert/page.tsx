'use client';

import { useState } from 'react';
import { getChangelogs, ChangelogEntry, updatePlayer, updateHiddenPlayer, deleteChangelog } from '../../../lib/firestore';
import styles from '../players/players.module.css';

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return typeof value === 'object'
    && value !== null
    && 'toDate' in (value as Record<string, unknown>)
    && typeof (value as { toDate: unknown }).toDate === 'function';
}

export default function AdminRevert() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [logs, setLogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ChangelogEntry | null>(null);
  const [revertConfirm, setRevertConfirm] = useState<ChangelogEntry | null>(null);
  const [reverting, setReverting] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'hideaway123') {
      setIsAuthenticated(true);
      setPasswordError('');
      loadChangelogs();
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const loadChangelogs = async () => {
    try {
      setLoading(true);
      const data = await getChangelogs(200);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (log: ChangelogEntry) => {
    if (!log.id) return;

    setReverting(true);
    try {
      // Get current player data first to preserve all existing scores
      let currentPlayer;
      if (log.isHiddenPlayer) {
        const { getHiddenPlayerByUsername } = await import('../../../lib/firestore');
        currentPlayer = await getHiddenPlayerByUsername(log.minecraftName);
      } else {
        const { getPlayerByUsername } = await import('../../../lib/firestore');
        currentPlayer = await getPlayerByUsername(log.minecraftName);
      }

      if (!currentPlayer) {
        throw new Error('Player not found');
      }

      // Create update object with individual tier fields to avoid overwriting entire tiers object
      const updateData: Record<string, number> = {};
      log.changes.forEach(change => {
        if (change.gameMode in currentPlayer.tiers) {
          updateData[`tiers.${change.gameMode}`] = change.previousScore;
        }
      });

      // Update the player with individual tier fields (preserving unchanged scores)
      if (log.isHiddenPlayer) {
        await updateHiddenPlayer(log.playerId, updateData);
      } else {
        await updatePlayer(log.playerId, updateData);
      }

      // Delete the changelog entry
      await deleteChangelog(log.id);

      // Refresh the list
      await loadChangelogs();
      
      setRevertConfirm(null);
    } catch (error) {
      console.error('Error reverting changes:', error);
      alert('Failed to revert changes. Please try again.');
    } finally {
      setReverting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.playersPage}>
        <div className={styles.header}>
          <h1 className={`${styles.title} gradient-text`}>🔒 Admin Revert</h1>
          <p className={styles.subtitle}>Enter password to access revert functionality</p>
        </div>

        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {passwordError && (
              <div className={styles.error}>{passwordError}</div>
            )}
            <button type="submit" className={styles.saveButton}>
              Access Revert Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playersPage}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>🔄 Admin Revert</h1>
        <p className={styles.subtitle}>Revert admin changes and remove changelog entries</p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading changelogs...</p>
        </div>
      ) : (
        <div className={styles.playersTable}>
          <div className={styles.tableHeader}>
            <div className={styles.playerCol}>Player</div>
            <div className={styles.regionCol}>Type</div>
            <div className={styles.tiersCol}>Changes</div>
            <div className={styles.actionsCol}>Actions</div>
          </div>

          <div className={styles.tableBody}>
            {logs.map((log) => (
              <div key={log.id} className={styles.tableRow}>
                <div className={styles.playerCol}>
                  <div className={styles.playerInfo}>
                    <img 
                      src={`https://mc-heads.net/avatar/${log.minecraftName}/32`} 
                      alt={log.minecraftName} 
                      className={styles.avatar}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://mc-heads.net/avatar/steve/32`; }}
                    />
                    <div>
                      <div className={styles.playerName}>{log.minecraftName}</div>
                      <div className={styles.displayName}>{
                        (hasToDate(log.createdAt) ? log.createdAt.toDate() : new Date())
                          .toLocaleString()
                      }</div>
                    </div>
                  </div>
                </div>

                <div className={styles.regionCol}>
                  <span className={styles.regionBadge}>
                    {log.isHiddenPlayer ? 'Hidden' : 'Regular'}
                  </span>
                </div>

                <div className={styles.tiersCol}>
                  <div className={styles.tiersGrid}>
                    {log.changes.map((c, idx) => (
                      <div key={idx} className={styles.tierBadge}>
                        <span className={styles.tierIcon}>🎮</span>
                        <span className={styles.tierScore}>{c.gameMode}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.actionsCol}>
                  <button onClick={() => setSelected(log)} className={styles.editBtn}>Details</button>
                  <button 
                    onClick={() => setRevertConfirm(log)} 
                    className={styles.deleteBtn}
                    disabled={reverting}
                  >
                    {reverting ? 'Reverting...' : 'Revert'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Change Details - {selected.minecraftName}</h2>
              <button onClick={() => setSelected(null)} className={styles.closeButton}>×</button>
            </div>
            <div className={styles.playerPreview}>
              <img 
                src={`https://mc-heads.net/avatar/${selected.minecraftName}/64`} 
                alt={selected.minecraftName}
                className={styles.previewAvatar}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://mc-heads.net/avatar/steve/64`; }}
              />
              <div className={styles.previewInfo}>
                <h3>{selected.minecraftName}</h3>
                <p>{selected.isHiddenPlayer ? 'Hidden Player' : 'Regular Player'}</p>
              </div>
            </div>

            <div className={styles.changesGrid}>
              {selected.changes.map((c, idx) => (
                <div key={idx} className={styles.changeCard}>
                  <div className={styles.changeHeader}>
                    <div className={styles.changeMode}>🎮 {c.gameMode}</div>
                  </div>
                  <div className={styles.changeScores}>
                    <div className={styles.scoreOld}>
                      <span className={styles.scoreLabel}>Previous</span>
                      <span className={styles.scoreValue}>{c.previousScore}</span>
                    </div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.scoreNew}>
                      <span className={styles.scoreLabel}>New</span>
                      <span className={styles.scoreValue}>{c.newScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setSelected(null)} className={styles.cancelButton}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {revertConfirm && (
        <div className={styles.modal}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <h2>Revert Changes</h2>
            </div>
            
            <div className={styles.confirmContent}>
              <div className={styles.deletePlayerInfo}>
                <img 
                  src={`https://mc-heads.net/avatar/${revertConfirm.minecraftName}/64`}
                  alt={revertConfirm.minecraftName}
                  className={styles.deleteAvatar}
                  onError={(e) => {
                    e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
                  }}
                />
                <div>
                  <h3>{revertConfirm.minecraftName}</h3>
                  <p>{revertConfirm.isHiddenPlayer ? 'Hidden Player' : 'Regular Player'}</p>
                </div>
              </div>
              
              <p className={styles.confirmText}>
                Are you sure you want to revert these changes?
              </p>
              <p className={styles.warningText}>
                This will restore all previous scores and delete this changelog entry. This action cannot be undone.
              </p>

              
            </div>
            
            <div className={styles.confirmActions}>
              <button onClick={() => setRevertConfirm(null)} className={styles.cancelButton}>
                Cancel
              </button>
              <button 
                onClick={() => handleRevert(revertConfirm)} 
                className={styles.deleteConfirmButton}
                disabled={reverting}
              >
                {reverting ? 'Reverting...' : 'Revert Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
