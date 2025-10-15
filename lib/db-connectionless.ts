import mysql from 'mysql2/promise'

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pandit_ecom',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Removed invalid MySQL2 options: acquireTimeout, timeout, reconnect
  // These options are not supported by MySQL2 and cause warnings
}

// Create connection pool
let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Execute query with connection pool
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  const connectionPool = getPool()
  
  try {
    const [rows] = await connectionPool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Execute query with direct connection (for transactions)
export async function executeWithPool(sql: string, params: any[] = []): Promise<any> {
  const connectionPool = getPool()
  
  try {
    const [rows] = await connectionPool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connectionPool = getPool()
    await connectionPool.execute('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Close all connections
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Get connection pool status
export function getConnectionStatus() {
  return {
    isConnected: pool !== null,
    config: {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    },
    timestamp: new Date().toISOString()
  }
}

export default {
  executeQuery,
  executeWithPool,
  testConnection,
  closeConnections,
  getConnectionStatus
}
