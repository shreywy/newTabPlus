import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, ChevronDown } from 'lucide-react';

// ── Color presets ──────────────────────────────────────────────────────────
const THEME_PRESETS = [
  // Dark classics
  { name: 'Deep Sea',        type: 'solid', color: '#020617', blobColor: '#2596be' },
  { name: 'Midnight',        type: 'solid', color: '#0d0d0d', blobColor: '#6366f1' },
  { name: 'Obsidian',        type: 'solid', color: '#13141a', blobColor: '#94a3b8' },
  { name: 'Carbon',          type: 'solid', color: '#161616', blobColor: '#78716c' },
  { name: 'Forest',          type: 'solid', color: '#0d1117', blobColor: '#22c55e' },
  // Popular themes
  { name: 'Catppuccin',      type: 'solid', color: '#1e1e2e', blobColor: '#cba6f7' },
  { name: 'Macchiato',       type: 'solid', color: '#24273a', blobColor: '#c6a0f6' },
  { name: 'Frappe',          type: 'solid', color: '#303446', blobColor: '#ca9ee6' },
  { name: 'Nord',            type: 'solid', color: '#2e3440', blobColor: '#88c0d0' },
  { name: 'Nord Polar',      type: 'solid', color: '#3b4252', blobColor: '#81a1c1' },
  { name: 'Dracula',         type: 'solid', color: '#282a36', blobColor: '#bd93f9' },
  { name: 'Tokyo Night',     type: 'solid', color: '#1a1b26', blobColor: '#7aa2f7' },
  { name: 'Tokyo Storm',     type: 'solid', color: '#24283b', blobColor: '#7dcfff' },
  { name: 'Gruvbox',         type: 'solid', color: '#282828', blobColor: '#fabd2f' },
  { name: 'Gruvbox Soft',    type: 'solid', color: '#32302f', blobColor: '#d79921' },
  { name: 'One Dark',        type: 'solid', color: '#282c34', blobColor: '#61afef' },
  { name: 'Palenight',       type: 'solid', color: '#292d3e', blobColor: '#82aaff' },
  { name: 'Rose Pine',       type: 'solid', color: '#191724', blobColor: '#eb6f92' },
  { name: 'Rose Pine Moon',  type: 'solid', color: '#232136', blobColor: '#ea9a97' },
  { name: 'Kanagawa',        type: 'solid', color: '#1f1f28', blobColor: '#7e9cd8' },
  { name: 'Everforest',      type: 'solid', color: '#2d353b', blobColor: '#a7c080' },
  { name: 'Ayu Dark',        type: 'solid', color: '#0b0e14', blobColor: '#e6b450' },
  { name: 'Solarized Dark',  type: 'solid', color: '#002b36', blobColor: '#268bd2' },
  { name: 'Monokai',         type: 'solid', color: '#272822', blobColor: '#a6e22e' },
  { name: 'Nightfox',        type: 'solid', color: '#192330', blobColor: '#719cd6' },
  { name: 'Moonfly',         type: 'solid', color: '#080808', blobColor: '#74b2ff' },
  { name: 'Material Dark',   type: 'solid', color: '#212121', blobColor: '#89ddff' },
  { name: 'Oxocarbon',       type: 'solid', color: '#161616', blobColor: '#be95ff' },
];

