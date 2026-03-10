import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Check, Settings } from 'lucide-react';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import TileGrid from './components/TileGrid';
import WeatherWidget from './components/WeatherWidget';
import AddTileModal from './components/AddTileModal';
import SettingsPanel from './components/SettingsPanel';
import AuroraShader from './components/backgrounds/AuroraShader';
import FallingPattern from './components/backgrounds/FallingPattern';

const getStorage = () => {
  if (typeof browser !== 'undefined' && browser?.storage?.local) return browser.storage.local;
  if (typeof chrome !== 'undefined' && chrome?.storage?.local) return chrome.storage.local;
  return null;
};

const TILES_KEY = 'ntplus_tiles';
const SETTINGS_KEY = 'ntplus_settings';

const DEFAULT_TILES = [
  { id: 'default-1', name: 'Google', url: 'https://google.com', icon: '', iconUrl: '', color: '#4285F4' },
  { id: 'default-2', name: 'YouTube', url: 'https://youtube.com', icon: '', iconUrl: '', color: '#FF0000' },
  { id: 'default-3', name: 'GitHub', url: 'https://github.com', icon: '', iconUrl: '', color: '#6e40c9' },
  { id: 'default-4', name: 'Reddit', url: 'https://reddit.com', icon: '', iconUrl: '', color: '#FF4500' },
  { id: 'default-5', name: 'Twitter', url: 'https://x.com', icon: '', iconUrl: '', color: '#1DA1F2' },
  { id: 'default-6', name: 'Twitch', url: 'https://twitch.tv', icon: '', iconUrl: '', color: '#9146FF' },
];

const DEFAULT_SETTINGS = {
  background: {
    type: 'solid',       // 'solid' | 'gradient' | 'image'
    color: '#020617',    // base dark color
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    imageUrl: '',
    imageBlur: 8,
    imageDarkness: 50,
  },
  shader: {
    type: 'none',     // 'aurora' | 'falling' | 'none'
    speed: 1.0,       // aurora speed multiplier
    color: '#2596be', // falling pattern line color
    opacity: 0.9,
  },
  tiles: {
    size: 100,
    columns: 7,
    gap: 16,
    showShortcuts: false,
    shortcutStyle: 'badge',   // 'badge' | 'dot'
    shortcutColor: '',        // '' = default white/glass, any hex = tinted
    hoverShadow: false,
  },
  fonts: {
    global: '',       // if set, used as fallback for all below
    time: '',
    date: '',
    greeting: '',
    search: '',
    tiles: '',
    shortcuts: '',
    custom: [],       // user-added Google Font names
  },
  clock: {
    hour12: true,
    showSeconds: false,
    dateFormat: 'full',    // 'full' | 'short' | 'numeric'
    showGreeting: true,
    timeSize: 72,
    dateSize: 14,
  },
  search: {
    suggestions: true,
  },
};

async function loadFromStorage(storage, key) {
  if (!storage) return null;
  try {
    const result = await new Promise((resolve) => {
      const r = storage.get(key, resolve);
      if (r && typeof r.then === 'function') r.then(resolve);
    });
    return result?.[key] ?? null;
  } catch { return null; }
}

