import React, { useState, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass glass-hover rounded-2xl flex items-center gap-3 px-5 py-3.5 focus-within:border-white/20 transition-all duration-150">
        <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web..."
          className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm font-light"
          autoComplete="off"
          spellCheck="false"
        />
        {query.trim() && (
          <button
            type="submit"
            className="text-white/60 hover:text-white transition-colors duration-150 cursor-pointer flex-shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
