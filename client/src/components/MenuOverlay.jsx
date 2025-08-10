import React from 'react';

export default function MenuOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div className="absolute top-0 left-0 w-64 h-full bg-white/90 p-4" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold mb-2">Menü</p>
        <p className="text-sm text-gray-600">Noch keine Einträge</p>
      </div>
    </div>
  );
}