const GRADIENT_PRESETS = [
  { name: 'Dark Nebula',     gradient: 'radial-gradient(ellipse at 0% 0%, #242635 0%, #0a0b10 100%)' },
  { name: 'Cosmic',          gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Northern',        gradient: 'linear-gradient(135deg, #0d1117 0%, #1a3a2a 50%, #0d2137 100%)' },
  { name: 'Ocean Deep',      gradient: 'linear-gradient(135deg, #0a0f12 0%, #0d2137 50%, #0a3d62 100%)' },
  { name: 'Purple Haze',     gradient: 'linear-gradient(135deg, #16001e 0%, #2d0645 50%, #0d0d2b 100%)' },
  { name: 'Crimson Dark',    gradient: 'linear-gradient(135deg, #100a0b 0%, #341218 50%, #1a0533 100%)' },
  { name: 'Sunset Dark',     gradient: 'linear-gradient(135deg, #1a0533 0%, #4a1040 50%, #0d0020 100%)' },
  { name: 'Gold Dark',       gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' },
  { name: 'Aqua Dark',       gradient: 'linear-gradient(135deg, #020617 0%, #062a3a 50%, #020f1a 100%)' },
  { name: 'Ember',           gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1c00 50%, #1a0a00 100%)' },
  { name: 'Mint Dark',       gradient: 'linear-gradient(135deg, #001a12 0%, #003d28 50%, #001a12 100%)' },
  { name: 'Rose Dark',       gradient: 'linear-gradient(135deg, #1a0010 0%, #3d0028 50%, #1a0010 100%)' },
];
// ──────────────────────────────────────────────────────────────────────────

const SANS_FONTS = ['Inter', 'DM Sans', 'Geist', 'Outfit', 'Onest', 'Figtree', 'Plus Jakarta Sans', 'Space Grotesk', 'Nunito', 'Poppins', 'Raleway', 'Sora'];
const MONO_FONTS = ['JetBrains Mono', 'Fira Code', 'Space Mono', 'IBM Plex Mono'];

const c = {
  label: 'text-xs text-white/50 font-medium',
  row: 'flex items-center justify-between gap-3',
  section: 'text-[10px] font-semibold text-white/30 uppercase tracking-widest',
  input: 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-white/25 transition-colors',
};

function Slider({ label, value, min, max, unit = '', step = 1, onChange }) {
  return (
    <div>
      <div className={`${c.row} mb-2`}>
        <label className={c.label}>{label}</label>
        <span className="text-xs text-white/40 tabular-nums font-mono">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer"
        style={{ accentColor: '#2596be' }}
      />
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className={c.row}>
      <span className={c.label}>{label}</span>
      <label className="flex items-center gap-2 cursor-pointer group">
        <span className="text-[10px] text-white/25 uppercase tabular-nums font-mono group-hover:text-white/40 transition-colors">{value}</span>
        <div className="w-7 h-7 rounded-lg border border-white/20 overflow-hidden relative" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </div>
      </label>
    </div>
  );
}

function PillGroup({ options, active, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(({ value, label }) => (
        <button key={value} onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 ${active === value ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
          style={active === value ? { border: '1px solid rgba(255,255,255,0.2)' } : { border: '1px solid transparent' }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className={c.row}>
      <span className={c.label}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all duration-200 cursor-pointer relative flex-shrink-0 ${value ? 'bg-[#2596be]' : 'bg-white/15'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function FontSelect({ label, value, onChange }) {
  return (
    <div className={c.row}>
      <span className={c.label}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.80)',
          fontFamily: value ? `'${value}', system-ui` : undefined,
          maxWidth: '152px',
        }}
      >
        <option value="" style={{ background: '#0c0e1a', fontFamily: 'system-ui' }}>Default</option>
        <optgroup label="Sans-serif" style={{ background: '#0c0e1a' }}>
          {SANS_FONTS.map(f => (
            <option key={f} value={f} style={{ background: '#0c0e1a', fontFamily: `'${f}', system-ui` }}>{f}</option>
          ))}
        </optgroup>
        <optgroup label="Monospace" style={{ background: '#0c0e1a' }}>
          {MONO_FONTS.map(f => (
            <option key={f} value={f} style={{ background: '#0c0e1a', fontFamily: `'${f}', monospace` }}>{f}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-white/6 -mx-5" />;
}

function PresetSwatch({ item }) {
  if (item._type === 'gradient') {
    return (
      <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10" style={{ width: 44, height: 28, background: item.gradient }} />
    );
  }
  // Solid: just the base color
  return (
    <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10" style={{ width: 44, height: 28, background: item.color }} />
  );
}

function PresetDropdown({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const groups = [
    { label: 'Solid', items: THEME_PRESETS.map(p => ({ ...p, _type: 'solid' })) },
    { label: 'Gradient', items: GRADIENT_PRESETS.map(p => ({ ...p, _type: 'gradient' })) },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/50 cursor-pointer transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <span>Choose a preset...</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl z-50"
            style={{
              background: 'rgba(8, 10, 22, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              maxHeight: '280px',
              overflowY: 'auto',
            }}
          >
            {groups.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="h-px mx-3 my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                <div className="px-3 pt-2.5 pb-1.5">
                  <span className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">{group.label}</span>
                </div>
                {group.items.map(item => (
                  <button
                    key={item.name}
                    onClick={() => { onSelect(item); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-left cursor-pointer"
                    style={{ color: 'rgba(255,255,255,0.70)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <PresetSwatch item={item} />
                    <span className="text-xs">{item.name}</span>
                  </button>
                ))}
                <div className="h-1.5" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPanel({ settings, onClose, onUpdateSettings, tiles, onImportTiles, onImport, onDone }) {
  const { background, shader, tiles: tileSettings, fonts: fontSettings = {}, search: searchSettings = {} } = settings;
  const set = (path, val) => onUpdateSettings(path, val);
  const importRef = useRef(null);
  const [importModal, setImportModal] = useState(null); // { parsed, hasLinks, hasSettings }
  const [importSel, setImportSel] = useState({ links: true, theming: true, tileLayout: true });

  const applyPreset = (preset) => {
    if (preset.type === 'solid') {
      set('background.type', 'solid');
      set('background.color', preset.color);
    } else if (preset.type === 'gradient') {
      set('background.type', 'gradient');
      set('background.gradient', preset.gradient);
    }
  };

  const handleExport = () => {
    const data = {
      version: 1,
      tiles: tiles.map(({ name, url, icon, iconUrl, iconRadius, color, shortcut }) => ({ name, url, icon, iconUrl, iconRadius, color, shortcut })),
      settings: {
        background: settings.background,
        shader: settings.shader,
        tiles: settings.tiles,
        fonts: settings.fonts,
        search: settings.search,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newtab-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        // Support both new format (with version key) and old links-only array
        if (Array.isArray(parsed)) {
          // Legacy links-only format
          const valid = parsed.filter(t => t.name && t.url);
          if (valid.length > 0) setImportModal({ parsed: { tiles: valid }, hasLinks: true, hasSettings: false });
        } else if (parsed && typeof parsed === 'object') {
          const hasLinks = Array.isArray(parsed.tiles) && parsed.tiles.some(t => t.name && t.url);
          const hasSettings = parsed.settings && typeof parsed.settings === 'object';
          if (hasLinks || hasSettings) {
            setImportModal({ parsed, hasLinks, hasSettings });
            setImportSel({ links: hasLinks, theming: hasSettings, tileLayout: hasSettings });
          }
        }
      } catch {}
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const applyImport = () => {
    if (!importModal) return;
    const { parsed, hasLinks, hasSettings } = importModal;
    const result = {};
    if (hasLinks && importSel.links) {
      result.tiles = parsed.tiles.filter(t => t.name && t.url);
    }
    if (hasSettings && (importSel.theming || importSel.tileLayout)) {
      const s = {};
      if (importSel.theming && parsed.settings.background) s.background = parsed.settings.background;
      if (importSel.theming && parsed.settings.shader) s.shader = parsed.settings.shader;
      if (importSel.tileLayout && parsed.settings.tiles) s.tiles = parsed.settings.tiles;
      if (Object.keys(s).length > 0) result.settings = s;
    }
    onImport(result);
    setImportModal(null);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 w-72 z-40 flex flex-col"
      style={{
        background: 'rgba(6, 8, 18, 0.55)',
        backdropFilter: 'blur(48px) saturate(180%)',
        WebkitBackdropFilter: 'blur(48px) saturate(180%)',
        borderLeft: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-sm font-semibold text-white/90 tracking-tight">Appearance</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-150">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5 space-y-6">

        {/* ── LINKS ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed">
            Export saves your tiles as JSON. Import replaces all tiles — use an exported file as a template.
          </p>
        </section>

        <SectionDivider />

        {/* ── PRESETS ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Presets</h3>
          <PresetDropdown
            onSelect={item => {
              if (item._type === 'gradient') applyPreset({ type: 'gradient', ...item });
              else applyPreset(item);
            }}
          />
        </section>

        <SectionDivider />

        {/* ── BACKGROUND ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Background</h3>
          <PillGroup
            options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }, { value: 'image', label: 'Image' }]}
            active={background.type}
            onChange={v => set('background.type', v)}
          />

          {background.type === 'solid' && (
            <div className="space-y-3 pt-1">
              <ColorRow label="Base Color" value={background.color} onChange={v => set('background.color', v)} />
            </div>
          )}

          {background.type === 'gradient' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className={`block ${c.label} mb-1.5`}>Custom CSS Gradient</label>
                <textarea
                  value={background.gradient || ''}
                  onChange={e => set('background.gradient', e.target.value)}
                  placeholder="linear-gradient(135deg, #0f0c29, #302b63)"
                  rows={3}
                  className={`${c.input} resize-none font-mono text-[11px]`}
                />
              </div>
              {background.gradient && (
                <div className="w-full h-10 rounded-xl ring-1 ring-white/10" style={{ background: background.gradient }} />
              )}
            </div>
          )}

          {background.type === 'image' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className={`block ${c.label} mb-1.5`}>Image URL</label>
                <input type="text" value={background.imageUrl} onChange={e => set('background.imageUrl', e.target.value)} placeholder="https://..." className={c.input} />
              </div>
              <Slider label="Blur" value={background.imageBlur} min={0} max={20} onChange={v => set('background.imageBlur', v)} />
              <Slider label="Darkness" value={background.imageDarkness} min={0} max={90} unit="%" onChange={v => set('background.imageDarkness', v)} />
            </div>
          )}
        </section>

        <SectionDivider />

        {/* ── SHADER OVERLAY ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Shader Overlay</h3>
          <PillGroup
            options={[{ value: 'none', label: 'None' }, { value: 'aurora', label: 'Aurora' }, { value: 'falling', label: 'Falling' }]}
            active={shader.type}
            onChange={v => set('shader.type', v)}
          />
          {shader.type !== 'none' && (
            <Slider label="Opacity" value={Math.round(shader.opacity * 100)} min={10} max={100} unit="%" onChange={v => set('shader.opacity', v / 100)} />
          )}
          {shader.type === 'aurora' && (
            <Slider label="Speed" value={Math.round(shader.speed * 10)} min={1} max={40} onChange={v => set('shader.speed', v / 10)} />
          )}
          {shader.type === 'falling' && (
            <ColorRow label="Line Color" value={shader.color} onChange={v => set('shader.color', v)} />
          )}
        </section>

        <SectionDivider />

        {/* ── FONTS ── */}
        <section className="space-y-3.5">
          <h3 className={c.section}>Fonts</h3>
          <FontSelect label="Global" value={fontSettings.global ?? ''} onChange={v => set('fonts.global', v)} />
          <div className="h-px -mx-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <FontSelect label="Clock" value={fontSettings.time ?? ''} onChange={v => set('fonts.time', v)} />
          <FontSelect label="Date" value={fontSettings.date ?? ''} onChange={v => set('fonts.date', v)} />
          <FontSelect label="Greeting" value={fontSettings.greeting ?? ''} onChange={v => set('fonts.greeting', v)} />
          <FontSelect label="Search" value={fontSettings.search ?? ''} onChange={v => set('fonts.search', v)} />
          <FontSelect label="Tile Names" value={fontSettings.tiles ?? ''} onChange={v => set('fonts.tiles', v)} />
          <FontSelect label="Shortcuts" value={fontSettings.shortcuts ?? ''} onChange={v => set('fonts.shortcuts', v)} />
          <p className="text-[10px] text-white/25">Individual overrides Global. Default = system font.</p>
        </section>

        <SectionDivider />

        {/* ── SEARCH ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Search</h3>
          <Toggle label="Show Suggestions" value={searchSettings.suggestions ?? true} onChange={v => set('search.suggestions', v)} />
        </section>

        <SectionDivider />

        {/* ── TILES ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={c.section}>Tiles</h3>
            <button
              onClick={() => set('tiles', { size: 100, columns: 7, gap: 16, showShortcuts: false, shortcutStyle: 'badge', shortcutColor: '', hoverShadow: false })}
              className="text-[10px] text-white/30 hover:text-white/55 cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>
          <Slider label="Icon Size" value={tileSettings.size} min={60} max={160} unit="px" onChange={v => set('tiles.size', v)} />
          <Slider label="Columns" value={tileSettings.columns} min={2} max={12} onChange={v => set('tiles.columns', v)} />
          <Slider label="Gap" value={tileSettings.gap} min={4} max={40} unit="px" onChange={v => set('tiles.gap', v)} />
          <Toggle label="Hover Shadow" value={tileSettings.hoverShadow ?? false} onChange={v => set('tiles.hoverShadow', v)} />
          <Toggle label="Show Shortcut Badges" value={tileSettings.showShortcuts ?? false} onChange={v => set('tiles.showShortcuts', v)} />
          {(tileSettings.showShortcuts) && (<>
            <div className={c.row}>
              <span className={c.label}>Badge Style</span>
              <PillGroup
                options={[{ value: 'badge', label: 'Key' }, { value: 'dot', label: 'Dot' }]}
                active={tileSettings.shortcutStyle ?? 'badge'}
                onChange={v => set('tiles.shortcutStyle', v)}
              />
            </div>
            <ColorRow label="Badge Color" value={tileSettings.shortcutColor || '#ffffff'} onChange={v => set('tiles.shortcutColor', v)} />
          </>)}
        </section>

      </div>

      {/* Finish Editing button */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={onDone}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white cursor-pointer transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          Finish Editing
        </button>
      </div>

      {/* Import selection modal — rendered in a portal to escape the panel's CSS transform */}
      {createPortal(
        <AnimatePresence>
        {importModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={() => setImportModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-2xl p-6 space-y-4"
              style={{
                background: 'rgba(12, 14, 28, 0.97)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div>
                <p className="text-sm font-semibold text-white/90 mb-1">Import</p>
                <p className="text-[11px] text-white/40">Choose what to import from the file.</p>
              </div>
              <div className="space-y-2.5">
                {importModal.hasLinks && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={importSel.links} onChange={e => setImportSel(s => ({ ...s, links: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                    <div>
                      <p className="text-xs text-white/80">Links</p>
                      <p className="text-[10px] text-white/35">{importModal.parsed.tiles?.length} tile{importModal.parsed.tiles?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </label>
                )}
                {importModal.hasSettings && (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={importSel.theming} onChange={e => setImportSel(s => ({ ...s, theming: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                      <div>
                        <p className="text-xs text-white/80">Theming</p>
                        <p className="text-[10px] text-white/35">Background &amp; shader</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={importSel.tileLayout} onChange={e => setImportSel(s => ({ ...s, tileLayout: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                      <div>
                        <p className="text-xs text-white/80">Tile Layout</p>
                        <p className="text-[10px] text-white/35">Size, columns, gap</p>
                      </div>
                    </label>
                  </>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setImportModal(null)}
                  className="flex-1 py-2 rounded-xl text-xs text-white/50 hover:text-white/70 cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button onClick={applyImport}
                  className="flex-1 py-2 rounded-xl text-xs text-white font-medium cursor-pointer transition-colors"
                  style={{ background: '#2596be' }}>
                  Import
                </button>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
