const { Pool } = require('pg');

const isSslEnabled = (() => {
  const mode = (process.env.PGSSLMODE || '').toLowerCase();
  return mode === 'require' || mode === 'enable' || mode === 'true';
})();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});

async function healthCheck() {
  const result = await pool.query('SELECT 1 as ok');
  return result.rows[0]?.ok === 1;
}

module.exports = { pool, healthCheck };


