'use client';

import { useState, useEffect } from 'react';
import { 
  getAllHiddenPlayers, 
  addHiddenPlayer, 
  updateHiddenPlayer, 
  deleteHiddenPlayer, 
  validatePlayerData,
  HiddenPlayer,
  getTierName,
  getTierColorClass,
  getRegionColorClass,
  normalizeRegion
} from '../../../lib/firestore';
import styles from '../players/players.module.css';

const defaultTiers = {
  bed: 0,
  cart: 0,
  creeper: 0,
  spleef: 0,
  overall: 0,
};

const gameModes = [
  { id: 'overall', name: 'Overall', icon: '🏆' },
  { id: 'bed', name: 'Bed PVP', icon: '🛏️' },
  { id: 'cart', name: 'Minecart', icon: '🛒' },
  { id: 'creeper', name: 'Creeper', icon: '💥' },
  { id: 'spleef', name: 'Spleef', icon: '🧹' },
];

interface EditingPlayer extends HiddenPlayer {
  isNew?: boolean;
}

export default function HiddenPlayersManagement() {
  const [players, setPlayers] = useState<HiddenPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<EditingPlayer | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<HiddenPlayer | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllHiddenPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching hidden players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => 
    player.minecraftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (player: HiddenPlayer) => {
    setEditingPlayer({ ...player });
    setErrors([]);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setEditingPlayer({
      id: '',
      minecraftName: '',
      name: '',
      region: 'NA',
      tiers: { ...defaultTiers },
      isNew: true
    });
    setErrors([]);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!editingPlayer) return;

    const validationErrors = validatePlayerData(editingPlayer);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingPlayer.isNew) {
        const { id, isNew, ...playerData } = editingPlayer;
        const newId = await addHiddenPlayer(playerData);
        if (newId) {
          setSuccess('Hidden player added successfully!');
          fetchPlayers();
          setShowAddForm(false);
        }
      } else {
        const { id, ...playerData } = editingPlayer;
        const updated = await updateHiddenPlayer(id, playerData);
        if (updated) {
          setSuccess('Hidden player updated successfully!');
          fetchPlayers();
          setShowEditModal(false);
        }
      }
      
      setEditingPlayer(null);
      setErrors([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving hidden player:', error);
      setErrors(['Failed to save hidden player. Please try again.']);
    }
  };

  const handleDeleteClick = (player: HiddenPlayer) => {
    setPlayerToDelete(player);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    try {
      const deleted = await deleteHiddenPlayer(playerToDelete.id);
      if (deleted) {
        setSuccess('Hidden player deleted successfully!');
        fetchPlayers();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting hidden player:', error);
    } finally {
      setPlayerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setPlayerToDelete(null);
  };

  const handleCancel = () => {
    setEditingPlayer(null);
    setShowAddForm(false);
    setShowEditModal(false);
    setErrors([]);
  };

  const calculateOverallScore = (tiers: any) => {
    const { overall, ...otherTiers } = tiers;
    const sum = Object.values(otherTiers).reduce((sum: number, score: any) => sum + (parseInt(score) || 0), 0);
    return Math.min(sum, 808);
  };

  const updateEditingPlayer = (field: string, value: any) => {
    if (!editingPlayer) return;
    
    if (field.startsWith('tiers.')) {
      const tierField = field.replace('tiers.', '');
      const updatedTiers = {
        ...editingPlayer.tiers,
        [tierField]: parseInt(value) || 0
      };
      
      // Auto-calculate overall score
      updatedTiers.overall = calculateOverallScore(updatedTiers);
      
      setEditingPlayer({
        ...editingPlayer,
        tiers: updatedTiers
      });
    } else {
      setEditingPlayer({
        ...editingPlayer,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading hidden players...</p>
      </div>
    );
  }

  return (
    <div className={styles.playersPage}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>🔒 Hidden Players Management</h1>
        <p className={styles.subtitle}>Manage exclusive hidden tier list players</p>
      </div>

      {success && (
        <div className={styles.success}>
          {success}
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search hidden players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <button onClick={handleAdd} className={styles.addButton}>
          + Add New Hidden Player
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{players.length}</span>
          <span className={styles.statLabel}>Total Hidden Players</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredPlayers.length}</span>
          <span className={styles.statLabel}>Filtered Results</span>
        </div>
      </div>

      {/* Add Hidden Player Modal */}
      {(editingPlayer && showAddForm) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>🔒 Add New Hidden Player</h2>
              <button onClick={handleCancel} className={styles.closeButton}>×</button>
            </div>
            
            {errors.length > 0 && (
              <div className={styles.errorList}>
                {errors.map((error, index) => (
                  <div key={index} className={styles.error}>{error}</div>
                ))}
              </div>
            )}

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Minecraft Name</label>
                <input
                  type="text"
                  value={editingPlayer.minecraftName}
                  onChange={(e) => updateEditingPlayer('minecraftName', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => updateEditingPlayer('name', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Region</label>
                <select
                  value={editingPlayer.region}
                  onChange={(e) => updateEditingPlayer('region', e.target.value)}
                  className={styles.select}
                >
                  <option value="NA">NA</option>
                  <option value="EU">EU</option>
                  <option value="AS">AS</option>
                  <option value="OCE">OCE</option>
                </select>
              </div>

              <div className={styles.tiersSection}>
                <h3>Hidden Game Mode Tiers</h3>
                <div className={styles.tiersGrid}>
                  {gameModes.map(mode => (
                    <div key={mode.id} className={styles.tierGroup}>
                      <label>{mode.icon} {mode.name}</label>
                      {mode.id === 'overall' ? (
                        <div className={styles.overallScore}>
                          <span className={styles.autoCalculated}>{editingPlayer.tiers.overall}</span>
                          <small className={styles.autoLabel}>Auto-calculated</small>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="101"
                          value={editingPlayer.tiers[mode.id as keyof typeof editingPlayer.tiers]}
                          onChange={(e) => updateEditingPlayer(`tiers.${mode.id}`, e.target.value)}
                          className={styles.tierInput}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  Add Hidden Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hidden Player Modal */}
      {(editingPlayer && showEditModal) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>🔒 Edit Hidden Player - {editingPlayer.minecraftName}</h2>
              <button onClick={handleCancel} className={styles.closeButton}>×</button>
            </div>
            
            {errors.length > 0 && (
              <div className={styles.errorList}>
                {errors.map((error, index) => (
                  <div key={index} className={styles.error}>{error}</div>
                ))}
              </div>
            )}

            <div className={styles.form}>
              <div className={styles.playerPreview}>
                <img 
                  src={`https://mc-heads.net/avatar/${editingPlayer.minecraftName}/64`}
                  alt={editingPlayer.minecraftName}
                  className={styles.previewAvatar}
                  onError={(e) => {
                    e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
                  }}
                />
                <div className={styles.previewInfo}>
                  <h3>🔒 {editingPlayer.minecraftName}</h3>
                  <p>{editingPlayer.name}</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Minecraft Name</label>
                <input
                  type="text"
                  value={editingPlayer.minecraftName}
                  onChange={(e) => updateEditingPlayer('minecraftName', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => updateEditingPlayer('name', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Region</label>
                <select
                  value={editingPlayer.region}
                  onChange={(e) => updateEditingPlayer('region', e.target.value)}
                  className={styles.select}
                >
                  <option value="NA">NA</option>
                  <option value="EU">EU</option>
                  <option value="AS">AS</option>
                  <option value="OCE">OCE</option>
                </select>
              </div>

              <div className={styles.tiersSection}>
                <h3>Hidden Game Mode Tiers</h3>
                <div className={styles.tiersGrid}>
                  {gameModes.map(mode => {
                    const currentScore = editingPlayer.tiers[mode.id as keyof typeof editingPlayer.tiers];
                    const currentTier = getTierName(currentScore, mode.id === 'overall');
                    return (
                      <div key={mode.id} className={styles.tierGroup}>
                        <label>{mode.icon} {mode.name}</label>
                        {mode.id === 'overall' ? (
                          <div className={styles.overallScore}>
                            <span className={styles.autoCalculated}>{currentScore}</span>
                            <small className={styles.autoLabel}>Auto-calculated</small>
                          </div>
                        ) : (
                          <>
                            <input
                              type="number"
                              min="0"
                              max="101"
                              value={currentScore}
                              onChange={(e) => updateEditingPlayer(`tiers.${mode.id}`, e.target.value)}
                              className={styles.tierInput}
                            />
                            {currentScore > 0 && (
                              <span className={`${styles.currentTier} ${getTierColorClass(currentScore, mode.id === 'overall')}`}>
                                {currentTier}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className={styles.modal}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <h2>Delete Hidden Player</h2>
            </div>
            
            <div className={styles.confirmContent}>
              <div className={styles.deletePlayerInfo}>
                <img 
                  src={`https://mc-heads.net/avatar/${playerToDelete.minecraftName}/64`}
                  alt={playerToDelete.minecraftName}
                  className={styles.deleteAvatar}
                  onError={(e) => {
                    e.currentTarget.src = `https://mc-heads.net/avatar/steve/64`;
                  }}
                />
                <div>
                  <h3>🔒 {playerToDelete.minecraftName}</h3>
                  <p>{playerToDelete.name}</p>
                </div>
              </div>
              
              <p className={styles.confirmText}>
                Are you sure you would like to delete this player from the tierlist?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>
            </div>
            
            <div className={styles.confirmActions}>
              <button onClick={handleDeleteCancel} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className={styles.deleteConfirmButton}>
                Delete Hidden Player
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.playersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.playerCol}>Hidden Player</div>
          <div className={styles.regionCol}>Region</div>
          <div className={styles.tiersCol}>Hidden Tiers</div>
          <div className={styles.actionsCol}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {filteredPlayers.map(player => (
            <div key={player.id} className={styles.tableRow}>
              <div className={styles.playerCol}>
                <div className={styles.playerInfo}>
                  <img 
                    src={`https://mc-heads.net/avatar/${player.minecraftName}/32`}
                    alt={player.minecraftName}
                    className={styles.avatar}
                    onError={(e) => {
                      e.currentTarget.src = `https://mc-heads.net/avatar/steve/32`;
                    }}
                  />
                  <div>
                    <div className={styles.playerName}>🔒 {player.minecraftName}</div>
                    <div className={styles.displayName}>{player.name}</div>
                  </div>
                </div>
              </div>
              
              <div className={styles.regionCol}>
                <span className={`${styles.regionBadge} ${getRegionColorClass(player.region)}`}>
                  {normalizeRegion(player.region)}
                </span>
              </div>
              
              <div className={styles.tiersCol}>
                <div className={styles.tiersGrid}>
                  {gameModes.map(mode => {
                    const score = player.tiers[mode.id as keyof typeof player.tiers];
                    const tier = getTierName(score, mode.id === 'overall');
                    return (
                      <div key={mode.id} className={styles.tierBadge}>
                        <span className={styles.tierIcon}>{mode.icon}</span>
                        <span className={styles.tierScore}>{score}</span>
                        {score > 0 && mode.id !== 'overall' && (
                          <span className={`${styles.tierName} ${getTierColorClass(score, mode.id === 'overall')}`}>
                            {tier}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={styles.actionsCol}>
                <button onClick={() => handleEdit(player)} className={styles.editBtn}>Edit</button>
                <button onClick={() => handleDeleteClick(player)} className={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <div className={styles.emptyState}>
          <p>No hidden players found matching your search.</p>
        </div>
      )}
    </div>
  );
}