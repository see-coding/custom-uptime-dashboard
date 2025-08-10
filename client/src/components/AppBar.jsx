import React from 'react';

export default function AppBar({ apps, onOpen }) {
  return (
    <div className="flex space-x-4 overflow-x-auto bg-white/70 backdrop-blur border-b p-2">
      {Object.entries(apps).map(([key, app]) => (
        <button
          key={key}
          onClick={() => onOpen(key)}
          className="flex flex-col items-center text-xs w-16 shrink-0 hover:bg-white/50 rounded p-1"
        >
          <app.icon className="w-6 h-6" />
          <span className="mt-1 text-center whitespace-nowrap">{app.title}</span>
        </button>
      ))}
    </div>
  );
}
