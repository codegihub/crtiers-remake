import { 
  collection, 
  doc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Player {
  id: string;
  minecraftName: string;
  name: string;
  region: string;
  uuid?: string | null;
  tiers: {
    axe: number;
    mace: number;
    nethop: number;
    overall: number;
    pot: number;
    smp: number;
    sword: number;
    uhc: number;
    vanilla: number;
  };
}

export interface HiddenPlayer {
  id: string;
  minecraftName: string;
  name: string;
  region: string;
  uuid?: string | null;
  tiers: {
    bed: number;
    cart: number;
    creeper: number;
    spleef: number;
    overall: number;
  };
}

// CHANGELOGS
export interface TierChangeEntry {
  gameMode: string;
  previousScore: number;
  newScore: number;
}

export interface ChangelogEntry {
  id?: string;
  playerId: string;
  minecraftName: string;
  isHiddenPlayer: boolean;
  changes: TierChangeEntry[];
  createdAt: Timestamp | null;
}

export interface GameModeLeaderboard {
  gameMode: string;
  players: Player[];
}

// Get top player for a specific game mode
export async function getTopPlayerForGameMode(gameMode: string): Promise<Player | null> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(
      playersRef,
      orderBy(`tiers.${gameMode}`, 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Player;
  } catch (error) {
    console.error('Error fetching top player:', error);
    return null;
  }
}

// Get leaderboard for a specific game mode
export async function getLeaderboard(gameMode: string, limitCount: number = 50): Promise<Player[]> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(
      playersRef,
      orderBy(`tiers.${gameMode}`, 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Player));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

// Get player by username (searches both minecraftName and name fields, case-insensitive)
export async function getPlayerByUsername(username: string): Promise<Player | null> {
  try {
    const playersRef = collection(db, 'players');
    
    // Try exact match first
    let q = query(playersRef, where('minecraftName', '==', username));
    let querySnapshot = await getDocs(q);
    
    // If not found, try name field
    if (querySnapshot.empty) {
      q = query(playersRef, where('name', '==', username));
      querySnapshot = await getDocs(q);
    }
    
    // If still not found, try case-insensitive search
    if (querySnapshot.empty) {
      const allPlayersQuery = await getDocs(playersRef);
      const allPlayers = allPlayersQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      
      // Find player with case-insensitive match
      const foundPlayer = allPlayers.find(player => 
        player.minecraftName.toLowerCase() === username.toLowerCase() ||
        player.name.toLowerCase() === username.toLowerCase()
      );
      
      if (foundPlayer) {
        return foundPlayer;
      }
    }
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Player;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

// Search players by username (partial match)
export async function searchPlayers(searchTerm: string): Promise<Player[]> {
  try {
    const playersRef = collection(db, 'players');
    
    // Firestore doesn't support case-insensitive queries or partial matches natively
    // This is a simple implementation that gets all players and filters client-side
    // For production, consider using Algolia or similar search service
    const querySnapshot = await getDocs(playersRef);
    
    const players = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Player));
    
    return players.filter(player => 
      player.minecraftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

// Helper function to convert tier number to tier name
export function getTierName(tierNumber: number, isOverall: boolean = false): string {
  if (isOverall) {
    // Overall tier system (keep the old system for overall)
    if (tierNumber >= 2000) return 'S+';
    if (tierNumber >= 1800) return 'S';
    if (tierNumber >= 1600) return 'A';
    if (tierNumber >= 1400) return 'B';
    if (tierNumber >= 1200) return 'C';
    if (tierNumber >= 1000) return 'D';
    return 'F';
  } else {
    // Gamemode tier system (0-100 scale)
    if (tierNumber >= 95) return 'S+';
    if (tierNumber >= 90) return 'S';
    if (tierNumber >= 85) return 'A+';
    if (tierNumber >= 80) return 'A';
    if (tierNumber >= 75) return 'B+';
    if (tierNumber >= 70) return 'B';
    if (tierNumber >= 65) return 'C+';
    if (tierNumber >= 60) return 'C';
    if (tierNumber >= 55) return 'D+';
    if (tierNumber >= 50) return 'D';
    if (tierNumber >= 45) return 'E+';
    if (tierNumber >= 40) return 'E';
    if (tierNumber >= 35) return 'F+';
    return 'F';
  }
}

// Helper function to get tier color class
export function getTierColorClass(tierNumber: number, isOverall: boolean = false): string {
  const tier = getTierName(tierNumber, isOverall);
  return `tier${tier.replace('+', 'Plus')}`;
}

// Helper function to get region color class
export function getRegionColorClass(region: string): string {
  const upperRegion = region.toUpperCase();
  return `region${upperRegion}`;
}

// Helper function to normalize region display
export function normalizeRegion(region: string): string {
  return region.toUpperCase();
}

// Helper function to calculate rank from leaderboard data
export async function getPlayerRank(gameMode: string, playerScore: number): Promise<number> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(
      playersRef,
      where(`tiers.${gameMode}`, '>', playerScore)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size + 1; // +1 because this player's rank is one more than players above them
  } catch (error) {
    console.error('Error calculating rank:', error);
    return 1;
  }
}

// Get all game mode top players for the leaderboards page
export async function getAllGameModeTopPlayers(): Promise<{ [gameMode: string]: Player | null }> {
  const gameModes = ['overall', 'vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace'];
  const topPlayers: { [gameMode: string]: Player | null } = {};
  
  for (const gameMode of gameModes) {
    topPlayers[gameMode] = await getTopPlayerForGameMode(gameMode);
  }
  
  return topPlayers;
}

// HIDDEN TIER FUNCTIONS

// Get top player for a specific game mode from hidden-players collection
export async function getHiddenTopPlayerForGameMode(gameMode: string): Promise<HiddenPlayer | null> {
  try {
    const playersRef = collection(db, 'hidden-players');
    const q = query(
      playersRef,
      orderBy(`tiers.${gameMode}`, 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as HiddenPlayer;
  } catch (error) {
    console.error('Error fetching hidden top player:', error);
    return null;
  }
}

// Get leaderboard for a specific game mode from hidden-players collection
export async function getHiddenLeaderboard(gameMode: string, limitCount: number = 50): Promise<HiddenPlayer[]> {
  try {
    const playersRef = collection(db, 'hidden-players');
    const q = query(
      playersRef,
      orderBy(`tiers.${gameMode}`, 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HiddenPlayer));
  } catch (error) {
    console.error('Error fetching hidden leaderboard:', error);
    return [];
  }
}

// Get hidden player by username (searches both minecraftName and name fields, case-insensitive)
export async function getHiddenPlayerByUsername(username: string): Promise<HiddenPlayer | null> {
  try {
    const playersRef = collection(db, 'hidden-players');
    
    // Try exact match first
    let q = query(playersRef, where('minecraftName', '==', username));
    let querySnapshot = await getDocs(q);
    
    // If not found, try name field
    if (querySnapshot.empty) {
      q = query(playersRef, where('name', '==', username));
      querySnapshot = await getDocs(q);
    }
    
    // If still not found, try case-insensitive search
    if (querySnapshot.empty) {
      const allPlayersQuery = await getDocs(playersRef);
      const allPlayers = allPlayersQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HiddenPlayer));
      
      // Find player with case-insensitive match
      const foundPlayer = allPlayers.find(player => 
        player.minecraftName.toLowerCase() === username.toLowerCase() ||
        player.name.toLowerCase() === username.toLowerCase()
      );
      
      if (foundPlayer) {
        return foundPlayer;
      }
    }
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as HiddenPlayer;
  } catch (error) {
    console.error('Error fetching hidden player:', error);
    return null;
  }
}

// Search hidden players by username (partial match)
export async function searchHiddenPlayers(searchTerm: string): Promise<HiddenPlayer[]> {
  try {
    const playersRef = collection(db, 'hidden-players');
    
    const querySnapshot = await getDocs(playersRef);
    
    const players = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HiddenPlayer));
    
    return players.filter(player => 
      player.minecraftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching hidden players:', error);
    return [];
  }
}

// Get all hidden game mode top players
export async function getAllHiddenGameModeTopPlayers(): Promise<{ [gameMode: string]: HiddenPlayer | null }> {
  const gameModes = ['overall', 'bed', 'cart', 'creeper', 'spleef'];
  const topPlayers: { [gameMode: string]: HiddenPlayer | null } = {};
  
  for (const gameMode of gameModes) {
    topPlayers[gameMode] = await getHiddenTopPlayerForGameMode(gameMode);
  }
  
  return topPlayers;
}

// Helper function to calculate rank from hidden leaderboard data
export async function getHiddenPlayerRank(gameMode: string, playerScore: number): Promise<number> {
  try {
    const playersRef = collection(db, 'hidden-players');
    const q = query(
      playersRef,
      where(`tiers.${gameMode}`, '>', playerScore)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size + 1; // +1 because this player's rank is one more than players above them
  } catch (error) {
    console.error('Error calculating hidden rank:', error);
    return 1;
  }
}

// ADMIN CRUD FUNCTIONS

// Regular Players CRUD
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const playersRef = collection(db, 'players');
    const querySnapshot = await getDocs(playersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Player));
  } catch (error) {
    console.error('Error fetching all players:', error);
    return [];
  }
}

