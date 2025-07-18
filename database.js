
const { Pool } = require('pg');

class Database {
    constructor() {
        // Use environment variable for database connection
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        this.initializeTables();
    }

    async initializeTables() {
        try {
            // Create users table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    avatar VARCHAR(255),
                    discriminator VARCHAR(10),
                    role VARCHAR(50) DEFAULT 'free',
                    permissions TEXT[] DEFAULT ARRAY['view_templates', 'create_basic_bot'],
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create orders table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    order_id VARCHAR(255) UNIQUE NOT NULL,
                    order_number VARCHAR(20) NOT NULL,
                    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    content TEXT NOT NULL,
                    status VARCHAR(100) DEFAULT '⏳ Pending Admin Response',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    cancelled_at TIMESTAMP NULL,
                    completed_at TIMESTAMP NULL
                )
            `);

            // Create user_code table for storing code files
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS user_code (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    order_number VARCHAR(20) NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    language VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Database tables initialized successfully');
        } catch (error) {
            console.error('Error initializing database tables:', error);
        }
    }

    async createOrUpdateUser(userData) {
        try {
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
        } catch (error) {
            console.error('Error creating/updating user:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const query = `
                INSERT INTO orders (order_id, order_number, user_id, content, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            
            const values = [
                orderData.orderId,
                orderData.orderNumber,
                orderData.userId,
                orderData.content,
                orderData.status
            ];

            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async getUserOrders(userId) {
        try {
            const query = `
                SELECT * FROM orders 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            `;
            
            const result = await this.pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw error;
        }
    }

    async updateOrderStatus(orderNumber, status, userId = null) {
        try {
            let query = `
                UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE order_number = $2
            `;
            let values = [status, orderNumber];

            if (userId) {
                query += ' AND user_id = $3';
                values.push(userId);
            }

            query += ' RETURNING *';

            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    async cancelOrder(orderNumber, userId) {
        try {
            const query = `
                UPDATE orders 
                SET status = '❌ Cancelled', 
                    cancelled_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_number = $1 AND user_id = $2 AND status = '⏳ Pending Admin Response'
                RETURNING *
            `;
            
            const result = await this.pool.query(query, [orderNumber, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    async getCompletedOrders() {
        try {
            const query = `
                SELECT o.*, u.username, u.avatar 
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.status = '✅ Completed'
                ORDER BY o.created_at DESC
            `;
            
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error fetching completed orders:', error);
            throw error;
        }
    }

    async saveUserCode(userId, orderNumber, filename, content, language = 'javascript') {
        try {
            const query = `
                INSERT INTO user_code (user_id, order_number, filename, content, language)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, order_number, filename)
                DO UPDATE SET 
                    content = EXCLUDED.content,
                    language = EXCLUDED.language,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            
            const values = [userId, orderNumber, filename, content, language];
            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saving user code:', error);
            throw error;
        }
    }

    async getUserCode(userId, orderNumber = null) {
        try {
            let query = `
                SELECT * FROM user_code 
                WHERE user_id = $1
            `;
            let values = [userId];

            if (orderNumber) {
                query += ' AND order_number = $2';
                values.push(orderNumber);
            }

            query += ' ORDER BY created_at DESC';

            const result = await this.pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error fetching user code:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = Database;
