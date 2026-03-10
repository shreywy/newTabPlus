import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

const BRAND_COLORS = {
  'google.com': '#4285F4',
  'docs.google.com': '#4285F4', 'sheets.google.com': '#0F9D58',
  'slides.google.com': '#F4B400', 'drive.google.com': '#4285F4',
  'mail.google.com': '#EA4335', 'calendar.google.com': '#4285F4',
  'youtube.com': '#FF0000', 'github.com': '#6e40c9',
  'twitter.com': '#1DA1F2', 'x.com': '#1a1a1a', 'reddit.com': '#FF4500',
  'twitch.tv': '#9146FF', 'netflix.com': '#E50914', 'spotify.com': '#1DB954',
  'discord.com': '#5865F2', 'instagram.com': '#E1306C', 'facebook.com': '#1877F2',
  'amazon.com': '#FF9900', 'microsoft.com': '#0078D4', 'linkedin.com': '#0A66C2',
  'tiktok.com': '#FF0050', 'notion.so': '#37352f', 'figma.com': '#F24E1E',
  'vercel.com': '#000000', 'openai.com': '#10a37f', 'anthropic.com': '#C96A45',
  'apple.com': '#555555', 'steam.com': '#1b2838',
};

// RGB order: red → orange → yellow → green → cyan → blue → violet → pink
const COLOR_PRESETS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

function getDomain(url) {
  try { return new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace(/^www\./, ''); }
  catch { return null; }
}

