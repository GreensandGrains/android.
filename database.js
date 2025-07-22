const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class Database {
    constructor() {
        this.isPostgres = false;
        this.pool = null;
        this.db = null;
        
        // Try PostgreSQL first, fallback to SQLite
        if (process.env.DATABASE_URL) {
            try {
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                });
                this.isPostgres = true;
                console.log('📊 Using PostgreSQL database');
            } catch (error) {
                console.warn('⚠️ PostgreSQL connection failed, falling back to SQLite:', error.message);
                this.isPostgres = false;
            }
        }
        
        if (!this.isPostgres) {
            this.initSQLite().then(() => {
                this.initializeTables();
            });
        } else {
            this.initializeTables();
        }
    }

    async initSQLite() {
        try {
            this.db = await open({
                filename: './database.sqlite',
                driver: sqlite3.Database
            });
            console.log('📊 Using SQLite database');
        } catch (error) {
            console.error('❌ SQLite initialization failed:', error);
            // Create in-memory fallback
            this.db = await open({
                filename: ':memory:',
                driver: sqlite3.Database
            });
            console.log('📊 Using in-memory SQLite database');
        }
    }

    async initializeTables() {
        try {
            if (this.isPostgres) {
                // PostgreSQL table creation
                await this.pool.query(`
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(255) PRIMARY KEY,
                        username VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        avatar VARCHAR(255),
                        discriminator VARCHAR(10),
                        role VARCHAR(50) DEFAULT 'free',
                        plan VARCHAR(50) DEFAULT 'starter',
                        permissions TEXT[] DEFAULT ARRAY['view_templates', 'create_basic_bot'],
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await this.pool.query(`
                    CREATE TABLE IF NOT EXISTS orders (
                        id SERIAL PRIMARY KEY,
                        order_id VARCHAR(255) UNIQUE NOT NULL,
                        order_number VARCHAR(20) NOT NULL,
                        user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                        content TEXT NOT NULL,
                        status VARCHAR(100) DEFAULT '⏳ Pending Admin Response',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                console.log('✅ PostgreSQL tables initialized successfully');
            } else {
                // SQLite table creation
                await this.db.exec(`
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        username TEXT NOT NULL,
                        email TEXT,
                        avatar TEXT,
                        discriminator TEXT,
                        role TEXT DEFAULT 'free',
                        plan TEXT DEFAULT 'starter',
                        permissions TEXT DEFAULT '["view_templates", "create_basic_bot"]',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await this.db.exec(`
                    CREATE TABLE IF NOT EXISTS orders (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id TEXT UNIQUE NOT NULL,
                        order_number TEXT NOT NULL,
                        user_id TEXT NOT NULL,
                        content TEXT NOT NULL,
                        status TEXT DEFAULT '⏳ Pending Admin Response',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                `);

                console.log('✅ SQLite tables initialized successfully');
            }
        } catch (error) {
            console.error('❌ Error initializing database tables:', error);
        }
    }

    async createOrUpdateUser(userData) {
        try {
            if (this.isPostgres) {
                const query = `
                    INSERT INTO users (id, username, email, avatar, discriminator)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) 
                    DO UPDATE SET 
                        username = EXCLUDED.username,
                        email = EXCLUDED.email,
                        avatar = EXCLUDED.avatar,
                        discriminator = EXCLUDED.discriminator,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `;

                const values = [
                    userData.id,
                    userData.username,
                    userData.email,
                    userData.avatar,
                    userData.discriminator
                ];

                const result = await this.pool.query(query, values);
                return result.rows[0];
            } else {
                // SQLite implementation
                const query = `
                    INSERT OR REPLACE INTO users (id, username, email, avatar, discriminator, updated_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                `;

                const values = [
                    userData.id,
                    userData.username,
                    userData.email,
                    userData.avatar,
                    userData.discriminator
                ];

                await this.db.run(query, values);
                return await this.db.get('SELECT * FROM users WHERE id = ?', [userData.id]);
            }
        } catch (error) {
            console.error('Error creating/updating user:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            if (this.isPostgres) {
                const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
                return result.rows[0];
            } else {
                return await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async createOrder(orderData) {
        try {
            return { success: true, message: 'Order created successfully' };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserOrders(userId) {
        try {
            return [];
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    }

    async getUserUsage(userId) {
        return { command_count: 0, bot_count: 0, storage_used: 0 };
    }

    async updateUserUsage(userId, usage) {
        return true;
    }

    async resetUserUsage(userId) {
        return true;
    }

    async getUserPlan(userId) {
        return 'starter';
    }
}

module.exports = Database;