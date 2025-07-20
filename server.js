const express = require('express');
const path = require('path');
const crypto = require('crypto');
const OrderBot = require('./discord-bot');
const Database = require('./database');

const app = express();
const PORT = 5000;

// Initialize Database
const database = new Database();

// Initialize Discord Bot
const discordBot = new OrderBot(database);
discordBot.start().catch(console.error);

// Discord OAuth configuration
const DISCORD_CLIENT_ID = '1382392124619886652';
const DISCORD_CLIENT_SECRET = '0GVe7ht4W-R1wMxxkq-mFBC1-CbpnD9E';
const DISCORD_REDIRECT_URI = 'https://smart-serve-discord-bot--40493350.repl.co/auth/discord/callback';

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

    if (!code) {
        return res.redirect('/login.html?error=no_code');
    }

    if (!state || !sessions.has(state)) {
        return res.redirect('/login.html?error=invalid_state');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: '1382392124619886652',
                client_secret: '0GVe7ht4W-R1wMxxkq-mFBC1-CbpnD9E',
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'https://smart-serve-discord-bot--40493350.repl.co/auth/discord/callback',
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
                        // Add role and permissions for client-side auth
                        const userData = ${JSON.stringify(user)};
                        userData.role = userData.role || 'free';
                        userData.permissions = userData.permissions || ['view_templates', 'create_basic_bot'];

                        // Clear any existing auth data first
                        localStorage.removeItem('userData');
                        localStorage.removeItem('loginTimestamp');
                        sessionStorage.clear();

                        // Set authentication data
                        localStorage.setItem('userData', JSON.stringify(userData));
                        localStorage.setItem('loginTimestamp', '${Date.now()}');

                        // Generate client-side compatible session token
                        const secret = 'smart-serve-secret-key';
                        const timestamp = '${Date.now()}';
                        const clientSessionToken = btoa(userData.id + secret + timestamp).slice(0, 32);
                        sessionStorage.setItem('sessionToken', clientSessionToken);

                        // Set server session token for API calls
                        sessionStorage.setItem('serverSessionToken', '${sessionId}');

                        // Mark authentication as complete to prevent auth.js from interfering
                        sessionStorage.setItem('authComplete', 'true');

                        console.log('Auth data set successfully');

                        // Redirect after a short delay to ensure data is saved
                        setTimeout(() => {
                            window.location.replace('/bot-builder.html');
                        }, 500);

                    } catch (error) {
                        console.error('Error during authentication setup:', error);
                        alert('Authentication error. Please try logging in again.');
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

// API endpoint to check auth status
app.get('/api/auth/status', (req, res) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || !sessions.has(sessionToken)) {
        return res.status(401).json({ authenticated: false });
    }

    const session = sessions.get(sessionToken);

    // Check if session is expired (24 hours)
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

// Protected routes middleware
function requireAuth(req, res, next) {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || !sessions.has(sessionToken)) {
        return res.redirect('/login.html');
    }

    const session = sessions.get(sessionToken);
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionToken);
        return res.redirect('/login.html');
    }

    req.user = session.user;
    next();
}

// Orders are now stored in PostgreSQL database

// Order processing endpoint
app.post('/api/order', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Discord user ID from session

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Order content is required' });
        }

        // Generate order data
        const orderData = {
            orderId: `order_${Date.now()}_${userId}`,
            orderNumber: Date.now().toString().slice(-6),
            userId: userId,
            content: content.trim(),
            status: '⏳ Pending Admin Response'
        };

        // Store order in database
        const savedOrder = await database.createOrder(orderData);

        // Process the order through Discord bot
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

// Get user orders endpoint
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

// Get all orders for bots page (public endpoint)
app.get('/api/orders/public', async (req, res) => {
    try {
        const completedOrders = await database.getCompletedOrders();

        // Format response to match frontend expectations
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

        // Convert to object format expected by frontend
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

// Protected pages - let client-side auth handle protection
app.get('/bot-builder.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'bot-builder.html'));
});

app.get('/template.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'template.html'));
});

// API endpoint to get public orders for gallery
app.get('/api/orders/public', async (req, res) => {
    try {
        const completedOrders = await database.getCompletedOrders();

        // Format response to match frontend expectations
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

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

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

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Please set up your Discord OAuth app with redirect URI: ${DISCORD_REDIRECT_URI}`);
});
