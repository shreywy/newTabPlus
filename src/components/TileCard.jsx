import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil } from 'lucide-react';

export default function TileCard({ tile, editMode, onEdit, tileSize = 100 }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
    disabled: !editMode,
  });

  const outerStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${tileSize}px`,
    height: `${tileSize}px`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : isHovered ? 10 : 'auto',
    position: 'relative',
    flexShrink: 0,
  };

  const iconContainerSize = Math.round(tileSize * 0.46);
  const fontSize = Math.round(tileSize * 0.22);
  const imgSize = Math.round(iconContainerSize * 0.62);

  const handleClick = () => {
    if (isDragging) return;
    if (editMode) { onEdit(tile); return; }
    window.location.href = tile.url;
  };

  return (
    // Outer div: pure layout — fixed size, no hover effects
    <div
      ref={setNodeRef}
      style={outerStyle}
      {...attributes}
      {...(editMode ? listeners : {})}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner motion div: visual only — can scale/translate freely */}
      <motion.div
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        whileHover={!editMode ? { scale: 1.08, y: -5 } : {}}
        whileTap={!editMode ? { scale: 0.97 } : {}}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className={`
          w-full h-full glass rounded-2xl flex flex-col items-center justify-center gap-2
          select-none relative
          ${editMode
            ? 'cursor-grab active:cursor-grabbing ring-1 ring-white/15 animate-wiggle'
            : 'cursor-pointer'
          }
        `}
        style={{
          border: '1px solid rgba(255,255,255,0.10)',
          transformOrigin: 'center center',
        }}
      >
        {/* Edit button — only on hover in edit mode */}
        <AnimatePresence>
          {editMode && isHovered && (
            <motion.button
              key="edit-btn"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12 }}
              onClick={e => { e.stopPropagation(); onEdit(tile); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white cursor-pointer z-10 backdrop-blur-sm"
            >
              <Pencil className="w-2.5 h-2.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Icon */}
        <div
          className="rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            width: `${iconContainerSize}px`,
            height: `${iconContainerSize}px`,
            background: `${tile.color}22`,
            border: `1px solid ${tile.color}35`,
          }}
        >
          {tile.iconUrl && !imgError ? (
            <img
              src={tile.iconUrl}
              alt=""
              style={{ width: imgSize, height: imgSize, objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : tile.icon ? (
            <span style={{ fontSize: `${Math.round(fontSize * 1.15)}px`, lineHeight: 1 }}>
              {tile.icon}
            </span>
          ) : (
            <span style={{ fontSize: `${fontSize}px`, fontWeight: 600, color: tile.color, lineHeight: 1 }}>
              {tile.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <span
          className="text-white/65 font-medium text-center leading-tight truncate w-full px-2"
          style={{ fontSize: `${Math.max(9, Math.round(tileSize * 0.11))}px` }}
        >
          {tile.name}
        </span>
      </motion.div>
    </div>
  );
}
