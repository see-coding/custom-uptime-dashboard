import React, { useEffect, useState } from 'react';
import { Cloud, Plus, Pencil, Save, Trash } from 'lucide-react';

function DomainItem({
  domain,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(domain.name);

  const save = async () => {
    setEditing(false);
    if (value !== domain.name) {
      await onUpdate(domain.name, value);
    }
  };

  return (
    <div
      className="border rounded p-4 bg-white shadow-sm flex items-center justify-between"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex-1">
        {editing ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          <>
            <p className="font-semibold">{domain.name}</p>
            <p className="text-sm text-gray-600 flex items-center">
              Status:
              <span
                className={`ml-1 h-2 w-2 rounded-full ${
                  domain.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="ml-1">{domain.status}</span>
            </p>
            <p
              className={`text-sm ${
                domain.ssl && domain.ssl !== 'unbekannt'
                  ? domain.daysLeft < 0
                    ? 'font-bold text-[#ff0000]'
                    : domain.daysLeft <= 7
                    ? 'italic text-[#ff6600]'
                    : 'text-[#a6a6a6]'
                  : 'text-gray-600'
              }`}
            >
              SSL bis: {domain.ssl} ({domain.daysLeft} Tage)
            </p>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-2">
        <button
          className="text-blue-500"
          onClick={editing ? save : () => setEditing(true)}
        >
          {editing ? <Save size={16} /> : <Pencil size={16} />}
        </button>
        <button className="text-red-500" onClick={() => onDelete(domain.name)}>
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const storageKey = 'dashboardDomains';
  const apiBase = 'http://localhost:3001/api';

import React, { useState, useRef } from 'react';
import Topbar from './components/Topbar';
import AppBar from './components/AppBar';
import WindowManager from './components/WindowManager';
import Footer from './components/Footer';
import MenuOverlay from './components/MenuOverlay';
import PlaceholderApp from './apps/PlaceholderApp';
import UptimeApp from './apps/UptimeApp';
import {
  FileText,
  Building2,
  DollarSign,
  Cloud,
  Music2,
  StickyNote,
  CheckSquare,
  BarChart3,
  Settings,
} from 'lucide-react';

const appRegistry = {
  invoice: { title: 'Rechnung', icon: FileText, component: () => <PlaceholderApp title="Rechnung" /> },
  company: { title: 'Firma', icon: Building2, component: () => <PlaceholderApp title="Firma" /> },
  finance: { title: 'Finanzstatus', icon: DollarSign, component: () => <PlaceholderApp title="Finanzstatus" /> },
  uptime: { title: 'Uptime', icon: Cloud, component: UptimeApp },
  nippel: { title: 'Nippelboard', icon: Music2, component: () => <PlaceholderApp title="Nippelboard" /> },
  otn: { title: 'OTN', icon: StickyNote, component: () => <PlaceholderApp title="One-Time-Note" /> },
  todo: { title: 'ToDo', icon: CheckSquare, component: () => <PlaceholderApp title="ToDo" /> },
  fsapp: { title: 'FSapp', icon: BarChart3, component: () => <PlaceholderApp title="FSapp" /> },
  settings: { title: 'AppSettings', icon: Settings, component: () => <PlaceholderApp title="Einstellungen" /> },
};

export default function App() {
  const [windows, setWindows] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const zRef = useRef(1);


  const openApp = (key) => {
    const app = appRegistry[key];
    if (!app) return;
    setWindows((prev) => {
      const existing = prev.find((w) => w.key === key);
      if (existing) {
        return prev.map((w) =>
          w.key === key ? { ...w, minimized: false } : w
        );
      }
      const id = Date.now();
      const z = zRef.current++;
      return [
        ...prev,
        {
          id,
          key,
          title: app.title,
          component: app.component,
          position: { x: 100, y: 80 },
          zIndex: z,
          minimized: false,
          maximized: false,
        },
      ];
    });
  };

  const selectFromFooter = (id) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: zRef.current++ } : w
      )
    );
  };


  const deleteDomain = async (name) => {
    setDomains((prev) => {
      const updated = prev.filter((d) => d.name !== name);
      const names = updated.map((d) => d.name);
      localStorage.setItem(storageKey, JSON.stringify(names));
      saveDomains(names);
      return updated;
    });
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDomains((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      const names = updated.map((d) => d.name);
      localStorage.setItem(storageKey, JSON.stringify(names));
      saveDomains(names);
      return updated;
    });
    setDraggedIndex(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/domains`);
        const names = await res.json();
        const list = [];
        for (const name of names.length ? names : ['example.com']) {
          list.push(await fetchStatus(name));
        }
        setDomains(list);
      } catch {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const names = saved.length ? saved : ['example.com'];
        const list = [];
        for (const name of names) {
          list.push(await fetchStatus(name));
        }
        setDomains(list);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <nav className="flex items-center mb-4">
        <Cloud className="mr-2" />
        <h1 className="text-2xl font-bold">Uptime Dashboard</h1>
      </nav>
      <form onSubmit={addDomain} className="flex mb-4">
        <input
          type="text"
          placeholder="Domain hinzufügen"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="flex-1 border rounded-l px-2 py-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 rounded-r">
          <Plus size={16} />
        </button>
      </form>
      <div className="space-y-2">
        {domains.map((d, i) => (
          <DomainItem
            key={d.name}
            domain={d}
            onUpdate={updateDomain}
            onDelete={deleteDomain}
            onDragStart={() => setDraggedIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          />
        ))}

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Topbar onMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AppBar apps={appRegistry} onOpen={openApp} />
      <div className="flex-1 relative ">
        <WindowManager windows={windows} setWindows={setWindows} zRef={zRef} />

      </div>
      <Footer windows={windows} onSelect={selectFromFooter} />
    </div>
  );
}
