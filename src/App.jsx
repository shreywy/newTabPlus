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
    blobColor: '#2596be',
    showBlobs: true,
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

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      if (prev) setShowSettings(false);
      return !prev;
    });
  }, []);

  const { background, shader, tiles: tileSettings } = appSettings;

  // Don't render until storage is loaded — prevents flash of default settings
  if (!loaded) return <div className="w-full h-screen" style={{ background: '#020617' }} />;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: background.color }}>

      {/* ── LAYER 1: Static background ── */}
      {background.type === 'solid' && background.showBlobs !== false && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-15 animate-blob" style={{ background: background.blobColor }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ background: background.blobColor }} />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000" style={{ background: background.blobColor }} />
        </div>
      )}
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
          <Clock />
        </div>

        <div
          className="mt-8 w-full px-6"
          style={{ maxWidth: '560px' }}
        >
          <SearchBar />
        </div>

        <div className="mt-8 w-full px-6">
          <TileGrid
            tiles={tiles}
            editMode={editMode}
            onReorder={handleReorder}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            tileSize={tileSettings.size}
            columns={tileSettings.columns}
            gap={tileSettings.gap}
          />
        </div>
      </div>

      {/* ── FAB: pencil icon only, near corner ── */}
      <AnimatePresence>
        {(showFab || editMode) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2"
          >
            {editMode && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setShowSettings(v => !v)}
                className={`glass glass-hover w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 ${showSettings ? 'text-[#2596be]' : 'text-white/60 hover:text-white'}`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            )}
            <button
              onClick={toggleEditMode}
              className={`glass glass-hover w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 ${editMode ? 'text-[#2596be]' : 'text-white/60 hover:text-white'}`}
              title={editMode ? 'Done editing' : 'Edit tiles'}
            >
              {editMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
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
