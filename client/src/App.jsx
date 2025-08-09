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
