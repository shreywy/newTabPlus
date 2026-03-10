import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';

async function fetchSuggestions(query) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data[1] ?? []).slice(0, 7);
  } catch { return []; }
}

export default function SearchBar({ showSuggestions = true, onHasQuery }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const fetchTimer = useRef(null);
  const containerRef = useRef(null);

  const open = focused && showSuggestions && suggestions.length > 0;

  // Notify parent when query presence changes
  useEffect(() => { onHasQuery?.(query.length > 0); }, [query, onHasQuery]);

  // Debounced suggestion fetch
  useEffect(() => {
    clearTimeout(fetchTimer.current);
    if (!query.trim() || !showSuggestions) { setSuggestions([]); return; }
    fetchTimer.current = setTimeout(async () => {
      const results = await fetchSuggestions(query);
      setSuggestions(results);
      setActiveIdx(-1);
    }, 180);
    return () => clearTimeout(fetchTimer.current);
  }, [query, showSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = useCallback((q) => {
    const trimmed = (q ?? query).trim();
    if (!trimmed) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(activeIdx >= 0 ? suggestions[activeIdx] : undefined);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i <= 0 ? -1 : i - 1));
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIdx(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className={`glass glass-hover rounded-2xl flex items-center gap-3 px-5 py-3.5 transition-all duration-150 ${open ? 'rounded-b-none border-b-0' : ''}`}
          style={open ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}>
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            placeholder="Search the web..."
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm font-light"
            style={{ fontFamily: 'var(--font-search, inherit)' }}
            autoComplete="off"
            spellCheck="false"
          />
          {query.trim() && (
            <button type="submit" className="text-white/60 hover:text-white transition-colors duration-150 cursor-pointer flex-shrink-0">
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute left-0 right-0 z-50 overflow-hidden"
            style={{
              background: 'rgba(6, 8, 20, 0.80)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); navigate(s); }}
                onMouseEnter={() => setActiveIdx(i)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer transition-colors duration-75"
                style={{
                  background: activeIdx === i ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: activeIdx === i ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.60)',
                  fontFamily: 'var(--font-search, inherit)',
                }}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                <span className="text-sm truncate">{s}</span>
              </button>
            ))}
            <div className="h-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
