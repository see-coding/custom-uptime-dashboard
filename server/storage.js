const fs = require('fs/promises');
const path = require('path');

const sortDomains = (list) =>
  Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));

const memoryStore = () => {
  const domains = new Set();

  return {
    mode: 'memory',
    init: async () => {},
    list: async () => sortDomains(domains),
    add: async (name) => {
      domains.add(name);
    },
    update: async (oldName, newName) => {
      domains.delete(oldName);
      domains.add(newName);
    },
    remove: async (name) => {
      domains.delete(name);
    },
  };
};

const fileStore = (filePath, logger) => {
  const resolvedPath =
    filePath && filePath.trim().length
      ? path.resolve(filePath)
      : path.resolve(process.cwd(), 'data', 'domains.json');
  const domains = new Set();

  const persist = async () => {
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    const payload = {
      domains: sortDomains(domains),
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(resolvedPath, JSON.stringify(payload, null, 2));
  };

  return {
    mode: 'file',
    init: async () => {
      try {
        const content = await fs.readFile(resolvedPath, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data.domains)) {
          data.domains.forEach((name) => domains.add(name));
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.warn(`[storage] Konnte Datei nicht lesen: ${err.message}`);
        }
      }
    },
    list: async () => sortDomains(domains),
    add: async (name) => {
      domains.add(name);
      await persist();
    },
    update: async (oldName, newName) => {
      domains.delete(oldName);
      domains.add(newName);
      await persist();
    },
    remove: async (name) => {
      domains.delete(name);
      await persist();
    },
  };
};

const postgresStore = (databaseUrl) => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: databaseUrl });

  return {
    mode: 'postgres',
    init: async () => {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS uptime_domains (
          name TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )`
      );
    },
    list: async () => {
      const result = await pool.query(
        'SELECT name FROM uptime_domains ORDER BY name'
      );
      return result.rows.map((row) => row.name);
    },
    add: async (name) => {
      await pool.query(
        'INSERT INTO uptime_domains (name) VALUES ($1) ON CONFLICT DO NOTHING',
        [name]
      );
    },
    update: async (oldName, newName) => {
      if (oldName === newName) {
        return;
      }
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM uptime_domains WHERE name = $1', [
          oldName,
        ]);
        await client.query(
          'INSERT INTO uptime_domains (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [newName]
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    remove: async (name) => {
      await pool.query('DELETE FROM uptime_domains WHERE name = $1', [name]);
    },
  };
};

const createStorage = ({ mode, filePath, databaseUrl, logger = console }) => {
  const selectedMode = (mode || 'memory').toLowerCase();

  try {
    if (selectedMode === 'postgres') {
      if (!databaseUrl) {
        throw new Error('DATABASE_URL ist nicht gesetzt');
      }
      return postgresStore(databaseUrl);
    }
    if (selectedMode === 'file') {
      return fileStore(filePath, logger);
    }
    return memoryStore();
  } catch (err) {
    if (selectedMode === 'postgres' && err.code === 'MODULE_NOT_FOUND') {
      logger.warn(
        '[storage] Postgres-Modus verlangt das Paket "pg". Bitte npm install pg. Fallback: memory.'
      );
    } else {
      logger.warn(`[storage] ${err.message}. Fallback: memory.`);
    }
    return memoryStore();
  }
};

module.exports = { createStorage };
