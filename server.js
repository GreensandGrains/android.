const express = require('express');
const path = require('path');
const crypto = require('crypto');
const OrderBot = require('./discord-bot');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
let database;
try {
    database = new Database();
    console.log('✅ Database initialized');
} catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Create a fallback database object
    database = {
        createOrUpdateUser: async () => ({ id: 'fallback', username: 'user' }),
        getUserById: async () => ({ id: 'fallback', username: 'user', plan: 'starter' }),
        getUserUsage: async () => ({ command_count: 0, bot_count: 0, storage_used: 0 }),
        updateUserUsage: async () => {},
        resetUserUsage: async () => {},
        getUserPlan: async () => 'starter'
    };
}

// Initialize Discord Bot with error handling
let discordBot;
try {
    discordBot = new OrderBot(database);
    discordBot.start().catch(error => {
        console.warn('⚠️ Discord bot failed to start:', error.message);
        console.log('🌐 Web server will continue without Discord functionality');
    });
    console.log('🤖 Discord bot initialization attempted');
} catch (error) {
    console.warn('⚠️ Discord bot initialization failed:', error.message);
    // Create fallback bot object
    discordBot = {
        processOrder: async () => ({ success: false, error: 'Discord bot unavailable' }),
        sendDM: async () => ({ success: false, error: 'Discord bot unavailable' })
    };
}

// Discord OAuth configuration
const DISCORD_CLIENT_ID = '1382392124619886652';
const DISCORD_CLIENT_SECRET = 'xSN3hlhYuPX5RaRN9aNRk6Dw22kLK9sx';
const DISCORD_REDIRECT_URI = 'https://android-m682.onrender.com/auth/discord/callback';

// Store sessions in memory (use Redis/database in production)
const sessions = new Map();

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Generate state parameter for OAuth
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Discord OAuth initiation


    app.get('/auth/discord', (req, res) => {
    const state = generateState();
    sessions.set(state, { timestamp: Date.now() });
    
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email',
        state: state
    });
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.redirect(discordAuthUrl);
});

// Discord OAuth callback
app.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || !state || !sessions.has(state)) {
        return res.redirect('/login.html?error=invalid_request');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            return res.redirect('/login.html?error=token_failed');
        }

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return res.redirect('/login.html?error=no_token');
        }

        // Get user information
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });

        const userData = await userResponse.json();

        // Clean up state
        sessions.delete(state);

        // Create user session
        const sessionId = crypto.randomBytes(32).toString('hex');
        const user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256` : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`,
            discriminator: userData.discriminator
        };

        // Save user to database
        try {
            await database.createOrUpdateUser(user);
        } catch (error) {
            console.error('Error saving user to database:', error);
        }

        sessions.set(sessionId, {
            user: user,
            timestamp: Date.now()
        });

        // Redirect to success page with session data
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        background: #000; 
                        color: #fff; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0;
                    }
                    .success-container {
                        text-align: center;
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="success-container">
                    <h2>Login Successful!</h2>
                    <p>Welcome, ${user.username}!</p>
                    <p>Redirecting to Bot Builder...</p>
                </div>
                <script>
                    try {
                        const userData = ${JSON.stringify(user)};
                        userData.role = userData.role || 'free';
                        userData.permissions = userData.permissions || ['view_templates', 'create_basic_bot'];

                        localStorage.setItem('userData', JSON.stringify(userData));
                        localStorage.setItem('loginTimestamp', '${Date.now()}');
                        sessionStorage.setItem('sessionToken', '${sessionId}');
                        sessionStorage.setItem('authComplete', 'true');

                        setTimeout(() => {
                            window.location.replace('/bot-builder.html');
                        }, 1000);

                    } catch (error) {
                        console.error('Error during authentication setup:', error);
                        window.location.href = '/login.html';
                    }
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/login.html?error=auth_failed');
    }
});

// Protected routes middleware
function requireAuth(req, res, next) {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || !sessions.has(sessionToken)) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const session = sessions.get(sessionToken);
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionToken);
        return res.status(401).json({ error: 'Session expired' });
    }

    req.user = session.user;
    next();
}

// API endpoint to check auth status
app.get('/api/auth/status', (req, res) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || !sessions.has(sessionToken)) {
        return res.status(401).json({ authenticated: false });
    }

    const session = sessions.get(sessionToken);
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionToken);
        return res.status(401).json({ authenticated: false });
    }

    res.json({
        authenticated: true,
        user: session.user
    });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken && sessions.has(sessionToken)) {
        sessions.delete(sessionToken);
    }

    res.json({ success: true });
});

