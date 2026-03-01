const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Cannot run migrations.');
  process.exit(1);
}

const runMigrations = async () => {
  const client = new Client({ connectionString: DATABASE_URL, ssl: (process.env.PGSSLMODE === 'require') ? { rejectUnauthorized: false } : false });
  try {
    await client.connect();
    console.log('✓ Connected to database');

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`\nRunning migration: ${file}`);
      try {
        await client.query(sql);
        console.log(`✓ ${file} completed`);
      } catch (e) {
        console.error(`✗ ${file} failed:`, e.message);
        throw e;
      }
    }

    console.log('\n✓ All migrations completed');
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigrations();
