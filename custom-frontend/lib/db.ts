import { Pool } from 'pg';

let pool: Pool;

export function getPool() {
  if (!pool) {
    const config: any = {
      connectionString: process.env.DATABASE_URL,
    };

    // Only use SSL in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_SSL === 'true') {
      config.ssl = {
        rejectUnauthorized: false
      };
    }

    pool = new Pool(config);
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function setAppUserId(userId: string | null) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    if (userId) {
      await client.query('SET app.current_user_id = $1', [userId]);
    } else {
      await client.query('RESET app.current_user_id');
    }
  } finally {
    client.release();
  }
}