// Order processing endpoint
app.post('/api/order', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Order content is required' });
        }

        const orderData = {
            orderId: `order_${Date.now()}_${userId}`,
            orderNumber: Date.now().toString().slice(-6),
            userId: userId,
            content: content.trim(),
            status: '⏳ Pending Admin Response'
        };

        await database.createOrder(orderData);
        await discordBot.processOrder(userId, content.trim());

        res.json({ 
            success: true, 
            message: 'Order submitted successfully! Check your DMs for confirmation.',
            orderData: orderData
        });

    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process order. Please ensure your Discord DMs are enabled.' 
        });
    }
});

// Get user orders
app.get('/api/user/orders', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await database.getUserOrders(userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Cancel order endpoint
app.post('/api/order/cancel', requireAuth, async (req, res) => {
    try {
        const { orderNumber } = req.body;
        const userId = req.user.id;

        const cancelledOrder = await database.cancelOrder(orderNumber, userId);

        if (!cancelledOrder) {
            return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
        }

        res.json({ 
            success: true, 
            message: 'Order cancelled successfully' 
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// Get public orders
app.get('/api/orders/public', async (req, res) => {
    try {
        const completedOrders = await database.getCompletedOrders();
        const formattedOrders = completedOrders.map(order => ({
            orderId: order.order_id,
            orderNumber: order.order_number,
            content: order.content,
            status: order.status,
            createdAt: order.created_at,
            userInfo: {
                username: order.username,
                avatar: order.avatar
            }
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching public orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get user code files
app.get('/api/user/code', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const orderNumber = req.query.order;
        const codeFiles = await database.getUserCode(userId, orderNumber);

        const userCodeObj = {};
        codeFiles.forEach(file => {
            userCodeObj[file.filename] = {
                filename: file.filename,
                content: file.content,
                language: file.language,
                orderNumber: file.order_number,
                createdAt: file.created_at
            };
        });

        res.json(userCodeObj);
    } catch (error) {
        console.error('Error fetching user code:', error);
        res.status(500).json({ error: 'Failed to fetch code files' });
    }
});

// Get code files for a specific order
app.get('/api/order/:orderNumber/code', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const orderNumber = req.params.orderNumber;

        const codeFiles = await database.getUserCode(userId, orderNumber);

        // Convert to object format expected by frontend
        const orderCodeObj = {};
        codeFiles.forEach(file => {
            orderCodeObj[file.filename] = {
                filename: file.filename,
                content: file.content,
                language: file.language,
                orderNumber: file.order_number,
                createdAt: file.created_at
            };
        });

        res.json(orderCodeObj);

    } catch (error) {
        console.error('Error fetching order code:', error);
        res.status(500).json({ error: 'Failed to fetch order code files' });
    }
});

// Save bot to gallery
app.post('/api/bots/save', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { projectId, name, description, files, language, status } = req.body;

        // Calculate file count and size
        const fileCount = files ? files.length : 0;
        const sizeBytes = files ? JSON.stringify(files).length : 0;

        const botData = {
            projectId,
            name,
            description,
            language,
            status,
            fileCount,
            sizeBytes
        };

        const savedBot = await database.saveUserBot(userId, botData);

        res.json({
            success: true,
            bot: savedBot
        });

    } catch (error) {
        console.error('Error saving bot:', error);
        res.status(500).json({ error: 'Failed to save bot' });
    }
});

// Get user bots
app.get('/api/user/bots', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const bots = await database.getUserBots(userId);
        res.json(bots);
    } catch (error) {
        console.error('Error fetching user bots:', error);
        res.status(500).json({ error: 'Failed to fetch bots' });
    }
});

// Get user usage statistics
app.get('/api/user/usage', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const usage = await database.getUserUsage(userId);

        // Get plan limits
        const planLimits = {
            starter: { commands: 50, bots: 3, storage: 100 * 1024 * 1024 }, // 100MB
            premium: { commands: 100, bots: 5, storage: 500 * 1024 * 1024 }, // 500MB
            pro: { commands: -1, bots: -1, storage: -1 } // Unlimited
        };

        const userPlan = usage.plan || 'starter';
        const limits = planLimits[userPlan];

        res.json({
            usage: {
                commands: usage.command_count || 0,
                bots: usage.bot_count || 0,
                storage: usage.storage_used || 0
            },
            limits,
            plan: userPlan
        });
    } catch (error) {
        console.error('Error fetching user usage:', error);
        res.status(500).json({ error: 'Failed to fetch usage data' });
    }
});

// Static pages
app.get('/bot-builder.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'bot-builder.html'));
});

app.get('/template.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'template.html'));
});

app.get('/coding-environment.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'coding-environment.html'));
});

