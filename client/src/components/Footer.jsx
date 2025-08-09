import React from 'react';

export default function Footer({ windows, onSelect }) {
  return (
    <div className="flex space-x-2 p-2 bg-white/70 backdrop-blur border-t">
      {windows.map((w) => (
        <button
          key={w.id}
          onClick={() => onSelect(w.id)}
          className={`px-2 py-1 text-xs rounded ${w.minimized ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
        >
          {w.title}
        </button>
      ))}
    </div>
  );
}
