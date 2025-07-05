import React, { useEffect, useState } from 'react';
import { Cloud, Plus, Pencil, Save } from 'lucide-react';

function DomainItem({ domain, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(domain.name);

  const save = async () => {
    setEditing(false);
    if (value !== domain.name) {
      await onUpdate(domain.name, value);
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm flex items-center justify-between">
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
            <p className="text-sm text-gray-600">Status: {domain.status}</p>
            <p className="text-sm text-gray-600">SSL bis: {domain.ssl} ({domain.daysLeft} Tage)</p>
          </>
        )}
      </div>
      <button
        className="ml-2 text-blue-500"
        onClick={editing ? save : () => setEditing(true)}
      >
        {editing ? <Save size={16} /> : <Pencil size={16} />}
      </button>
    </div>
  );
}

export default function App() {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const storageKey = 'dashboardDomains';

  const fetchStatus = async (name) => {
    try {
      const res = await fetch('http://localhost:3001/api/status');
      const data = await res.json();
      const daysLeft = Math.ceil(
        (new Date(data.ssl) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return { name, status: data.status, ssl: data.ssl, daysLeft };
    } catch (err) {
      return { name, status: 'error', ssl: 'unbekannt', daysLeft: 0 };
    }
  };

  const addDomain = async (e) => {
    e.preventDefault();
    if (!newDomain) return;
    const domain = await fetchStatus(newDomain);
    setDomains((prev) => {
      const updated = [...prev, domain];
      localStorage.setItem(storageKey, JSON.stringify(updated.map((d) => d.name)));
      return updated;
    });
    setNewDomain('');
  };

  const updateDomain = async (oldName, newName) => {
    const updatedDomain = await fetchStatus(newName);
    setDomains((prev) => {
      const updated = prev.map((d) => (d.name === oldName ? updatedDomain : d));
      localStorage.setItem(storageKey, JSON.stringify(updated.map((d) => d.name)));
      return updated;
    });
  };

  useEffect(() => {
    (async () => {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const names = saved.length ? saved : ['example.com'];
      const list = [];
      for (const name of names) {
        list.push(await fetchStatus(name));
      }
      setDomains(list);
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
          <DomainItem key={i} domain={d} onUpdate={updateDomain} />
        ))}
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Uptime Dashboard
      </footer>
    </div>
  );
}