// API endpoint to use template and save to user's bots
app.post('/api/templates/use', requireAuth, async (req, res) => {
    try {
        const { templateName, templateType } = req.body;
        const userId = req.user.id;

        // Generate unique order number for template
        const orderNumber = 'TPL' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Create order entry for template
        const orderData = {
            orderId: `template_${Date.now()}_${userId}`,
            orderNumber: orderNumber,
            userId: userId,
            content: `${templateName} template - Customizable bot template with pre-built features`,
            status: '✅ Template Ready'
        };

        // Store order in database
        const savedOrder = await database.createOrder(orderData);

        res.json({
            success: true,
            orderNumber: orderNumber,
            message: 'Template added to your bots gallery'
        });

    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Failed to save template' });
    }
});

// Execution endpoints
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

// Store running processes
const runningProcesses = new Map();

// Execute JavaScript endpoint
app.post('/api/execute/javascript', requireAuth, async (req, res) => {
    try {
        const { fileName, code, projectId } = req.body;
        const processId = `js_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create temp directory
        const tempDir = `/tmp/${processId}`;
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write file
        const filePath = `${tempDir}/${fileName}`;
        fs.writeFileSync(filePath, code);

        res.json({ success: true, processId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Execute Python endpoint
app.post('/api/execute/python', requireAuth, async (req, res) => {
    try {
        const { fileName, code, projectId } = req.body;
        const processId = `py_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create temp directory
        const tempDir = `/tmp/${processId}`;
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write file
        const filePath = `${tempDir}/${fileName}`;
        fs.writeFileSync(filePath, code);

        res.json({ success: true, processId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop execution endpoint
app.post('/api/execute/stop', requireAuth, async (req, res) => {
    try {
        const { processId } = req.body;

        if (runningProcesses.has(processId)) {
            const process = runningProcesses.get(processId);
            process.kill('SIGTERM');
            runningProcesses.delete(processId);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WebSocket server for execution streams
const wss = new WebSocket.Server({ port: 5001 });

wss.on('connection', (ws, req) => {
    const processId = req.url.split('/').pop();

    if (processId.startsWith('js_')) {
        // Execute JavaScript
        const tempDir = `/tmp/${processId}`;
        const fileName = fs.readdirSync(tempDir).find(f => f.endsWith('.js'));

        if (fileName) {
            const process = spawn('node', [fileName], { cwd: tempDir });
            runningProcesses.set(processId, process);

            process.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
            });

            process.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
            });

            process.on('close', (code) => {
                ws.send(JSON.stringify({ type: 'exit', code }));
                runningProcesses.delete(processId);
                ws.close();
            });
        }
    } else if (processId.startsWith('py_')) {
        // Execute Python
        const tempDir = `/tmp/${processId}`;
        const fileName = fs.readdirSync(tempDir).find(f => f.endsWith('.py'));

        if (fileName) {
            const process = spawn('python3', [fileName], { cwd: tempDir });
            runningProcesses.set(processId, process);

            process.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
            });

            process.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
            });

            process.on('close', (code) => {
                ws.send(JSON.stringify({ type: 'exit', code }));
                runningProcesses.delete(processId);
                ws.close();
            });
        }
    }
});

// Contact form endpoint - sends DM via Discord
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Your Discord User ID (replace with actual ID)
        const ADMIN_USER_ID = '1382392124619886652'; // Replace with your Discord user ID

        // Format the contact message
        const contactEmbed = {
            title: '🌟 New Contact Form Submission',
            color: 0x5865f2,
            fields: [
                { name: '👤 Name', value: name, inline: true },
                { name: '📧 Email', value: email, inline: true },
                { name: '📝 Subject', value: subject, inline: false },
                { name: '💬 Message', value: message, inline: false },
                { name: '🕒 Received', value: new Date().toLocaleString(), inline: true }
            ],
            footer: { text: 'Smart Serve Contact Form' }
        };

        // Send DM through Discord bot
        await discordBot.sendDM(ADMIN_USER_ID, { embeds: [contactEmbed] });

        res.json({ 
            success: true, 
            message: 'Message sent successfully! We\'ll get back to you soon.' 
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            error: 'Failed to send message. Please try again.' 
        });
    }
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket server running on port 5001`);
    console.log(`🔗 Discord OAuth redirect URI: ${DISCORD_REDIRECT_URI}`);
    console.log(`🚀 Server started successfully!`);
}).on('error', (err) => {
    console.error('❌ Server startup error:', err);
    if (err.code === 'EADDRINUSE') {
        console.log('Port 5000 is already in use. Trying port 5001...');
        server.listen(5001, '0.0.0.0');
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
