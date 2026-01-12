import React, { useEffect, useState } from 'react';
import {
  Cloud,
  Plus,
  Pencil,
  Save,
  RefreshCw,
  Trash2,
  Server,
  HardDrive,
  AlertTriangle,
  X,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE || 'local').toLowerCase();
const STORAGE_KEY = 'dashboardDomains';

const normalizeDomain = (value) => {
  if (!value) return '';
  const trimmed = value.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, '');
  const withoutPath = withoutProtocol.split('/')[0];
  const withoutPort = withoutPath.split(':')[0];
  return withoutPort;
};

const formatCheckedAt = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

const buildDomainStatus = (name, data) => {
  const sslDate =
    data?.ssl && data.ssl !== 'unbekannt' ? new Date(data.ssl) : null;
  const daysLeft =
    sslDate && !Number.isNaN(sslDate.getTime())
      ? Math.ceil((sslDate - new Date()) / (1000 * 60 * 60 * 24))
      : null;

  return {
    name,
    status: data?.status || 'error',
    ssl: data?.ssl || 'unbekannt',
    daysLeft,
    checkedAt: new Date().toISOString(),
  };
};

const statusConfig = {
  ok: {
    label: 'Online',
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  down: {
    label: 'Offline',
    badge: 'border-rose-500/40 bg-rose-500/10 text-rose-700',
    dot: 'bg-rose-500',
  },
  error: {
    label: 'Fehler',
    badge: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
    dot: 'bg-amber-500',
  },
};


function DomainItem({ domain, onUpdate, onRemove, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(domain.name);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!editing) {
      setValue(domain.name);
      setLocalError('');
    }
  }, [domain.name, editing]);

  const save = async () => {
    const result = await onUpdate(domain.name, value);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    setEditing(false);
    setLocalError('');
  };

  const cancel = () => {
    setEditing(false);
    setValue(domain.name);
    setLocalError('');
  };

  const statusInfo = domain.isChecking
    ? {
        label: 'Pruefe...',
        badge: 'border-slate-300 bg-slate-100 text-slate-600',
        dot: 'bg-slate-400',
      }
    : statusConfig[domain.status] || statusConfig.error;

  let sslText = 'SSL unbekannt';
  let sslClass = 'text-slate-500';
  if (domain.ssl && domain.ssl !== 'unbekannt' && domain.daysLeft !== null) {
    if (domain.daysLeft < 0) {
      sslText = `SSL abgelaufen vor ${Math.abs(domain.daysLeft)} Tagen`;
      sslClass = 'text-rose-600 font-semibold';
    } else if (domain.daysLeft <= 7) {
      sslText = `SSL laeuft bald ab (${domain.daysLeft} Tage)`;
      sslClass = 'text-amber-600 font-semibold';
    } else {
      sslText = `SSL bis ${domain.ssl} (${domain.daysLeft} Tage)`;
      sslClass = 'text-slate-600';
    }
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    save();
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    cancel();
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400"
              />
              {localError ? (
                <p className="text-xs text-rose-600">{localError}</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">
                  {domain.name}
                </p>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusInfo.badge}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>
              <p className={`mt-1 text-sm ${sslClass}`}>{sslText}</p>
              <p className="mt-2 text-xs text-slate-500">
                Zuletzt geprueft: {formatCheckedAt(domain.checkedAt)}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={save}
                title="Speichern"
              >
                <Save size={16} />
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={cancel}
                title="Abbrechen"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={() => onRefresh(domain.name)}
                title="Aktualisieren"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={() => setEditing(true)}
                title="Bearbeiten"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-rose-600"
                onClick={() => onRemove(domain.name)}
                title="Entfernen"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [serverStorage, setServerStorage] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) {
        throw new Error('Healthcheck fehlgeschlagen');
      }
      const data = await res.json();
      setServerStorage(data.storage);
      setApiStatus('online');
      setGlobalError('');
    } catch (err) {
      setApiStatus('offline');
      setServerStorage(null);
    }
  };

  const fetchStatus = async (name) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/status?domain=${encodeURIComponent(name)}`
      );
      if (!res.ok) {
        throw new Error('Status nicht erreichbar');
      }
      const data = await res.json();
      setApiStatus('online');
      return buildDomainStatus(name, data);
    } catch (err) {
      setApiStatus('offline');
      return {
        name,
        status: 'error',
        ssl: 'unbekannt',
        daysLeft: null,
        checkedAt: new Date().toISOString(),
        error: 'Backend nicht erreichbar',
      };
    }
  };

  const loadDomains = async () => {
    if (STORAGE_MODE === 'server') {
      const res = await fetch(`${API_BASE}/api/domains`);
      if (!res.ok) {
        throw new Error('Domains konnten nicht geladen werden');
      }
      const data = await res.json();
      return data.domains || [];
    }

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return saved.length ? saved : [];
  };

  const persistLocalDomains = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addDomainToServer = async (name) => {
    const res = await fetch(`${API_BASE}/api/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: name }),
    });
    if (!res.ok) {
      throw new Error('Domain konnte nicht gespeichert werden');
    }
  };

  const updateDomainOnServer = async (oldName, newName) => {
    const res = await fetch(
      `${API_BASE}/api/domains/${encodeURIComponent(oldName)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newName }),
      }
    );
    if (!res.ok) {
      throw new Error('Domain konnte nicht aktualisiert werden');
    }
  };

  const removeDomainOnServer = async (name) => {
    const res = await fetch(
      `${API_BASE}/api/domains/${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok && res.status !== 204) {
      throw new Error('Domain konnte nicht geloescht werden');
    }
  };

  const updateDomain = async (oldName, newName) => {
    const normalized = normalizeDomain(newName);
    if (!normalized) {
      return { ok: false, error: 'Bitte eine gueltige Domain eingeben.' };
    }
    if (normalized === oldName) {
      return { ok: true };
    }
    if (domains.some((domain) => domain.name === normalized)) {
      return { ok: false, error: 'Domain ist bereits vorhanden.' };
    }

    try {
      if (STORAGE_MODE === 'server') {
        await updateDomainOnServer(oldName, normalized);
      }
      const updatedDomain = await fetchStatus(normalized);
      setDomains((prev) => {
        const updated = prev.map((domain) =>
          domain.name === oldName ? { ...updatedDomain } : domain
        );
        if (STORAGE_MODE !== 'server') {
          persistLocalDomains(updated.map((domain) => domain.name));
        }
        return updated;
      });
      return { ok: true };
    } catch (err) {
      setGlobalError(err.message);
      return { ok: false, error: 'Aktualisierung fehlgeschlagen.' };
    }
  };

  const removeDomain = async (name) => {
    try {
      if (STORAGE_MODE === 'server') {
        await removeDomainOnServer(name);
      }
      setDomains((prev) => {
        const updated = prev.filter((domain) => domain.name !== name);
        if (STORAGE_MODE !== 'server') {
          persistLocalDomains(updated.map((domain) => domain.name));
        }
        return updated;
      });
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  const refreshDomain = async (name) => {
    setDomains((prev) =>
      prev.map((domain) =>
        domain.name === name ? { ...domain, isChecking: true } : domain
      )
    );
    const updated = await fetchStatus(name);
    setDomains((prev) =>
      prev.map((domain) =>
        domain.name === name ? { ...updated, isChecking: false } : domain
      )
    );
  };

  const refreshAll = async () => {
    setRefreshingAll(true);
    await Promise.all(domains.map((domain) => refreshDomain(domain.name)));
    setRefreshingAll(false);
  };

  const addDomain = async (event) => {
    event.preventDefault();
    setFormError('');
    setGlobalError('');
    const normalized = normalizeDomain(newDomain);
    if (!normalized) {
      setFormError('Bitte eine Domain ohne http(s) eingeben.');
      return;
    }
    if (domains.some((domain) => domain.name === normalized)) {
      setFormError('Diese Domain ist bereits vorhanden.');
      return;
    }
    try {
      if (STORAGE_MODE === 'server') {
        await addDomainToServer(normalized);
      }
      const status = await fetchStatus(normalized);
      setDomains((prev) => {
        const updated = [...prev, status];
        if (STORAGE_MODE !== 'server') {
          persistLocalDomains(updated.map((domain) => domain.name));
        }
        return updated;
      });
      setNewDomain('');
    } catch (err) {
      setGlobalError(err.message);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const names = await loadDomains();
        const statuses = await Promise.all(
          names.map((name) => fetchStatus(name))
        );
        setDomains(statuses);
      } catch (err) {
        setGlobalError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const StorageIcon = STORAGE_MODE === 'server' ? Server : HardDrive;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-900">
      <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white shadow">
                <Cloud size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Uptime Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Schnell pruefen, ob eine Domain erreichbar ist und wie lange
                  das SSL-Zertifikat noch gueltig ist.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <StorageIcon size={16} />
              <span>
                Speicher:{' '}
                {STORAGE_MODE === 'server'
                  ? `Server${serverStorage ? ` (${serverStorage})` : ''}`
                  : 'Browser-Cache'}
              </span>
            </div>
          </div>
        </header>

        {apiStatus === 'offline' ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Backend nicht erreichbar. Starte zuerst den Server unter{' '}
              <span className="font-semibold">{API_BASE}</span>.
            </div>
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Neue Domain pruefen</h2>
              <p className="text-sm text-slate-500">
                Eingabe ohne Protokoll, Pfad oder Port, z. B. example.com
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
              onClick={refreshAll}
              disabled={refreshingAll || domains.length === 0}
            >
              <RefreshCw size={16} />
              Alle aktualisieren
            </button>
          </div>
          <form onSubmit={addDomain} className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="z. B. status.example.com"
                value={newDomain}
                onChange={(e) => {
                  setNewDomain(e.target.value);
                  if (formError) {
                    setFormError('');
                  }
                }}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                <Plus size={16} />
                Hinzufuegen
              </button>
            </div>
            {formError ? (
              <p className="text-sm text-rose-600">{formError}</p>
            ) : null}
          </form>
        </section>

        {globalError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {globalError}
          </div>
        ) : null}

        <section className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-500 shadow-sm backdrop-blur">
              Lade Domains...
            </div>
          ) : null}
          {!loading && domains.length === 0 ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-500 shadow-sm backdrop-blur">
              Noch keine Domains angelegt. Fuege oben eine Domain hinzu, um den
              Status zu pruefen.
            </div>
          ) : null}
          {domains.map((domain) => (
            <DomainItem
              key={domain.name}
              domain={domain}
              onUpdate={updateDomain}
              onRemove={removeDomain}
              onRefresh={refreshDomain}
            />
          ))}
        </section>

        <footer className="rounded-3xl border border-white/60 bg-white/70 px-6 py-4 text-xs text-slate-500 shadow-sm backdrop-blur">
          <p>
            Tipp: Fuer gemeinsame Nutzung aktiviere den Server-Speicher in der
            Konfiguration und optional eine Datenbank.
          </p>
        </footer>
      </div>
    </div>
  );
}
