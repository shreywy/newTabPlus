import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload } from 'lucide-react';

// ── Color presets ──────────────────────────────────────────────────────────
const THEME_PRESETS = [
  { name: 'Deep Sea',      type: 'solid',    color: '#020617', blobColor: '#2596be' },
  { name: 'Catppuccin',    type: 'solid',    color: '#1e1e2e', blobColor: '#cba6f7' },
  { name: 'Macchiato',     type: 'solid',    color: '#24273a', blobColor: '#c6a0f6' },
  { name: 'Nord',          type: 'solid',    color: '#2e3440', blobColor: '#88c0d0' },
  { name: 'Dracula',       type: 'solid',    color: '#282a36', blobColor: '#bd93f9' },
  { name: 'Tokyo Night',   type: 'solid',    color: '#1a1b26', blobColor: '#7aa2f7' },
  { name: 'Gruvbox',       type: 'solid',    color: '#282828', blobColor: '#fabd2f' },
  { name: 'One Dark',      type: 'solid',    color: '#282c34', blobColor: '#61afef' },
  { name: 'Forest',        type: 'solid',    color: '#0d1117', blobColor: '#22c55e' },
  { name: 'Midnight',      type: 'solid',    color: '#0d0d0d', blobColor: '#6366f1' },
];

const GRADIENT_PRESETS = [
  { name: 'Cosmic',        gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Northern',      gradient: 'linear-gradient(135deg, #0d1117 0%, #1a3a2a 50%, #0d2137 100%)' },
  { name: 'Ocean Deep',    gradient: 'linear-gradient(135deg, #0a0f12 0%, #0d2137 50%, #0a3d62 100%)' },
  { name: 'Purple Haze',   gradient: 'linear-gradient(135deg, #16001e 0%, #2d0645 50%, #0d0d2b 100%)' },
  { name: 'Crimson Dark',  gradient: 'linear-gradient(135deg, #100a0b 0%, #341218 50%, #1a0533 100%)' },
  { name: 'Sunset Dark',   gradient: 'linear-gradient(135deg, #1a0533 0%, #4a1040 50%, #0d0020 100%)' },
  { name: 'Gold Dark',     gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' },
  { name: 'Aqua Dark',     gradient: 'linear-gradient(135deg, #020617 0%, #062a3a 50%, #020f1a 100%)' },
];
// ──────────────────────────────────────────────────────────────────────────

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

function SectionDivider() {
  return <div className="h-px bg-white/6 -mx-5" />;
}

export default function SettingsPanel({ settings, onClose, onUpdateSettings, tiles, onImportTiles }) {
  const { background, shader, tiles: tileSettings } = settings;
  const set = (path, val) => onUpdateSettings(path, val);
  const importRef = useRef(null);

  const applyPreset = (preset) => {
    if (preset.type === 'solid') {
      set('background.type', 'solid');
      set('background.color', preset.color);
      set('background.blobColor', preset.blobColor);
    } else if (preset.type === 'gradient') {
      set('background.type', 'gradient');
      set('background.gradient', preset.gradient);
    }
  };

  const handleExport = () => {
    const data = tiles.map(({ id, name, url, icon, iconUrl, color }) => ({
      name, url, icon, iconUrl, color,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newtab-links.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) return;
        const valid = parsed.filter(t => t.name && t.url);
        if (valid.length > 0) onImportTiles(valid);
      } catch {}
      e.target.value = '';
    };
    reader.readAsText(file);
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
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed">
            Export saves your tiles as JSON. Import replaces all tiles — use an exported file as a template.
          </p>
        </section>

        <SectionDivider />

        {/* ── PRESETS ── */}
        <section className="space-y-3">
          <h3 className={c.section}>Presets</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-white/10" style={{ background: preset.blobColor }} />
                <span className="text-xs text-white/60 truncate">{preset.name}</span>
              </button>
            ))}
          </div>

          <p className={`${c.section} mt-1`}>Gradients</p>
          <div className="grid grid-cols-2 gap-1.5">
            {GRADIENT_PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset({ type: 'gradient', ...preset })}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-white/10" style={{ background: preset.gradient }} />
                <span className="text-xs text-white/60 truncate">{preset.name}</span>
              </button>
            ))}
          </div>
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
              <Toggle label="Show Blobs" value={background.showBlobs !== false} onChange={v => set('background.showBlobs', v)} />
              {background.showBlobs !== false && (
                <ColorRow label="Blob Color" value={background.blobColor} onChange={v => set('background.blobColor', v)} />
              )}
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

        {/* ── TILES ── */}
        <section className="space-y-4">
          <h3 className={c.section}>Tiles</h3>
          <Slider label="Icon Size" value={tileSettings.size} min={60} max={160} unit="px" onChange={v => set('tiles.size', v)} />
          <Slider label="Columns" value={tileSettings.columns} min={2} max={12} onChange={v => set('tiles.columns', v)} />
          <Slider label="Gap" value={tileSettings.gap} min={4} max={40} unit="px" onChange={v => set('tiles.gap', v)} />
        </section>

      </div>
    </motion.div>
  );
}
