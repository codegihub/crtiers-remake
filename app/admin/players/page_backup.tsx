'use client';

import { useState, useEffect } from 'react';
import { 
  getAllPlayers, 
  addPlayer, 
  updatePlayer, 
  deletePlayer, 
  validatePlayerData,
  Player,
  getTierName,
  getTierColorClass,
  getRegionColorClass,
  normalizeRegion
} from '../../../lib/firestore';
import styles from './players.module.css';

const defaultTiers = {
  axe: 0,
  mace: 0,
  nethop: 0,
  overall: 0,
  pot: 0,
  smp: 0,
  sword: 0,
  uhc: 0,
  vanilla: 0,
};

const gameModes = [
  { id: 'overall', name: 'Overall', icon: '🏆' },
  { id: 'vanilla', name: 'Vanilla', icon: '🎇' },
  { id: 'uhc', name: 'UHC', icon: '💖' },
  { id: 'pot', name: 'Pot', icon: '🧪' },
  { id: 'nethop', name: 'NethPot', icon: '🔮' },
  { id: 'smp', name: 'SMP', icon: '🧿' },
  { id: 'sword', name: 'Sword', icon: '⚔️' },
  { id: 'axe', name: 'Axe', icon: '🪓' },
  { id: 'mace', name: 'Mace', icon: '🔨' },
];

interface EditingPlayer extends Player {
  isNew?: boolean;
}

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<EditingPlayer | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => 
    player.minecraftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (player: Player) => {
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
        const newId = await addPlayer(playerData);
        if (newId) {
          setSuccess('Player added successfully!');
          fetchPlayers();
          setShowAddForm(false);
        }
      } else {
        const { id, ...playerData } = editingPlayer;
        const updated = await updatePlayer(id, playerData);
        if (updated) {
          setSuccess('Player updated successfully!');
          fetchPlayers();
          setShowEditModal(false);
        }
      }
      
      setEditingPlayer(null);
      setErrors([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving player:', error);
      setErrors(['Failed to save player. Please try again.']);
    }
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    try {
      const deleted = await deletePlayer(playerToDelete.id);
      if (deleted) {
        setSuccess('Player deleted successfully!');
        fetchPlayers();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
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

  const updateEditingPlayer = (field: string, value: any) => {
    if (!editingPlayer) return;
    
    if (field.startsWith('tiers.')) {
      const tierField = field.replace('tiers.', '');
      setEditingPlayer({
        ...editingPlayer,
        tiers: {
          ...editingPlayer.tiers,
          [tierField]: parseInt(value) || 0
        }
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
        <p>Loading players...</p>
      </div>
    );
  }

  return (
    <div className={styles.playersPage}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>Regular Players Management</h1>
        <p className={styles.subtitle}>Manage player tiers and information</p>
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
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <button onClick={handleAdd} className={styles.addButton}>
          + Add New Player
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{players.length}</span>
          <span className={styles.statLabel}>Total Players</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredPlayers.length}</span>
          <span className={styles.statLabel}>Filtered Results</span>
        </div>
      </div>

      {(editingPlayer && showAddForm) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Player</h2>
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

              <div className={styles.tiersGrid}>
                {gameModes.map(mode => (
                  <div key={mode.id} className={styles.tierGroup}>
                    <label>{mode.icon} {mode.name}</label>
                    <input
                      type="number"
                      min="0"
                      max={mode.id === 'overall' ? 10000 : 100}
                      value={editingPlayer.tiers[mode.id as keyof typeof editingPlayer.tiers]}
                      onChange={(e) => updateEditingPlayer(`tiers.${mode.id}`, e.target.value)}
                      className={styles.tierInput}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  Add Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.playersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.playerCol}>Player</div>
          <div className={styles.regionCol}>Region</div>
          <div className={styles.tiersCol}>Tiers</div>
          <div className={styles.actionsCol}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {filteredPlayers.map(player => (
            <div key={player.id} className={styles.tableRow}>
              {editingPlayer?.id === player.id && !showAddForm ? (
                <>
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
                        <input
                          type="text"
                          value={editingPlayer.minecraftName}
                          onChange={(e) => updateEditingPlayer('minecraftName', e.target.value)}
                          className={styles.inlineInput}
                        />
                        <input
                          type="text"
                          value={editingPlayer.name}
                          onChange={(e) => updateEditingPlayer('name', e.target.value)}
                          className={styles.inlineInputSmall}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.regionCol}>
                    <select
                      value={editingPlayer.region}
                      onChange={(e) => updateEditingPlayer('region', e.target.value)}
                      className={styles.regionSelect}
                    >
                      <option value="NA">NA</option>
                      <option value="EU">EU</option>
                      <option value="AS">AS</option>
                      <option value="OCE">OCE</option>
                    </select>
                  </div>
                  
                  <div className={styles.tiersCol}>
                    <div className={styles.tiersEditGrid}>
                      {gameModes.slice(0, 5).map(mode => (
                        <div key={mode.id} className={styles.tierEdit}>
                          <span className={styles.tierLabel}>{mode.icon}</span>
                          <input
                            type="number"
                            min="0"
                            max={mode.id === 'overall' ? 10000 : 100}
                            value={editingPlayer.tiers[mode.id as keyof typeof editingPlayer.tiers]}
                            onChange={(e) => updateEditingPlayer(`tiers.${mode.id}`, e.target.value)}
                            className={styles.tierEditInput}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.actionsCol}>
                    {errors.length > 0 && (
                      <div className={styles.inlineErrors}>
                        {errors.map((error, index) => (
                          <div key={index} className={styles.error}>{error}</div>
                        ))}
                      </div>
                    )}
                    <button onClick={handleSave} className={styles.saveBtn}>Save</button>
                    <button onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
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
                        <div className={styles.playerName}>{player.minecraftName}</div>
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
                      {gameModes.slice(0, 5).map(mode => {
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
                    <button onClick={() => handleDelete(player)} className={styles.deleteBtn}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <div className={styles.emptyState}>
          <p>No players found matching your search.</p>
        </div>
      )}
    </div>
  );
}