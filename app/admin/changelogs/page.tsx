'use client';

import { useEffect, useState } from 'react';
import { getChangelogs, ChangelogEntry } from '../../../lib/firestore';
import styles from '../players/players.module.css';

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return typeof value === 'object'
    && value !== null
    && 'toDate' in (value as Record<string, unknown>)
    && typeof (value as { toDate: unknown }).toDate === 'function';
}

export default function AdminChangelogs() {
  const [logs, setLogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChangelogEntry | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getChangelogs(200);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className={styles.playersPage}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>Changelogs</h1>
        <p className={styles.subtitle}>History of admin edits with before/after scores</p>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}


