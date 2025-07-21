const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class Database {
    constructor() {
        this.isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');
        
        if (this.isPostgres) {
            try {
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                });
                console.log('📊 Using PostgreSQL database');
            } catch (error) {
                console.warn('⚠️ PostgreSQL connection failed, falling back to SQLite:', error.message);
                this.isPostgres = false;
            }
        }
        
        if (!this.isPostgres) {
            this.initSQLite();
        }

        this.initializeTables();
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
            // Create users table
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

            // Create user usage tracking table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS user_usage (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    command_count INTEGER DEFAULT 0,
                    bot_count INTEGER DEFAULT 0,
                    storage_used BIGINT DEFAULT 0,
                    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id)
                )
            `);

            // Create user bots table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS user_bots (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    project_id VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    language VARCHAR(50) DEFAULT 'javascript',
                    status VARCHAR(100) DEFAULT '🟢 Ready',
                    file_count INTEGER DEFAULT 0,
                    size_bytes BIGINT DEFAULT 0,
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

            // AI Feature Usage Tracking
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS ai_feature_usage (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    feature_type VARCHAR(100) NOT NULL,
                    complexity VARCHAR(50) DEFAULT 'basic',
                    language VARCHAR(50) DEFAULT 'javascript',
                    execution_time INTEGER,
                    success BOOLEAN DEFAULT true,
                    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Bot Templates for AI Generation
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS bot_templates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    language VARCHAR(50) NOT NULL,
                    complexity VARCHAR(50) DEFAULT 'basic',
                    template_data JSONB NOT NULL,
                    features JSONB,
                    created_by VARCHAR(255) REFERENCES users(id),
                    usage_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Performance Metrics Storage
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    code_id VARCHAR(255),
                    execution_time DECIMAL,
                    memory_usage DECIMAL,
                    cpu_usage DECIMAL,
                    performance_score INTEGER,
                    bottlenecks JSONB,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Security Analysis Results
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS security_analysis (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    code_id VARCHAR(255),
                    vulnerabilities JSONB,
                    security_score INTEGER,
                    risk_level VARCHAR(50),
                    compliance_status JSONB,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Code Quality Analysis
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS code_quality (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    code_id VARCHAR(255),
                    quality_score INTEGER,
                    maintainability_score INTEGER,
                    style_issues JSONB,
                    suggestions JSONB,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // AI Brainstorming Sessions
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS brainstorming_sessions (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    topic TEXT NOT NULL,
                    domain VARCHAR(100),
                    ideas JSONB,
                    solutions JSONB,
                    feasibility_analysis JSONB,
                    session_duration INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // User Plan History
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS plan_history (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) REFERENCES users(id),
                    old_plan VARCHAR(50),
                    new_plan VARCHAR(50),
                    upgraded_by VARCHAR(255),
                    upgrade_reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create indexes for better performance
            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_user_id ON ai_feature_usage(user_id);
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_feature_type ON ai_feature_usage(feature_type);
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_bot_templates_complexity ON bot_templates(complexity);
            `);

            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
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

    async updateUserPlan(userId, plan) {
        try {
            const query = `
                UPDATE users 
                SET plan = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;

            const result = await this.pool.query(query, [plan, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user plan:', error);
            throw error;
        }
    }

    async getUserPlan(userId) {
        try {
            const result = await this.pool.query('SELECT plan FROM users WHERE id = $1', [userId]);
            return result.rows[0]?.plan || 'starter';
        } catch (error) {
            console.error('Error fetching user plan:', error);
            return 'starter';
        }
    }

    async resetUserUsage(userId) {
        try {
            await this.pool.query(`
                UPDATE user_usage 
                SET command_count = 0, last_reset = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
            `, [userId]);
        } catch (error) {
            console.error('Error resetting user usage:', error);
            throw error;
        }
    }

    // AI Feature Analytics
    async logAIFeatureUsage(userId, featureType, complexity = 'basic', language = 'javascript') {
        try {
            await this.pool.query(`
                INSERT INTO ai_feature_usage (user_id, feature_type, complexity, language, used_at)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `, [userId, featureType, complexity, language]);
        } catch (error) {
            console.error('Error logging AI feature usage:', error);
        }
    }

    async getAIFeatureStats(userId) {
        try {
            const result = await this.pool.query(`
                SELECT 
                    feature_type,
                    complexity,
                    COUNT(*) as usage_count,
                    MAX(used_at) as last_used
                FROM ai_feature_usage 
                WHERE user_id = $1 
                GROUP BY feature_type, complexity
                ORDER BY usage_count DESC
            `, [userId]);

            return result.rows;
        } catch (error) {
            console.error('Error getting AI feature stats:', error);
            return [];
        }
    }

    async getUserAIAnalytics(userId) {
        try {
            const result = await this.pool.query(`
                SELECT 
                    COUNT(DISTINCT feature_type) as features_used,
                    COUNT(*) as total_ai_commands,
                    AVG(CASE WHEN complexity = 'pro' THEN 3 WHEN complexity = 'advanced' THEN 2 ELSE 1 END) as avg_complexity,
                    STRING_AGG(DISTINCT language, ', ') as languages_used
                FROM ai_feature_usage 
                WHERE user_id = $1
            `, [userId]);

            return result.rows[0] || {
                features_used: 0,
                total_ai_commands: 0,
                avg_complexity: 1,
                languages_used: 'None'
            };
        } catch (error) {
            console.error('Error getting user AI analytics:', error);
            return {
                features_used: 0,
                total_ai_commands: 0,
                avg_complexity: 1,
                languages_used: 'None'
            };
        }
    }

    // Advanced Bot Templates Storage
    async saveBotTemplate(templateData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO bot_templates (
                    name, description, language, complexity, 
                    template_data, features, created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                RETURNING id
            `, [
                templateData.name,
                templateData.description,
                templateData.language,
                templateData.complexity,
                JSON.stringify(templateData.files),
                JSON.stringify(templateData.features),
                templateData.createdBy
            ]);

            return result.rows[0];
        } catch (error) {
            console.error('Error saving bot template:', error);
            throw error;
        }
    }

    async getBotTemplates(complexity = 'all', language = 'all') {
        try {
            let query = 'SELECT * FROM bot_templates WHERE 1=1';
            let params = [];
            let paramCount = 0;

            if (complexity !== 'all') {
                paramCount++;
                query += ` AND complexity = $${paramCount}`;
                params.push(complexity);
            }

            if (language !== 'all') {
                paramCount++;
                query += ` AND language = $${paramCount}`;
                params.push(language);
            }

            query += ' ORDER BY created_at DESC';

            const result = await this.pool.query(query, params);
            return result.rows.map(row => ({
                ...row,
                template_data: JSON.parse(row.template_data),
                features: JSON.parse(row.features)
            }));
        } catch (error) {
            console.error('Error getting bot templates:', error);
            return [];
        }
    }

    // Performance Metrics
    async savePerformanceMetrics(userId, codeId, metrics) {
        try {
            await this.pool.query(`
                INSERT INTO performance_metrics (
                    user_id, code_id, execution_time, memory_usage, 
                    cpu_usage, performance_score, analyzed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            `, [
                userId, codeId, metrics.executionTime, metrics.memoryUsage,
                metrics.cpuUsage, metrics.performanceScore
            ]);
        } catch (error) {
            console.error('Error saving performance metrics:', error);
        }
    }

    // Security Analysis Storage
    async saveSecurityAnalysis(userId, codeId, vulnerabilities, securityScore) {
        try {
            await this.pool.query(`
                INSERT INTO security_analysis (
                    user_id, code_id, vulnerabilities, security_score, analyzed_at
                ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `, [userId, codeId, JSON.stringify(vulnerabilities), securityScore]);
        } catch (error) {
            console.error('Error saving security analysis:', error);
        }
    }

    async updateUserUsage(userId) {
        try {
            const botCountQuery = `SELECT COUNT(*) as count FROM user_bots WHERE user_id = $1`;
            const storageQuery = `SELECT COALESCE(SUM(size_bytes), 0) as total FROM user_bots WHERE user_id = $1`;

            const [botCountResult, storageResult] = await Promise.all([
                this.pool.query(botCountQuery, [userId]),
                this.pool.query(storageQuery, [userId])
            ]);

            const botCount = parseInt(botCountResult.rows[0].count);
            const storageUsed = parseInt(storageResult.rows[0].total);

            const updateQuery = `
                INSERT INTO user_usage (user_id, bot_count, storage_used)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id)
                DO UPDATE SET 
                    bot_count = EXCLUDED.bot_count,
                    storage_used = EXCLUDED.storage_used,
                    updated_at = CURRENT_TIMESTAMP
            `;

            await this.pool.query(updateQuery, [userId, botCount, storageUsed]);
        } catch (error) {
            console.error('Error updating user usage:', error);
            throw error;
        }
    }

    async getUserUsage(userId) {
        try {
            const query = `
                SELECT u.*, uu.command_count, uu.bot_count, uu.storage_used
                FROM users u
                LEFT JOIN user_usage uu ON u.id = uu.user_id
                WHERE u.id = $1
            `;

            const result = await this.pool.query(query, [userId]);
            return result.rows[0] || { command_count: 0, bot_count: 0, storage_used: 0 };
        } catch (error) {
            console.error('Error fetching user usage:', error);
            return { command_count: 0, bot_count: 0, storage_used: 0 };
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = Database;