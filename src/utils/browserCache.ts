// Telumak RPG - Browser Cache & Optimistic Local Storage for Characters & Sheets
// Reduces Firestore reads and provides instantaneous local load

const CACHE_PREFIX = 'telumak_char_cache_';
const ALL_CHARS_CACHE_KEY = 'telumak_all_characters_v1';
const CACHE_TIMESTAMP_KEY = 'telumak_cache_timestamp_v1';

// Discord Channels Cache Keys
export const DISCORD_CHANNELS_CACHE_KEY = 'telumak_cached_discord_channels';
export const DISCORD_CHANNELS_TIMESTAMP_KEY = 'telumak_cached_discord_channels_timestamp';
export const DISCORD_CHANNELS_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 horas como teto de validade de fallback

export interface CachedChannelsEnvelope<T = any> {
  channels: T[];
  timestamp: number;
  version: number;
}

export function saveDiscordChannelsToCache<T = any>(channels: T[]): void {
  try {
    if (!channels || !Array.isArray(channels)) return;
    const now = Date.now();
    const payload: CachedChannelsEnvelope<T> = {
      channels,
      timestamp: now,
      version: 1
    };
    localStorage.setItem(DISCORD_CHANNELS_CACHE_KEY, JSON.stringify(payload));
    localStorage.setItem(DISCORD_CHANNELS_TIMESTAMP_KEY, now.toString());
  } catch (e) {
    console.warn('Falha ao salvar cache de canais no localStorage:', e);
  }
}

export function loadDiscordChannelsFromCache<T = any>(maxAgeMs: number = DISCORD_CHANNELS_CACHE_MAX_AGE_MS): { channels: T[]; timestamp: number; isStale: boolean } | null {
  try {
    const raw = localStorage.getItem(DISCORD_CHANNELS_CACHE_KEY);
    if (!raw) return null;

    let channels: T[] = [];
    let timestamp = 0;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.channels)) {
      channels = parsed.channels;
      timestamp = typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
    } else if (Array.isArray(parsed)) {
      // Retrocompatibilidade caso haja formato antigo sem envelope
      channels = parsed;
      const rawTs = localStorage.getItem(DISCORD_CHANNELS_TIMESTAMP_KEY);
      timestamp = rawTs ? parseInt(rawTs, 10) : 0;
    } else {
      return null;
    }

    const now = Date.now();
    const isStale = timestamp === 0 || (now - timestamp) > maxAgeMs;

    return {
      channels,
      timestamp,
      isStale
    };
  } catch (e) {
    console.warn('Falha ao carregar cache de canais do localStorage:', e);
    return null;
  }
}

export function saveCharactersToCache(characters: any[]) {
  try {
    if (!characters || !Array.isArray(characters)) return;
    localStorage.setItem(ALL_CHARS_CACHE_KEY, JSON.stringify(characters));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Falha ao salvar cache no localStorage:', e);
  }
}

export function loadCharactersFromCache(): any[] | null {
  try {
    const raw = localStorage.getItem(ALL_CHARS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Falha ao carregar cache do localStorage:', e);
    return null;
  }
}

export function saveSingleCharacterToCache(char: any) {
  try {
    if (!char || !char.id) return;
    localStorage.setItem(`${CACHE_PREFIX}${char.id}`, JSON.stringify(char));
    
    // Also update in all characters cache
    const existing = loadCharactersFromCache();
    if (existing) {
      const idx = existing.findIndex(c => c.id === char.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...char };
      } else {
        existing.push(char);
      }
      saveCharactersToCache(existing);
    }
  } catch (e) {
    console.warn('Falha ao salvar ficha individual no cache:', e);
  }
}

export function loadSingleCharacterFromCache(charId: string): any | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${charId}`);
    if (raw) return JSON.parse(raw);
    
    const all = loadCharactersFromCache();
    if (all) {
      return all.find(c => c.id === charId) || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function removeCampaignCharactersFromCache(campaignId: string, campaignName?: string) {
  try {
    const all = loadCharactersFromCache();
    if (all && Array.isArray(all)) {
      const filtered = all.filter(c => {
        const matchesId = c.campaign_id === campaignId || c.campaignId === campaignId;
        const matchesName = campaignName && (c.campaign_nome === campaignName || c.campaign_id === campaignName || c.campaignId === campaignName);
        return !matchesId && !matchesName;
      });
      saveCharactersToCache(filtered);
    }
    // Remove também chaves individuais se houver
    if (all && Array.isArray(all)) {
      all.forEach(c => {
        const matchesId = c.campaign_id === campaignId || c.campaignId === campaignId;
        const matchesName = campaignName && (c.campaign_nome === campaignName || c.campaign_id === campaignName || c.campaignId === campaignName);
        if (matchesId || matchesName) {
          localStorage.removeItem(`${CACHE_PREFIX}${c.id}`);
        }
      });
    }
  } catch (e) {
    console.warn('Erro ao limpar cache da campanha excluída:', e);
  }
}