async function saveToStorage(storage, key, value) {
  if (!storage) return;
  try {
    const p = storage.set({ [key]: value });
    if (p && typeof p.then === 'function') await p;
  } catch {}
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export default function App() {
  const [tiles, setTiles] = useState([]);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modalState, setModalState] = useState({ open: false, tile: null });
  const [loaded, setLoaded] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [hasQuery, setHasQuery] = useState(false);
  const storage = getStorage();

  // Load state from storage on mount
  useEffect(() => {
    Promise.all([
      loadFromStorage(storage, TILES_KEY),
      loadFromStorage(storage, SETTINGS_KEY),
    ]).then(([savedTiles, savedSettings]) => {
      if (Array.isArray(savedTiles) && savedTiles.length > 0) setTiles(savedTiles);
      else setTiles(DEFAULT_TILES);
      if (savedSettings) setAppSettings(s => deepMerge(s, savedSettings));
      setLoaded(true);
    });
  }, []);

  // Save tiles on change
  useEffect(() => { if (loaded) saveToStorage(storage, TILES_KEY, tiles); }, [tiles, loaded]);
  // Save settings on change
  useEffect(() => { if (loaded) saveToStorage(storage, SETTINGS_KEY, appSettings); }, [appSettings, loaded]);

  // Load Google Fonts and set CSS custom properties for font settings
  useEffect(() => {
    const f = appSettings.fonts ?? {};
    const resolve = (specific) => specific || f.global || '';
    const assignments = {
      '--font-time':      resolve(f.time),
      '--font-date':      resolve(f.date),
      '--font-greeting':  resolve(f.greeting),
      '--font-search':    resolve(f.search),
      '--font-tiles':     resolve(f.tiles),
      '--font-shortcuts': resolve(f.shortcuts),
    };
    const root = document.documentElement;
    for (const [k, v] of Object.entries(assignments)) {
      if (v) root.style.setProperty(k, `'${v}', system-ui, sans-serif`);
      else root.style.removeProperty(k);
    }
    // Dynamically inject Google Fonts link for any selected fonts
    const MONO = new Set(['JetBrains Mono', 'Fira Code', 'Space Mono', 'IBM Plex Mono', 'Geist Mono', 'Inconsolata', 'Source Code Pro']);
    const SYS = new Set(['', 'Times New Roman', 'Georgia', 'Arial', 'Courier New']);
    const fontVals = Object.entries(f).filter(([k]) => k !== 'custom').map(([, v]) => v);
    const customVals = Array.isArray(f.custom) ? f.custom : [];
    const used = [...new Set([...fontVals, ...customVals].filter(v => v && !SYS.has(v)))];
    if (used.length === 0) { document.getElementById('ntplus-gfonts')?.remove(); return; }
    const families = used.map(font => {
      const wgts = MONO.has(font) ? '400;500' : '300;400;500;600';
      return `family=${font.replace(/ /g, '+')}:wght@${wgts}`;
    }).join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    let link = document.getElementById('ntplus-gfonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'ntplus-gfonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [appSettings.fonts]);

  // Mouse corner detection for FAB
  useEffect(() => {
    if (editMode) { setShowFab(true); return; }
    const onMove = (e) => {
      setShowFab(
        e.clientX > window.innerWidth - 120 && e.clientY > window.innerHeight - 120
      );
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [editMode]);

  const handleUpdateSettings = useCallback((path, value) => {
    setAppSettings(prev => {
      const parts = path.split('.');
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  }, []);

  const handleReorder = useCallback((newTiles) => setTiles(newTiles), []);
  const handleOpenAdd = useCallback(() => setModalState({ open: true, tile: null }), []);
  const handleOpenEdit = useCallback((tile) => setModalState({ open: true, tile }), []);
  const handleCloseModal = useCallback(() => setModalState({ open: false, tile: null }), []);

  const handleSaveTile = useCallback((tileData) => {
    if (tileData.id) setTiles(prev => prev.map(t => t.id === tileData.id ? tileData : t));
    else setTiles(prev => [...prev, { ...tileData, id: `tile-${Date.now()}` }]);
    setModalState({ open: false, tile: null });
  }, []);

  const handleDeleteTile = useCallback((tileId) => {
    setTiles(prev => prev.filter(t => t.id !== tileId));
    setModalState({ open: false, tile: null });
  }, []);

  const handleImportTiles = useCallback((imported) => {
    setTiles(imported.map((t, i) => ({ ...t, id: t.id || `imported-${Date.now()}-${i}` })));
  }, []);

  const handleImport = useCallback(({ tiles: importedTiles, settings: importedSettings }) => {
    if (importedTiles) {
      setTiles(importedTiles.map((t, i) => ({ ...t, id: t.id || `imported-${Date.now()}-${i}` })));
    }
    if (importedSettings) {
      setAppSettings(prev => deepMerge(prev, importedSettings));
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      if (prev) setShowSettings(false);
      return !prev;
    });
  }, []);

  // Tile keyboard shortcuts — hold to preview, release to navigate
  const [heldShortcut, setHeldShortcut] = useState(null);
  const cancelShortcut = useRef(false); // set when another key is pressed during hold

  useEffect(() => {
    const onDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const key = e.key.toLowerCase();
      // If already holding a shortcut and a different key is pressed, cancel
      setHeldShortcut(prev => {
        if (prev !== null && prev !== key) { cancelShortcut.current = true; return null; }
        return prev;
      });
      const match = tiles.find(t => t.shortcut && t.shortcut.toLowerCase() === key);
      if (match) { e.preventDefault(); cancelShortcut.current = false; setHeldShortcut(key); }
    };
    const onUp = (e) => {
      const key = e.key.toLowerCase();
      setHeldShortcut(prev => {
        if (prev === key) {
          if (!cancelShortcut.current) {
            const match = tiles.find(t => t.shortcut && t.shortcut.toLowerCase() === key);
            if (match) window.location.href = match.url;
          }
          cancelShortcut.current = false;
          return null;
        }
        return prev;
      });
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [tiles]);

  const { background, shader, tiles: tileSettings, search: searchSettings = {}, clock: clockSettings = {} } = appSettings;

  // Don't render until storage is loaded — prevents flash of default settings
  if (!loaded) return <div className="w-full h-screen" style={{ background: '#020617' }} />;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: background.color }}>

      {/* ── LAYER 1: Static background ── */}
      {background.type === 'gradient' && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ background: background.gradient }}
        />
      )}
      {background.type === 'image' && background.imageUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div style={{ position: 'absolute', inset: `-${background.imageBlur * 3}px`, backgroundImage: `url(${background.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: `blur(${background.imageBlur}px)` }} />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${background.imageDarkness / 100})` }} />
        </div>
      )}

      {/* ── LAYER 2: Shader overlay ── */}
      {shader.type === 'aurora' && (
        <div
          className="fixed inset-0 z-1 pointer-events-none"
          style={{ opacity: shader.opacity }}
        >
          <AuroraShader speed={shader.speed} />
        </div>
      )}
      {shader.type === 'falling' && (
        <div
          className="fixed inset-0 z-1 pointer-events-none"
          style={{ opacity: shader.opacity }}
        >
          <FallingPattern color={shader.color} />
        </div>
      )}

      {/* ── LAYER 3: Header ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-end items-start p-6">
        <WeatherWidget />
      </div>

      {/* ── LAYER 4: Main content ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-0">
        <div>
          <Clock clockSettings={clockSettings} />
        </div>

        <div
          className="mt-8 w-full px-6"
          style={{ maxWidth: '560px', zIndex: 20, position: 'relative' }}
        >
          <SearchBar
            showSuggestions={searchSettings.suggestions ?? true}
            onHasQuery={setHasQuery}
          />
        </div>

        <motion.div
          className="mt-8 w-full px-6"
          animate={{ opacity: hasQuery ? 0 : 1 }}
          transition={{ duration: 0.18 }}
          style={{ pointerEvents: hasQuery ? 'none' : 'auto' }}
        >
          <TileGrid
            tiles={tiles}
            editMode={editMode}
            onReorder={handleReorder}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            tileSize={tileSettings.size}
            columns={tileSettings.columns}
            gap={tileSettings.gap}
            heldShortcut={heldShortcut}
            showShortcuts={tileSettings.showShortcuts}
            shortcutStyle={tileSettings.shortcutStyle}
            shortcutColor={tileSettings.shortcutColor}
            hoverShadow={tileSettings.hoverShadow}
          />
        </motion.div>
      </div>

      {/* ── FAB ── */}
      <AnimatePresence>
        {(showFab || editMode) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-6 right-6 z-30"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="glass flex items-center overflow-hidden"
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Settings button — slides in from right when edit mode activates */}
              <AnimatePresence initial={false}>
                {editMode && (
                  <motion.button
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 36, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    onClick={() => setShowSettings(v => !v)}
                    className={`h-9 flex items-center justify-center cursor-pointer transition-colors duration-150 flex-shrink-0 ${showSettings ? 'text-[#2596be]' : 'text-white/55 hover:text-white'}`}
                    title="Settings"
                    style={{ overflow: 'hidden' }}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Divider */}
              <AnimatePresence initial={false}>
                {editMode && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 1, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="h-5 flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  />
                )}
              </AnimatePresence>

              {/* Pencil / Check button — always visible */}
              <button
                onClick={toggleEditMode}
                className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-150 flex-shrink-0 ${editMode ? 'text-[#2596be]' : 'text-white/55 hover:text-white'}`}
                title={editMode ? 'Done editing' : 'Edit tiles'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {editMode
                    ? <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}><Check className="w-4 h-4" /></motion.span>
                    : <motion.span key="pencil" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}><Pencil className="w-4 h-4" /></motion.span>
                  }
                </AnimatePresence>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings panel ── */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Click-outside backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-39"
              onClick={() => setShowSettings(false)}
            />
            <SettingsPanel
              settings={appSettings}
              onUpdateSettings={handleUpdateSettings}
              onClose={() => setShowSettings(false)}
              tiles={tiles}
              onImportTiles={handleImportTiles}
              onImport={handleImport}
              onDone={() => { setShowSettings(false); setEditMode(false); }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Tile modal ── */}
      <AnimatePresence>
        {modalState.open && (
          <AddTileModal
            tile={modalState.tile}
            onSave={handleSaveTile}
            onDelete={handleDeleteTile}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
