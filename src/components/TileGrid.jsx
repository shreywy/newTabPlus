import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TileCard from './TileCard';

const OVERFLOW_PADDING = 28; // px of extra space for hover scale animations

export default function TileGrid({ tiles, editMode, onReorder, onAdd, onEdit, tileSize = 100, columns = 7, gap = 16 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const dragState = useRef({ active: false, startY: 0, startScrollY: 0 });
  const [isDragScrolling, setIsDragScrolling] = useState(false);

  // Calculate max scroll
  const getMaxScroll = useCallback(() => {
    if (!outerRef.current || !innerRef.current) return 0;
    const outerH = outerRef.current.clientHeight - OVERFLOW_PADDING * 2;
    const innerH = innerRef.current.scrollHeight;
    return Math.max(0, innerH - outerH);
  }, []);

  const clampScroll = useCallback((val) => {
    return Math.max(0, Math.min(val, getMaxScroll()));
  }, [getMaxScroll]);

  // Mouse wheel scroll
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setScrollY(prev => clampScroll(prev + e.deltaY * 0.8));
  }, [clampScroll]);

  // Drag to scroll
  const onMouseDown = useCallback((e) => {
    if (editMode) return;
    dragState.current = { active: true, startY: e.clientY, startScrollY: scrollY };
    setIsDragScrolling(true);
  }, [editMode, scrollY]);

  const onMouseMove = useCallback((e) => {
    if (!dragState.current.active) return;
    const dy = e.clientY - dragState.current.startY;
    setScrollY(clampScroll(dragState.current.startScrollY - dy));
  }, [clampScroll]);

  const stopDrag = useCallback(() => {
    dragState.current.active = false;
    setIsDragScrolling(false);
  }, []);

  // Reset scroll when tiles change size (tileSize/columns change)
  useEffect(() => { setScrollY(0); }, [tileSize, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: editMode ? 8 : 99999 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = tiles.findIndex(t => t.id === active.id);
    const newIdx = tiles.findIndex(t => t.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) onReorder(arrayMove(tiles, oldIdx, newIdx));
  };

  const totalItems = tiles.length + (editMode ? 1 : 0);
  const effectiveCols = Math.max(1, Math.min(totalItems, columns));
  // Max viewport height for tile area
  const maxViewH = `calc(100vh - 360px)`;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tiles.map(t => t.id)} strategy={rectSortingStrategy}>
        <div className="w-full flex justify-center">
          {/* Outer: acts as viewport with overflow:hidden + padding for scale room */}
          <div
            ref={outerRef}
            style={{
              maxHeight: `calc(${maxViewH} + ${OVERFLOW_PADDING * 2}px)`,
              overflow: 'hidden',
              padding: `${OVERFLOW_PADDING}px`,
              // Negative margin compensates for padding so layout isn't shifted
              margin: `-${OVERFLOW_PADDING}px`,
              cursor: isDragScrolling ? 'grabbing' : 'default',
            }}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            {/* Inner: slides via translateY, overflow visible so tiles can scale freely */}
            <div
              ref={innerRef}
              style={{
                transform: `translateY(-${scrollY}px)`,
                transition: isDragScrolling ? 'none' : 'transform 0.1s ease-out',
                overflow: 'visible',
                width: 'fit-content',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${effectiveCols}, ${tileSize}px)`,
                  gap: `${gap}px`,
                  overflow: 'visible',
                }}
              >
                <AnimatePresence>
                  {tiles.map(tile => (
                    <TileCard
                      key={tile.id}
                      tile={tile}
                      editMode={editMode}
                      onEdit={onEdit}
                      tileSize={tileSize}
                    />
                  ))}
                </AnimatePresence>

                {/* Add button — only in edit mode */}
                {editMode && (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onAdd}
                    className="glass rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer text-white/35 hover:text-white/60 transition-colors duration-200"
                    style={{
                      border: '1.5px dashed rgba(255,255,255,0.15)',
                      width: `${tileSize}px`,
                      height: `${tileSize}px`,
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-medium">Add</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