export async function addPlayer(playerData: Omit<Player, 'id'>): Promise<string | null> {
  try {
    const playersRef = collection(db, 'players');
    const docRef = await addDoc(playersRef, playerData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding player:', error);
    return null;
  }
}

export async function updatePlayer(playerId: string, playerData: Partial<Omit<Player, 'id'>>): Promise<boolean> {
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, playerData);
    return true;
  } catch (error) {
    console.error('Error updating player:', error);
    return false;
  }
}

export async function deletePlayer(playerId: string): Promise<boolean> {
  try {
    const playerRef = doc(db, 'players', playerId);
    await deleteDoc(playerRef);
    return true;
  } catch (error) {
    console.error('Error deleting player:', error);
    return false;
  }
}

// Hidden Players CRUD
export async function getAllHiddenPlayers(): Promise<HiddenPlayer[]> {
  try {
    const playersRef = collection(db, 'hidden-players');
    const querySnapshot = await getDocs(playersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HiddenPlayer));
  } catch (error) {
    console.error('Error fetching all hidden players:', error);
    return [];
  }
}

export async function addHiddenPlayer(playerData: Omit<HiddenPlayer, 'id'>): Promise<string | null> {
  try {
    const playersRef = collection(db, 'hidden-players');
    const docRef = await addDoc(playersRef, playerData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding hidden player:', error);
    return null;
  }
}

export async function updateHiddenPlayer(playerId: string, playerData: Partial<Omit<HiddenPlayer, 'id'>>): Promise<boolean> {
  try {
    const playerRef = doc(db, 'hidden-players', playerId);
    await updateDoc(playerRef, playerData);
    return true;
  } catch (error) {
    console.error('Error updating hidden player:', error);
    return false;
  }
}

export async function deleteHiddenPlayer(playerId: string): Promise<boolean> {
  try {
    const playerRef = doc(db, 'hidden-players', playerId);
    await deleteDoc(playerRef);
    return true;
  } catch (error) {
    console.error('Error deleting hidden player:', error);
    return false;
  }
}

// Validation helpers
export function validatePlayerData(playerData: Partial<Player | HiddenPlayer>): string[] {
  const errors: string[] = [];
  
  if (playerData.minecraftName && playerData.minecraftName.trim().length < 3) {
    errors.push('Minecraft name must be at least 3 characters long');
  }
  
  if (playerData.region && !['NA', 'EU', 'AS', 'OCE'].includes(playerData.region.toUpperCase())) {
    errors.push('Region must be NA, EU, AS, or OCE');
  }
  
  if (playerData.tiers) {
    Object.entries(playerData.tiers).forEach(([gameMode, score]) => {
      if (typeof score !== 'number' || score < 0) {
        errors.push(`${gameMode} score must be a positive number`);
      }
      
      // Validate score ranges
      if (gameMode === 'overall') {
        if (score > 808) {
          errors.push('Overall score should not exceed 808');
        }
      } else {
        if (score > 101) {
          errors.push(`${gameMode} score should not exceed 101`);
        }
      }
    });
  }
  
  return errors;
}

// MOJANG API HELPERS
export async function getUuidFromUsername(username: string): Promise<string | null> {
  try {
    // Try main API first
    let response = await fetch(`/api/mojang/uuid/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If main API fails, try fallback
    if (!response.ok && response.status === 500) {
      console.log(`Main API failed for ${username}, trying fallback...`);
      response = await fetch(`/api/mojang/uuid-fallback/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Username ${username} not found`);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error(`Error fetching UUID for ${username}:`, error);
    return null;
  }
}

export async function getUsernameFromUuid(uuid: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/mojang/username/${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`UUID ${uuid} not found`);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error(`Error fetching username for UUID ${uuid}:`, error);
    return null;
  }
}

// PLAYER UUID SYNC FUNCTIONS
export async function syncPlayerUuid(player: Player): Promise<{ updated: boolean; changes: string[] }> {
  const changes: string[] = [];
  let updated = false;

  try {
    if (!player.uuid) {
      // Player doesn't have UUID, try to fetch it
      const uuid = await getUuidFromUsername(player.minecraftName);
      if (uuid) {
        await updatePlayer(player.id, { uuid });
        changes.push(`Added UUID: ${uuid}`);
        updated = true;
      } else {
        changes.push('UUID fetch failed - username may not exist');
      }
    } else {
      // Player has UUID, check if username changed
      const currentUsername = await getUsernameFromUuid(player.uuid);
      if (currentUsername && currentUsername !== player.minecraftName) {
        await updatePlayer(player.id, { minecraftName: currentUsername });
        changes.push(`Username updated: ${player.minecraftName} → ${currentUsername}`);
        updated = true;
      } else if (!currentUsername) {
        changes.push('Username fetch failed - UUID may be invalid');
      } else {
        changes.push('No changes needed');
      }
    }
  } catch (error) {
    console.error(`Error syncing player ${player.minecraftName}:`, error);
    changes.push(`Sync failed: ${error}`);
  }

  return { updated, changes };
}

export async function syncHiddenPlayerUuid(player: HiddenPlayer): Promise<{ updated: boolean; changes: string[] }> {
  const changes: string[] = [];
  let updated = false;

  try {
    if (!player.uuid) {
      // Player doesn't have UUID, try to fetch it
      const uuid = await getUuidFromUsername(player.minecraftName);
      if (uuid) {
        await updateHiddenPlayer(player.id, { uuid });
        changes.push(`Added UUID: ${uuid}`);
        updated = true;
      } else {
        changes.push('UUID fetch failed - username may not exist');
      }
    } else {
      // Player has UUID, check if username changed
      const currentUsername = await getUsernameFromUuid(player.uuid);
      if (currentUsername && currentUsername !== player.minecraftName) {
        await updateHiddenPlayer(player.id, { minecraftName: currentUsername });
        changes.push(`Username updated: ${player.minecraftName} → ${currentUsername}`);
        updated = true;
      } else if (!currentUsername) {
        changes.push('Username fetch failed - UUID may be invalid');
      } else {
        changes.push('No changes needed');
      }
    }
  } catch (error) {
    console.error(`Error syncing hidden player ${player.minecraftName}:`, error);
    changes.push(`Sync failed: ${error}`);
  }

  return { updated, changes };
}

export async function syncAllPlayersUuids(): Promise<{ 
  regularPlayers: { total: number; updated: number; results: Array<{ player: string; changes: string[] }> };
  hiddenPlayers: { total: number; updated: number; results: Array<{ player: string; changes: string[] }> };
}> {
  console.log('Starting UUID sync for all players...');
  
  const results = {
    regularPlayers: { total: 0, updated: 0, results: [] as Array<{ player: string; changes: string[] }> },
    hiddenPlayers: { total: 0, updated: 0, results: [] as Array<{ player: string; changes: string[] }> }
  };

  try {
    // Sync regular players
    const regularPlayers = await getAllPlayers();
    results.regularPlayers.total = regularPlayers.length;
    
    for (const player of regularPlayers) {
      const syncResult = await syncPlayerUuid(player);
      results.regularPlayers.results.push({
        player: player.minecraftName,
        changes: syncResult.changes
      });
      
      if (syncResult.updated) {
        results.regularPlayers.updated++;
      }
      
      // Rate limiting: wait 100ms between requests to respect Mojang API limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sync hidden players
    const hiddenPlayers = await getAllHiddenPlayers();
    results.hiddenPlayers.total = hiddenPlayers.length;
    
    for (const player of hiddenPlayers) {
      const syncResult = await syncHiddenPlayerUuid(player);
      results.hiddenPlayers.results.push({
        player: player.minecraftName,
        changes: syncResult.changes
      });
      
      if (syncResult.updated) {
        results.hiddenPlayers.updated++;
      }
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('Error during UUID sync:', error);
  }

  console.log('UUID sync completed:', results);
  return results;
}

// CHANGELOG HELPERS
export async function addChangelog(entry: Omit<ChangelogEntry, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const changelogsRef = collection(db, 'changelogs');
    const docRef = await addDoc(changelogsRef, {
      ...entry,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding changelog:', error);
    return null;
  }
}

export async function getChangelogs(limitCount: number = 100): Promise<ChangelogEntry[]> {
  try {
    const changelogsRef = collection(db, 'changelogs');
    const q = query(
      changelogsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as ChangelogEntry);
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return [];
  }
}

export async function deleteChangelog(changelogId: string): Promise<boolean> {
  try {
    const changelogRef = doc(db, 'changelogs', changelogId);
    await deleteDoc(changelogRef);
    return true;
  } catch (error) {
    console.error('Error deleting changelog:', error);
    return false;
  }
}