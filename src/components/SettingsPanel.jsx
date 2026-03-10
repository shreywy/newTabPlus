import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';

// ── Color presets ──────────────────────────────────────────────────────────
const THEME_PRESETS = [
  // Dark classics
  { name: 'Deep Sea',        type: 'solid', color: '#020617' },
  { name: 'Midnight',        type: 'solid', color: '#0d0d0d' },
  { name: 'Obsidian',        type: 'solid', color: '#13141a' },
  { name: 'Carbon',          type: 'solid', color: '#161616' },
  { name: 'Forest',          type: 'solid', color: '#0d1117' },
  // Popular themes
  { name: 'Catppuccin',      type: 'solid', color: '#1e1e2e' },
  { name: 'Macchiato',       type: 'solid', color: '#24273a' },
  { name: 'Frappe',          type: 'solid', color: '#303446' },
  { name: 'Nord',            type: 'solid', color: '#2e3440' },
  { name: 'Nord Polar',      type: 'solid', color: '#3b4252' },
  { name: 'Dracula',         type: 'solid', color: '#282a36' },
  { name: 'Tokyo Night',     type: 'solid', color: '#1a1b26' },
  { name: 'Tokyo Storm',     type: 'solid', color: '#24283b' },
  { name: 'Gruvbox',         type: 'solid', color: '#282828' },
  { name: 'Gruvbox Soft',    type: 'solid', color: '#32302f' },
  { name: 'One Dark',        type: 'solid', color: '#282c34' },
  { name: 'Palenight',       type: 'solid', color: '#292d3e' },
  { name: 'Rose Pine',       type: 'solid', color: '#191724' },
  { name: 'Rose Pine Moon',  type: 'solid', color: '#232136' },
  { name: 'Kanagawa',        type: 'solid', color: '#1f1f28' },
  { name: 'Everforest',      type: 'solid', color: '#2d353b' },
  { name: 'Ayu Dark',        type: 'solid', color: '#0b0e14' },
  { name: 'Solarized Dark',  type: 'solid', color: '#002b36' },
  { name: 'Monokai',         type: 'solid', color: '#272822' },
  { name: 'Nightfox',        type: 'solid', color: '#192330' },
  { name: 'Moonfly',         type: 'solid', color: '#080808' },
  { name: 'Material Dark',   type: 'solid', color: '#212121' },
  { name: 'Oxocarbon',       type: 'solid', color: '#161616' },
];