export default function AddTileModal({ tile, onSave, onDelete, onClose }) {
  const isEditing = Boolean(tile);
  const [name, setName] = useState(tile?.name ?? '');
  const [url, setUrl] = useState(tile?.url ?? '');
  const [icon, setIcon] = useState(tile?.icon ?? '');
  const [iconUrl, setIconUrl] = useState(tile?.iconUrl ?? '');
  // 'auto' = use iconUrl (favicon or custom), 'emoji' = use icon text, 'letter' = first letter
  const [iconMode, setIconMode] = useState(() => {
    if (tile?.iconUrl) return 'auto';
    if (tile?.icon) return 'emoji';
    return 'auto';
  });
  const [color, setColor] = useState(tile?.color ?? '#6366F1');
  const [shortcut, setShortcut] = useState(tile?.shortcut ?? '');
  const [imgError, setImgError] = useState(false);
  const [suggestedColor, setSuggestedColor] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auto-detect domain when URL changes
  useEffect(() => {
    const domain = getDomain(url);
    if (!domain) {
      setSuggestedColor(null);
      return;
    }
    // Auto-fill iconUrl in auto mode
    if (iconMode === 'auto') {
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      setIconUrl(favicon);
      setImgError(false);
    }
    // Check brand color
    const bc = BRAND_COLORS[domain];
    setSuggestedColor(bc || null);
  }, [url]);

  // When switching to auto mode, repopulate from URL
  useEffect(() => {
    if (iconMode === 'auto') {
      const domain = getDomain(url);
      if (domain) {
        setIconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
        setImgError(false);
      }
    }
  }, [iconMode]);

  const handleSave = useCallback(async () => {
    const trimName = name.trim();
    let trimUrl = url.trim();
    if (!trimName || !trimUrl) return;
    if (!/^https?:\/\//i.test(trimUrl)) trimUrl = 'https://' + trimUrl;

    let resolvedIconUrl = iconMode === 'auto' ? iconUrl : '';

    // Cache favicon as base64 data URL so it works offline / avoids fetch failures
    if (iconMode === 'auto' && iconUrl && !iconUrl.startsWith('data:')) {
      setSaving(true);
      try {
        const res = await fetch(iconUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          resolvedIconUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(iconUrl);
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        // fallback to remote URL
      }
      setSaving(false);
    }

    onSave({
      id: tile?.id ?? null,
      name: trimName,
      url: trimUrl,
      icon: iconMode === 'emoji' ? icon.trim() : '',
      iconUrl: resolvedIconUrl,
      color,
      shortcut: shortcut.trim().charAt(0).toLowerCase() || '',
    });
  }, [name, url, icon, iconUrl, iconMode, color, shortcut, tile, onSave]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, handleSave]);

  // Preview logic
  const showImg = iconMode === 'auto' && iconUrl && !imgError;
  const showEmoji = iconMode === 'emoji' && icon;
  const previewLetter = (!showImg && !showEmoji) ? (name.trim().charAt(0).toUpperCase() || '?') : '';

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/25 transition-colors duration-150';
  const labelCls = 'block text-xs text-white/50 mb-1.5 font-medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay cursor-pointer" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="relative glass rounded-2xl p-6 w-full max-w-sm mx-4 z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">{isEditing ? 'Edit Tile' : 'Add Tile'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Google" className={inputCls} autoFocus />
          </div>

          {/* URL */}
          <div>
            <label className={labelCls}>URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </div>

          {/* Suggested brand color banner */}
          {suggestedColor && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: suggestedColor }} />
              <span className="text-white/50 flex-1">Suggested brand color</span>
              <button onClick={() => setColor(suggestedColor)} className="text-white/70 hover:text-white cursor-pointer font-medium transition-colors">
                Use
              </button>
            </div>
          )}

          {/* Icon row: mode toggle + preview */}
          <div className="flex gap-3 items-start">
            <div className="flex-1 space-y-2">
              <label className={labelCls}>Icon</label>
              {/* Mode pills */}
              <div className="flex gap-1">
                {[['auto','Auto'], ['emoji','Emoji'], ['letter','Letter']].map(([mode, label]) => (
                  <button key={mode} onClick={() => setIconMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${iconMode === mode ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
                    style={iconMode === mode ? { border: '1px solid rgba(255,255,255,0.2)' } : { border: '1px solid transparent' }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Auto mode: editable URL field (auto-filled from URL, or paste custom) */}
              {iconMode === 'auto' && (
                <div>
                  <input
                    type="text"
                    value={iconUrl}
                    onChange={e => { setIconUrl(e.target.value); setImgError(false); }}
                    placeholder="Icon URL (auto-filled) or paste your own"
                    className={inputCls}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  />
                  <p className="text-[10px] text-white/25 mt-1">Auto-filled from URL · Paste any image link to override</p>
                </div>
              )}
              {iconMode === 'emoji' && (
                <input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="✨" maxLength={2} className={inputCls} />
              )}
              {iconMode === 'letter' && (
                <p className="text-xs text-white/30 pt-1">Shows first letter of name</p>
              )}
            </div>

            {/* Live preview tile */}
            <div className="flex-shrink-0 mt-5">
              <div className="rounded-xl w-14 h-14 flex items-center justify-center overflow-hidden" style={{ background: `${color}22`, border: `1px solid ${color}35` }}>
                {showImg ? (
                  <img src={iconUrl} alt="" className="w-8 h-8 object-contain" onError={() => setImgError(true)} />
                ) : showEmoji ? (
                  <span className="text-2xl leading-none">{icon}</span>
                ) : (
                  <span className="text-xl font-semibold leading-none" style={{ color }}>{previewLetter}</span>
                )}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map(preset => (
                <button key={preset} onClick={() => setColor(preset)}
                  className={`w-7 h-7 rounded-full cursor-pointer flex-shrink-0 transition-all ${color === preset ? 'ring-2 ring-white/50 ring-offset-1 scale-110' : 'hover:scale-110'}`}
                  style={{ background: preset }}
                />
              ))}
              {/* Custom picker */}
              <div className="relative flex-shrink-0" title="Custom color">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                <div className={`w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all ${!COLOR_PRESETS.includes(color) ? 'ring-2 ring-white/50 ring-offset-1 scale-110' : 'hover:scale-110'}`}
                  style={{ background: COLOR_PRESETS.includes(color) ? 'rgba(255,255,255,0.08)' : color }}>
                  {COLOR_PRESETS.includes(color) && <span className="text-white/50 text-xs leading-none select-none">+</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Shortcut key */}
          <div>
            <label className={labelCls}>Shortcut Key <span className="text-white/25 font-normal">(optional)</span></label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={shortcut}
                onChange={e => setShortcut(e.target.value.replace(/[^a-zA-Z0-9]/, '').slice(0, 1))}
                placeholder="a–z, 0–9"
                maxLength={1}
                className={inputCls}
                style={{ width: '64px', textAlign: 'center', fontFamily: 'monospace', fontSize: '16px' }}
              />
              {shortcut && (
                <span className="text-[11px] text-white/35">Press <kbd className="px-1.5 py-0.5 rounded text-white/50 font-mono text-xs" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>{shortcut.toUpperCase()}</kbd> on the new tab page to open</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={!name.trim() || !url.trim() || saving}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl cursor-pointer transition-all">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-white/50 hover:text-white/70 text-sm rounded-xl cursor-pointer transition-colors">
              Cancel
            </button>
          </div>
          {isEditing && (
            <button onClick={() => onDelete(tile.id)} className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 text-sm rounded-xl cursor-pointer transition-colors">
              <Trash2 className="w-4 h-4" />Delete
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
