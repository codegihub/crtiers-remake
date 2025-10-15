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
  tiers: {
    bed: number;
    cart: number;
    creeper: number;
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

//top player
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

// gamemode leaderboard
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

// search name and mc name
export async function getPlayerByUsername(username: string): Promise<Player | null> {
  try {
    const playersRef = collection(db, 'players');
    
    // try exact match first
    let q = query(playersRef, where('minecraftName', '==', username));
    let querySnapshot = await getDocs(q);
    
    // ff not found try name field
    if (querySnapshot.empty) {
      q = query(playersRef, where('name', '==', username));
      querySnapshot = await getDocs(q);
    }
    
    // if still not found  try case-insensitive search
    if (querySnapshot.empty) {
      const allPlayersQuery = await getDocs(playersRef);
      const allPlayers = allPlayersQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      
      //find player with case-insensitive match
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

// search players by username
export async function searchPlayers(searchTerm: string): Promise<Player[]> {
  try {
    const playersRef = collection(db, 'players');
    

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
    // overall tier system
    if (tierNumber >= 400) return 'HT1';
    if (tierNumber >= 350) return 'LT1';
    if (tierNumber >= 300) return 'HT2';
    if (tierNumber >= 280) return 'LT2';
    if (tierNumber >= 240) return 'HT3';
    if (tierNumber >= 200) return 'LT3';
    if (tierNumber >= 150) return 'HT4';
    if (tierNumber >= 80) return 'LT4';
    if (tierNumber >= 25) return 'HT5';
    if (tierNumber >= 10) return 'LT5';
    return 'LT5';
  } else {
    // gamemode tier system (0-101 scale)
    if (tierNumber >= 60) return 'HT1';
    if (tierNumber >= 45) return 'LT1';
    if (tierNumber >= 30) return 'HT2';
    if (tierNumber >= 20) return 'LT2';
    if (tierNumber >= 10) return 'HT3';
    if (tierNumber >= 6) return 'LT3';
    if (tierNumber >= 4) return 'HT4';
    if (tierNumber >= 3) return 'LT4';
    if (tierNumber >= 2) return 'HT5';
    if (tierNumber >= 1) return 'LT5';
    return 'Unranked';
  }
}

// Helper function to get tier color class
export function getTierColorClass(tierNumber: number, isOverall: boolean = false): string {
  const tier = getTierName(tierNumber, isOverall);
  return `tier${tier.replace('L', 'H')}`;
}

// Helper function to get region color class
export function getRegionColorClass(region: string): string {
  const upperRegion = region.toUpperCase();
  return `region${upperRegion}`;
}

// region display
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

// Helper function to calculate regional rank from leaderboard data
export async function getPlayerRegionalRank(gameMode: string, playerScore: number, region: string): Promise<number> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(
      playersRef,
      where('region', '==', region.toUpperCase()),
      where(`tiers.${gameMode}`, '>', playerScore)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size + 1; // +1 because this player's rank is one more than players above them
  } catch (error) {
    console.error('Error calculating regional rank:', error);
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
