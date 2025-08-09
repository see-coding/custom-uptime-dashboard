import React from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

export default function Window({
  id,
  title,
  zIndex,
  position,
  minimized,
  maximized,
  content,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDrag,
}) {
  if (minimized) return null;

  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = startX - position.x;
    const offsetY = startY - position.y;

    const handleMove = (ev) => {
      onDrag(id, { x: ev.clientX - offsetX, y: ev.clientY - offsetY });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const style = maximized
    ? { top: 0, left: 0, width: '100%', height: '100%' }
    : { top: position.y, left: position.x };

  return (
    <div
      className="absolute bg-white shadow-lg border flex flex-col"
      style={{ ...style, zIndex }}
      onMouseDown={() => onFocus(id)}
    >
      <div
        className="flex items-center justify-between bg-gray-200 cursor-move select-none"
        onMouseDown={startDrag}
      >
        <span className="px-2 py-1 text-sm">{title}</span>
        <div className="flex">
          <button
            className="px-2 py-1 hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
            aria-label="Minimize"
          >
            <Minus size={12} />
          </button>
          <button
            className="px-2 py-1 hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize(id);
            }}
            aria-label="Maximize"
          >
            <Maximize2 size={12} />
          </button>
          <button
            className="px-2 py-1 hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
            aria-label="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="bg-white flex-1 overflow-auto">{content}</div>
    </div>
  );
}
