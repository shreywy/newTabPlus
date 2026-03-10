import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, X } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const fetchTimer = useRef(null);
  const containerRef = useRef(null);

  const hasText = query.trim().length > 0;
  // Show dropdown as soon as we have focus + text, even while loading
  const open = focused && showSuggestions && hasText;

  // Notify parent based on focus + text (tiles hide when search is active with content)
  useEffect(() => { onHasQuery?.(focused && hasText); }, [focused, hasText, onHasQuery]);

  // Debounced suggestion fetch
  useEffect(() => {
    clearTimeout(fetchTimer.current);
    if (!hasText || !showSuggestions) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    fetchTimer.current = setTimeout(async () => {
      const results = await fetchSuggestions(query);
      setSuggestions(results);
      setLoading(false);
      setActiveIdx(-1);
    }, 120);
    return () => clearTimeout(fetchTimer.current);
  }, [query, showSuggestions, hasText]);

  // Close on outside click — tiles come back
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setFocused(false);
    };
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
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      setActiveIdx(i => (i <= 0 ? -1 : i - 1));
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIdx(-1);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className="glass glass-hover flex items-center gap-3 px-5 py-3.5 transition-all duration-150"
          style={{
            borderRadius: open ? '16px 16px 0 0' : '16px',
            borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : undefined,
          }}
        >
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
          <AnimatePresence>
            {query && (
              <motion.button
                key="clear"
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.1 }}
                onClick={clearQuery}
                className="text-white/30 hover:text-white/60 cursor-pointer flex-shrink-0 transition-colors duration-100"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
          {hasText && (
            <button
              type="submit"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-all duration-150 cursor-pointer"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 z-50 overflow-hidden"
            style={{
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              background: 'rgba(10, 12, 24, 0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          >
            <div className="py-1.5">
              {loading && suggestions.length === 0 ? (
                <div className="px-5 py-3 flex items-center gap-3">
                  <Search className="w-3.5 h-3.5 opacity-25 flex-shrink-0" />
                  <span className="text-sm text-white/25 animate-pulse">Searching…</span>
                </div>
              ) : (
                suggestions.map((s, i) => (
                  <motion.button
                    key={`${s}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: i * 0.02 }}
                    onMouseDown={(e) => { e.preventDefault(); navigate(s); }}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(-1)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer transition-colors duration-75"
                    style={{
                      background: activeIdx === i ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: activeIdx === i ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)',
                      fontFamily: 'var(--font-search, inherit)',
                    }}
                  >
                    <Search className="w-3.5 h-3.5 flex-shrink-0 opacity-35" />
                    <span className="text-sm truncate">{s}</span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
