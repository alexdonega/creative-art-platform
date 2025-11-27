import { db, pool } from '../server/db';

async function migrateSchema() {
  try {
    console.log('Migrating database schema...');
    
    // Add nome column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS nome TEXT;
    `);
    
    // Rename columns in Usuarios table
    await pool.query(`
      ALTER TABLE "Usuarios" 
      DROP COLUMN IF EXISTS usuario CASCADE;
    `);
    
    await pool.query(`
      ALTER TABLE "Usuarios" 
      DROP COLUMN IF EXISTS empresa CASCADE;
    `);
    
    await pool.query(`
      ALTER TABLE "Usuarios" 
      DROP COLUMN IF EXISTS nome CASCADE;
    `);
    
    await pool.query(`
      ALTER TABLE "Usuarios" 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
    `);
    
    await pool.query(`
      ALTER TABLE "Usuarios" 
      ADD COLUMN IF NOT EXISTS empresa_id BIGINT REFERENCES "Empresas"(id);
    `);
    
    console.log('✅ Database schema migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating schema:', error);
    process.exit(1);
  }
}

migrateSchema();