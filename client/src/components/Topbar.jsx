import React from 'react';
import { Menu } from 'lucide-react';

export default function Topbar({ onMenu }) {
  return (
    <div className="flex items-center justify-center bg-white/70 backdrop-blur border-b relative p-2">
      <button
        className="absolute left-2 p-1 hover:bg-white rounded"
        onClick={onMenu}
        aria-label="Menü öffnen"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="font-bold select-none">SEEsg – ErniezOS</h1>
    </div>
  );
}