const GRADIENT_PRESETS = [
  { name: 'Dark Nebula',  gradient: 'radial-gradient(ellipse at 0% 0%, #242635 0%, #0a0b10 100%)' },
  { name: 'Cosmic',       gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Northern',     gradient: 'linear-gradient(135deg, #0d1117 0%, #1a3a2a 50%, #0d2137 100%)' },
  { name: 'Ocean Deep',   gradient: 'linear-gradient(135deg, #0a0f12 0%, #0d2137 50%, #0a3d62 100%)' },
  { name: 'Purple Haze',  gradient: 'linear-gradient(135deg, #16001e 0%, #2d0645 50%, #0d0d2b 100%)' },
  { name: 'Crimson Dark', gradient: 'linear-gradient(135deg, #100a0b 0%, #341218 50%, #1a0533 100%)' },
  { name: 'Sunset Dark',  gradient: 'linear-gradient(135deg, #1a0533 0%, #4a1040 50%, #0d0020 100%)' },
  { name: 'Gold Dark',    gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' },
  { name: 'Aqua Dark',    gradient: 'linear-gradient(135deg, #020617 0%, #062a3a 50%, #020f1a 100%)' },
  { name: 'Ember',        gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1c00 50%, #1a0a00 100%)' },
  { name: 'Mint Dark',    gradient: 'linear-gradient(135deg, #001a12 0%, #003d28 50%, #001a12 100%)' },
  { name: 'Rose Dark',    gradient: 'linear-gradient(135deg, #1a0010 0%, #3d0028 50%, #1a0010 100%)' },
];
// ──────────────────────────────────────────────────────────────────────────

const FONT_GROUPS = [
  {
    group: 'System',
    fonts: [
      { name: 'Default',          value: '',               family: 'system-ui, sans-serif', system: true },
      { name: 'Times New Roman',  value: 'Times New Roman',family: '"Times New Roman", serif', system: true },
      { name: 'Georgia',          value: 'Georgia',        family: 'Georgia, serif', system: true },
      { name: 'Arial',            value: 'Arial',          family: 'Arial, sans-serif', system: true },
      { name: 'Courier New',      value: 'Courier New',    family: '"Courier New", monospace', system: true },
    ],
  },
  {
    group: 'Sans-serif',
    fonts: ['Inter','DM Sans','Geist','Outfit','Onest','Figtree','Plus Jakarta Sans',
            'Space Grotesk','Nunito','Poppins','Raleway','Sora','Lato','Open Sans',
            'Roboto','Urbanist','Manrope','Source Sans 3'].map(n => ({ name: n, value: n })),
  },
  {
    group: 'Serif',
    fonts: ['Playfair Display','Merriweather','Lora','EB Garamond',
            'DM Serif Display','Cormorant Garamond'].map(n => ({ name: n, value: n })),
  },
  {
    group: 'Monospace',
    fonts: ['JetBrains Mono','Fira Code','Space Mono','IBM Plex Mono',
            'Geist Mono','Inconsolata','Source Code Pro'].map(n => ({ name: n, value: n })),
  },
];

const ALL_GOOGLE_FONTS = FONT_GROUPS.slice(1).flatMap(g => g.fonts.map(f => f.value));

function getFontFamily(value) {
  if (!value) return 'system-ui, sans-serif';
  const sys = FONT_GROUPS[0].fonts.find(f => f.value === value);
  if (sys) return sys.family;
  return `'${value}', system-ui, sans-serif`;
}

const c = {
  label: 'text-xs text-white/50 font-medium',
  row: 'flex items-center justify-between gap-3',
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

function FontDropdown({ label, value, onChange, extraFonts = [] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [dropPos, setDropPos] = useState(null);

  const selectedFamily = getFontFamily(value);
  const selectedName = value
    ? (FONT_GROUPS.flatMap(g => g.fonts).find(f => f.value === value)?.name ?? value)
    : 'Default';

  const openDropdown = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!triggerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const groups = [
    ...(extraFonts.length > 0 ? [{ group: 'Custom', fonts: extraFonts.map(n => ({ name: n, value: n })) }] : []),
    ...FONT_GROUPS,
  ];

  return (
    <div className={c.row}>
      <span className={c.label}>{label}</span>
      <button
        ref={triggerRef}
        onClick={open ? () => setOpen(false) : openDropdown}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          maxWidth: '160px',
        }}
      >
        <span className="text-sm text-white/70 leading-none flex-shrink-0" style={{ fontFamily: selectedFamily }}>Aa</span>
        <span className="text-xs text-white/70 truncate flex-1 text-left">{selectedName}</span>
        <ChevronDown className={`w-3 h-3 text-white/30 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && dropPos && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'fixed',
                top: dropPos.top,
                right: dropPos.right,
                width: 220,
                maxHeight: 320,
                overflowY: 'auto',
                zIndex: 9999,
                background: 'rgba(8, 10, 22, 0.94)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {groups.map((group, gi) => (
                <div key={group.group}>
                  {gi > 0 && <div className="h-px mx-3" style={{ background: 'rgba(255,255,255,0.07)' }} />}
                  <div className="px-3 pt-2.5 pb-1">
                    <span className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">{group.group}</span>
                  </div>
                  {group.fonts.map(font => (
                    <button
                      key={font.value}
                      onClick={() => { onChange(font.value); setOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left cursor-pointer transition-colors"
                      style={{
                        background: font.value === value ? 'rgba(255,255,255,0.09)' : 'transparent',
                        color: font.value === value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.60)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = font.value === value ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = font.value === value ? 'rgba(255,255,255,0.09)' : 'transparent'}
                    >
                      <span className="text-base leading-none flex-shrink-0 w-8 text-center"
                        style={{ fontFamily: font.family ?? getFontFamily(font.value) }}>
                        Aa
                      </span>
                      <span className="text-xs truncate">{font.name}</span>
                    </button>
                  ))}
                  <div className="h-1" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function FontsSection({ fontSettings, set }) {
  const [customInput, setCustomInput] = useState('');
  const customFonts = Array.isArray(fontSettings.custom) ? fontSettings.custom : [];

  // Load all Google Fonts for previews when this section mounts
  useEffect(() => {
    const all = [...ALL_GOOGLE_FONTS, ...customFonts].filter(Boolean);
    if (all.length === 0) return;
    const families = all.map(f => `family=${f.replace(/ /g, '+')}:wght@400`).join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    let link = document.getElementById('ntplus-font-preview');
    if (!link) {
      link = document.createElement('link');
      link.id = 'ntplus-font-preview';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [customFonts.length]);

  const addCustomFont = () => {
    const name = customInput.trim();
    if (!name || customFonts.includes(name)) return;
    set('fonts.custom', [...customFonts, name]);
    setCustomInput('');
  };

  const removeCustomFont = (name) => {
    set('fonts.custom', customFonts.filter(f => f !== name));
  };

  const FD = ({ label, fkey }) => (
    <FontDropdown label={label} value={fontSettings[fkey] ?? ''} onChange={v => set(`fonts.${fkey}`, v)} extraFonts={customFonts} />
  );

  return (
    <div className="space-y-3.5">
      <FD label="Global" fkey="global" />
      <div className="h-px -mx-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <FD label="Clock" fkey="time" />
      <FD label="Date" fkey="date" />
      <FD label="Greeting" fkey="greeting" />
      <FD label="Search" fkey="search" />
      <FD label="Tile Names" fkey="tiles" />
      <FD label="Shortcuts" fkey="shortcuts" />
      <p className="text-[10px] text-white/25">Individual overrides Global.</p>
      {/* Custom font input */}
      <div className="pt-1">
        <p className="text-[10px] text-white/30 mb-1.5">Add Google Font</p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomFont()}
            placeholder="e.g. Bricolage Grotesque"
            className="flex-1 text-xs rounded-lg px-2.5 py-1.5 outline-none text-white placeholder-white/25"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          />
          <button
            onClick={addCustomFont}
            className="px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:text-white cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            Add
          </button>
        </div>
        {customFonts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {customFonts.map(f => (
              <button key={f} onClick={() => removeCustomFont(f)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white/50 hover:text-white/80 cursor-pointer transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
                title="Remove"
              >
                <span style={{ fontFamily: getFontFamily(f) }}>{f}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Collapse({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-2 cursor-pointer group"
      >
        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest group-hover:text-white/55 transition-colors duration-150">
          {title}
        </span>
        <ChevronRight
          className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 flex-shrink-0 transition-all duration-200"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-2 pb-3 space-y-3.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Subtle separator below each section */}
      <div className="h-px -mx-5" style={{ background: 'rgba(255,255,255,0.05)' }} />
    </div>
  );
}

function PresetSwatch({ item }) {
  if (item._type === 'gradient') {
    return <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10" style={{ width: 44, height: 28, background: item.gradient }} />;
  }
  return <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10" style={{ width: 44, height: 28, background: item.color }} />;
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
  const {
    background, shader,
    tiles: tileSettings,
    fonts: fontSettings = {},
    search: searchSettings = {},
    clock: clockSettings = {},
  } = settings;

  const set = (path, val) => onUpdateSettings(path, val);
  const importRef = useRef(null);
  const [importModal, setImportModal] = useState(null);
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
        clock: settings.clock,
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
        if (Array.isArray(parsed)) {
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
    if (hasLinks && importSel.links) result.tiles = parsed.tiles.filter(t => t.name && t.url);
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

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-3">

        {/* ── LINKS ── */}
        <Collapse title="Links">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleExport}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <Download className="w-3.5 h-3.5" />Export
            </button>
            <button onClick={() => importRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <Upload className="w-3.5 h-3.5" />Import
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed">
            Export saves tiles + settings as JSON. Import replaces selectively.
          </p>
        </Collapse>

        {/* ── PRESETS ── */}
        <Collapse title="Presets">
          <PresetDropdown
            onSelect={item => {
              if (item._type === 'gradient') applyPreset({ type: 'gradient', ...item });
              else applyPreset(item);
            }}
          />
        </Collapse>

        {/* ── BACKGROUND ── */}
        <Collapse title="Background">
          <PillGroup
            options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }, { value: 'image', label: 'Image' }]}
            active={background.type}
            onChange={v => set('background.type', v)}
          />
          {background.type === 'solid' && (
            <ColorRow label="Base Color" value={background.color} onChange={v => set('background.color', v)} />
          )}
          {background.type === 'gradient' && (
            <div className="space-y-3">
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
            <div className="space-y-3">
              <div>
                <label className={`block ${c.label} mb-1.5`}>Image URL</label>
                <input type="text" value={background.imageUrl} onChange={e => set('background.imageUrl', e.target.value)} placeholder="https://..." className={c.input} />
              </div>
              <Slider label="Blur" value={background.imageBlur} min={0} max={20} onChange={v => set('background.imageBlur', v)} />
              <Slider label="Darkness" value={background.imageDarkness} min={0} max={90} unit="%" onChange={v => set('background.imageDarkness', v)} />
            </div>
          )}
        </Collapse>

        {/* ── SHADER OVERLAY ── */}
        <Collapse title="Shader Overlay">
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
        </Collapse>

        {/* ── CLOCK ── */}
        <Collapse title="Clock">
          <Toggle label="12-Hour Format" value={clockSettings.hour12 ?? true} onChange={v => set('clock.hour12', v)} />
          <Toggle label="Show Seconds" value={clockSettings.showSeconds ?? false} onChange={v => set('clock.showSeconds', v)} />
          <Toggle label="Show Greeting" value={clockSettings.showGreeting ?? true} onChange={v => set('clock.showGreeting', v)} />
          <div className={c.row}>
            <span className={c.label}>Date Format</span>
            <PillGroup
              options={[{ value: 'full', label: 'Full' }, { value: 'short', label: 'Short' }, { value: 'numeric', label: '#' }]}
              active={clockSettings.dateFormat ?? 'full'}
              onChange={v => set('clock.dateFormat', v)}
            />
          </div>
          <Slider label="Time Size" value={clockSettings.timeSize ?? 72} min={36} max={120} unit="px" onChange={v => set('clock.timeSize', v)} />
          <Slider label="Date Size" value={clockSettings.dateSize ?? 14} min={10} max={24} unit="px" onChange={v => set('clock.dateSize', v)} />
        </Collapse>

        {/* ── FONTS ── */}
        <Collapse title="Fonts">
          <FontsSection fontSettings={fontSettings} set={set} />
        </Collapse>

        {/* ── SEARCH ── */}
        <Collapse title="Search">
          <Toggle label="Show Suggestions" value={searchSettings.suggestions ?? true} onChange={v => set('search.suggestions', v)} />
        </Collapse>

        {/* ── TILES ── */}
        <Collapse title="Tiles">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/25">Layout &amp; appearance</span>
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
          {tileSettings.showShortcuts && (<>
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
        </Collapse>

        {/* Bottom spacer */}
        <div className="h-2" />
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

      {/* Import selection modal — portal to escape panel's CSS transform */}
      {createPortal(
        <AnimatePresence>
        {importModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={() => setImportModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(12, 14, 28, 0.97)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            >
              <div>
                <p className="text-sm font-semibold text-white/90 mb-1">Import</p>
                <p className="text-[11px] text-white/40">Choose what to import from the file.</p>
              </div>
              <div className="space-y-2.5">
                {importModal.hasLinks && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={importSel.links} onChange={e => setImportSel(s => ({ ...s, links: e.target.checked }))} className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                    <div>
                      <p className="text-xs text-white/80">Links</p>
                      <p className="text-[10px] text-white/35">{importModal.parsed.tiles?.length} tile{importModal.parsed.tiles?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </label>
                )}
                {importModal.hasSettings && (<>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={importSel.theming} onChange={e => setImportSel(s => ({ ...s, theming: e.target.checked }))} className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                    <div>
                      <p className="text-xs text-white/80">Theming</p>
                      <p className="text-[10px] text-white/35">Background &amp; shader</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={importSel.tileLayout} onChange={e => setImportSel(s => ({ ...s, tileLayout: e.target.checked }))} className="w-4 h-4 rounded accent-[#2596be] cursor-pointer" />
                    <div>
                      <p className="text-xs text-white/80">Tile Layout</p>
                      <p className="text-[10px] text-white/35">Size, columns, gap</p>
                    </div>
                  </label>
                </>)}
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
