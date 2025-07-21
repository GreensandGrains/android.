
// Enhanced Custom Local AI Bot Assistant - 100x More Powerful
class CustomAIBotAssistant {
    constructor(database) {
        this.database = database;
        this.userUsage = new Map();
        this.planLimits = {
            starter: { 
                commands: 50, 
                bots: 3, 
                speed: 'normal',
                features: ['basic_generation', 'simple_debugging', 'template_access']
            },
            premium: { 
                commands: 100, 
                bots: 5, 
                speed: 'fast',
                features: ['advanced_generation', 'deep_debugging', 'code_optimization', 'security_analysis']
            },
            pro: { 
                commands: -1, 
                bots: -1, 
                speed: 'ultra_fast',
                features: ['all_features', 'custom_models', 'advanced_analytics']
            }
        };
        
        // Enhanced knowledge base with comprehensive Discord bot data
        this.codePatterns = this.initializeCodePatterns();
        this.errorDatabase = this.initializeErrorDatabase();
        this.templateDatabase = this.initializeTemplateDatabase();
        this.securityRules = this.initializeSecurityRules();
        this.optimizationRules = this.initializeOptimizationRules();
        this.discordKnowledgeBase = this.initializeDiscordKnowledgeBase();
        this.botArchitectures = this.initializeBotArchitectures();
        this.advancedFeatures = this.initializeAdvancedFeatures();
        this.performanceOptimizations = this.initializePerformanceOptimizations();
        this.bestPractices = this.initializeBestPractices();
    }

    // Initialize comprehensive Discord knowledge base
    initializeDiscordKnowledgeBase() {
        return {
            intents: {
                required: {
                    'Guilds': 'Basic guild information, channels, roles',
                    'GuildMessages': 'Message events in servers',
                    'MessageContent': 'Access to message content (privileged)',
                    'GuildMembers': 'Member join/leave events (privileged)',
                    'GuildVoiceStates': 'Voice channel events',
                    'GuildPresences': 'Member status updates (privileged)',
                    'DirectMessages': 'DM events',
                    'GuildMessageReactions': 'Reaction events',
                    'GuildBans': 'Ban/unban events',
                    'GuildEmojisAndStickers': 'Custom emoji/sticker events'
                },
                combinations: {
                    'basic_bot': ['Guilds', 'GuildMessages', 'MessageContent'],
                    'moderation_bot': ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers', 'GuildBans'],
                    'music_bot': ['Guilds', 'GuildMessages', 'MessageContent', 'GuildVoiceStates'],
                    'leveling_bot': ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers'],
                    'reaction_roles': ['Guilds', 'GuildMessages', 'GuildMessageReactions', 'GuildMembers']
                }
            },
            permissions: {
                administrator: 'Full control over the server',
                manage_guild: 'Manage server settings',
                manage_roles: 'Create, edit, delete roles',
                manage_channels: 'Create, edit, delete channels',
                kick_members: 'Kick members from server',
                ban_members: 'Ban members from server',
                manage_nicknames: 'Change other members nicknames',
                manage_messages: 'Delete messages, pin messages',
                embed_links: 'Send embedded messages',
                attach_files: 'Upload files and images',
                read_message_history: 'View message history',
                mention_everyone: 'Mention @everyone and @here',
                use_external_emojis: 'Use emojis from other servers',
                add_reactions: 'Add reactions to messages',
                send_messages: 'Send messages in channels',
                view_channel: 'View channels',
                connect: 'Connect to voice channels',
                speak: 'Speak in voice channels',
                mute_members: 'Mute members in voice',
                deafen_members: 'Deafen members in voice',
                move_members: 'Move members between voice channels'
            },
            events: {
                'ready': 'Bot is ready and logged in',
                'messageCreate': 'New message sent',
                'messageDelete': 'Message deleted',
                'messageUpdate': 'Message edited',
                'guildMemberAdd': 'Member joins server',
                'guildMemberRemove': 'Member leaves server',
                'guildMemberUpdate': 'Member updated (roles, nickname)',
                'guildBanAdd': 'Member banned',
                'guildBanRemove': 'Member unbanned',
                'voiceStateUpdate': 'Voice state changed',
                'interactionCreate': 'Slash command or button interaction',
                'messageReactionAdd': 'Reaction added to message',
                'messageReactionRemove': 'Reaction removed from message'
            },
            api_limits: {
                global_rate_limit: '50 requests per second',
                message_rate_limit: '5 messages per 5 seconds per channel',
                slash_command_limit: '200 global commands per application',
                embed_limits: {
                    title: '256 characters',
                    description: '4096 characters',
                    fields: '25 fields max, 1024 chars each',
                    footer: '2048 characters',
                    author: '256 characters'
                }
            }
        };
    }

    // Initialize advanced bot architectures
    initializeBotArchitectures() {
        return {
            modular: {
                description: 'Organized in separate modules/cogs for scalability',
                structure: {
                    'commands/': 'Command modules organized by category',
                    'events/': 'Event handlers',
                    'utils/': 'Utility functions',
                    'database/': 'Database models and connections',
                    'config/': 'Configuration files'
                },
                benefits: ['Easy maintenance', 'Scalable', 'Reusable components']
            },
            microservices: {
                description: 'Multiple specialized bots working together',
                structure: {
                    'gateway_bot': 'Main bot handling interactions',
                    'moderation_service': 'Dedicated moderation bot',
                    'music_service': 'Music streaming bot',
                    'api_service': 'REST API for web dashboard'
                },
                benefits: ['High availability', 'Independent scaling', 'Fault isolation']
            },
            monolithic: {
                description: 'Single bot handling all functionality',
                structure: {
                    'index.js': 'Main bot file with all features',
                    'config.json': 'Configuration',
                    'database.js': 'Database connection'
                },
                benefits: ['Simple deployment', 'Easy debugging', 'Lower latency']
            }
        };
    }

    // Initialize advanced Discord bot features
    initializeAdvancedFeatures() {
        return {
            slash_commands: {
                global: 'Available in all servers',
                guild: 'Server-specific commands',
                user: 'User context menu commands',
                message: 'Message context menu commands',
                autocomplete: 'Dynamic option suggestions',
                permissions: 'Command-level permission control'
            },
            components: {
                buttons: 'Interactive buttons with custom IDs',
                select_menus: 'Dropdown selection menus',
                modals: 'Text input forms',
                text_inputs: 'Form fields in modals'
            },
            embeds: {
                rich_formatting: 'Color, images, thumbnails',
                fields: 'Organized data display',
                timestamps: 'Dynamic time display',
                footers: 'Additional information',
                authors: 'Attribution and branding'
            },
            advanced_features: {
                webhooks: 'Send messages as different users/bots',
                oauth2: 'User authentication and authorization',
                sharding: 'Scale across multiple processes',
                clustering: 'Distribute load across servers',
                database_integration: 'PostgreSQL, MongoDB, Redis',
                api_integration: 'External service connections',
                machine_learning: 'AI-powered responses and moderation',
                natural_language: 'Text analysis and understanding'
            }
        };
    }

    // Initialize performance optimizations
    initializePerformanceOptimizations() {
        return {
            caching: {
                redis: 'Fast in-memory caching',
                memory: 'Local memory caching',
                database: 'Query result caching'
            },
            database: {
                connection_pooling: 'Reuse database connections',
                indexing: 'Optimize query performance',
                query_optimization: 'Efficient database queries',
                pagination: 'Handle large datasets'
            },
            rate_limiting: {
                global: 'Respect Discord API limits',
                per_user: 'Prevent spam from users',
                per_guild: 'Server-specific limitations'
            },
            memory: {
                garbage_collection: 'Optimize memory usage',
                object_pooling: 'Reuse expensive objects',
                lazy_loading: 'Load data when needed'
            }
        };
    }

    // Initialize best practices
    initializeBestPractices() {
        return {
            security: [
                'Never expose bot tokens',
                'Validate all user inputs',
                'Use environment variables for secrets',
                'Implement proper error handling',
                'Log security events',
                'Use least privilege principle'
            ],
            performance: [
                'Cache frequently accessed data',
                'Use connection pooling',
                'Implement rate limiting',
                'Optimize database queries',
                'Monitor memory usage',
                'Use async/await properly'
            ],
            user_experience: [
                'Provide clear error messages',
                'Use interactive components',
                'Implement help commands',
                'Handle edge cases gracefully',
                'Provide feedback for long operations',
                'Use consistent command naming'
            ],
            development: [
                'Use version control',
                'Write comprehensive tests',
                'Document your code',
                'Follow coding standards',
                'Use linting tools',
                'Implement logging'
            ]
        };
    }

    // Enhanced code patterns with comprehensive Discord bot knowledge
    initializeCodePatterns() {
        return {
            discord_bot: {
                patterns: [
                    'discord', 'bot', 'client', 'message', 'command', 'slash', 'interaction',
                    'guild', 'member', 'role', 'channel', 'permission', 'embed', 'button'
                ],
                templates: {
                    basic: this.getBasicDiscordTemplate(),
                    moderation: this.getModerationTemplate(),
                    music: this.getMusicBotTemplate(),
                    welcome: this.getWelcomeBotTemplate(),
                    economy: this.getEconomyBotTemplate(),
                    leveling: this.getLevelingBotTemplate(),
                    ticket_system: this.getTicketSystemTemplate(),
                    reaction_roles: this.getReactionRoleTemplate(),
                    auto_moderation: this.getAutoModerationTemplate(),
                    dashboard: this.getDashboardBotTemplate()
                }
            },
            advanced_discord: {
                patterns: [
                    'sharding', 'clustering', 'webhook', 'oauth', 'api', 'database',
                    'redis', 'mongodb', 'postgresql', 'machine learning', 'ai'
                ],
                templates: {
                    sharded: this.getShardedBotTemplate(),
                    microservice: this.getMicroserviceBotTemplate(),
                    ai_powered: this.getAIPoweredBotTemplate(),
                    enterprise: this.getEnterpriseBotTemplate()
                }
            }
        };
    }

    // Enhanced error database with Discord-specific errors
    initializeErrorDatabase() {
        return {
            'cannot read property': {
                solution: 'Add null/undefined checks before accessing properties',
                example: 'if (interaction?.member?.permissions) { /* safe access */ }',
                common_causes: ['Object is null/undefined', 'Async operation not completed', 'API response missing data']
            },
            'missing permissions': {
                solution: 'Check bot and user permissions before executing commands',
                example: 'if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;',
                common_causes: ['Bot lacks server permissions', 'User lacks required permissions', 'Role hierarchy issues']
            },
            'invalid token': {
                solution: 'Verify bot token is correct and not regenerated',
                example: 'client.login(process.env.DISCORD_TOKEN)',
                common_causes: ['Wrong token in env file', 'Token regenerated in Discord Developer Portal', 'Token exposed and disabled']
            },
            'missing intents': {
                solution: 'Add required intents to bot configuration',
                example: 'new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })',
                common_causes: ['Missing privileged intents', 'Intents not enabled in Developer Portal', 'Incorrect intent configuration']
            },
            'interaction not replied': {
                solution: 'Always reply to interactions within 3 seconds',
                example: 'await interaction.deferReply(); // then editReply later',
                common_causes: ['Long processing time', 'Async operation not awaited', 'Missing reply/followUp']
            },
            'rate limited': {
                solution: 'Implement rate limiting and respect API limits',
                example: 'await new Promise(resolve => setTimeout(resolve, 1000)); // delay',
                common_causes: ['Too many API requests', 'Bulk operations without delays', 'No rate limiting implementation']
            },
            'guild not available': {
                solution: 'Check if guild exists and bot has access',
                example: 'const guild = client.guilds.cache.get(guildId); if (!guild) return;',
                common_causes: ['Bot not in server', 'Server unavailable', 'Bot kicked/banned']
            }
        };
    }

    // Enhanced template database with Discord-specific code patterns
    initializeTemplateDatabase() {
        return {
            javascript: {
                functions: {
                    async: 'async function functionName() {\n  try {\n    // Your code here\n    await interaction.reply("Success!");\n  } catch (error) {\n    console.error(error);\n    await interaction.reply("An error occurred!");\n  }\n}',
                    command_handler: 'async function handleCommand(interaction) {\n  if (!interaction.isChatInputCommand()) return;\n  \n  const { commandName } = interaction;\n  \n  switch (commandName) {\n    case "ping":\n      await interaction.reply("Pong!");\n      break;\n    default:\n      await interaction.reply("Unknown command!");\n  }\n}',
                    permission_check: 'function hasPermission(member, permission) {\n  return member.permissions.has(PermissionFlagsBits[permission]);\n}',
                    embed_builder: 'function createEmbed(title, description, color = 0x0099ff) {\n  return new EmbedBuilder()\n    .setTitle(title)\n    .setDescription(description)\n    .setColor(color)\n    .setTimestamp();\n}'
                },
                classes: {
                    command_class: 'class Command {\n  constructor(name, description, execute) {\n    this.name = name;\n    this.description = description;\n    this.execute = execute;\n  }\n\n  async run(interaction) {\n    try {\n      await this.execute(interaction);\n    } catch (error) {\n      console.error(`Error in ${this.name}:`, error);\n    }\n  }\n}',
                    bot_class: 'class DiscordBot {\n  constructor(token) {\n    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });\n    this.token = token;\n    this.commands = new Map();\n  }\n\n  async start() {\n    await this.client.login(this.token);\n  }\n\n  registerCommand(command) {\n    this.commands.set(command.name, command);\n  }\n}'
                },
                discord_specific: {
                    slash_command: 'new SlashCommandBuilder()\n  .setName("commandname")\n  .setDescription("Command description")\n  .addStringOption(option =>\n    option.setName("input")\n      .setDescription("Input description")\n      .setRequired(true)\n  )',
                    button_component: 'new ButtonBuilder()\n  .setCustomId("button_id")\n  .setLabel("Click Me")\n  .setStyle(ButtonStyle.Primary)',
                    select_menu: 'new StringSelectMenuBuilder()\n  .setCustomId("select_menu")\n  .setPlaceholder("Choose an option")\n  .addOptions(\n    new StringSelectMenuOptionBuilder()\n      .setLabel("Option 1")\n      .setValue("option1")\n  )',
                    modal: 'new ModalBuilder()\n  .setCustomId("modal_id")\n  .setTitle("Modal Title")\n  .addComponents(\n    new ActionRowBuilder().addComponents(\n      new TextInputBuilder()\n        .setCustomId("text_input")\n        .setLabel("Input Label")\n        .setStyle(TextInputStyle.Short)\n    )\n  )'
                }
            },
            python: {
                functions: {
                    basic: 'async def command_function(ctx):\n    """Command description"""\n    try:\n        # Your code here\n        await ctx.send("Success!")\n    except Exception as e:\n        print(f"Error: {e}")\n        await ctx.send("An error occurred!")',
                    slash_command: '@bot.tree.command(name="commandname", description="Command description")\nasync def slash_command(interaction: discord.Interaction):\n    """Slash command handler"""\n    await interaction.response.send_message("Hello!")'
                },
                classes: {
                    cog: 'class CommandCog(commands.Cog):\n    def __init__(self, bot):\n        self.bot = bot\n\n    @commands.command()\n    async def example(self, ctx):\n        """Example command"""\n        await ctx.send("Hello from cog!")\n\nasync def setup(bot):\n    await bot.add_cog(CommandCog(bot))'
                }
            }
        };
    }

    // Enhanced security rules for Discord bots
    initializeSecurityRules() {
        return [
            {
                pattern: /process\.env\.(DISCORD_TOKEN|BOT_TOKEN)/g,
                severity: 'critical',
                message: 'Bot token detected in code - ensure it\'s properly secured',
                fix: 'Use environment variables and never commit tokens to version control'
            },
            {
                pattern: /client\.login\s*\(\s*["'`][^"'`]*["'`]/g,
                severity: 'critical',
                message: 'Hardcoded bot token detected',
                fix: 'Use environment variables: client.login(process.env.DISCORD_TOKEN)'
            },
            {
                pattern: /eval\s*\(/g,
                severity: 'high',
                message: 'eval() usage detected - potential security risk',
                fix: 'Avoid eval() - use safer alternatives like JSON.parse() or Function constructor'
            },
            {
                pattern: /interaction\.user\.id\s*===\s*["'`]\d+["'`]/g,
                severity: 'medium',
                message: 'Hardcoded user ID detected',
                fix: 'Use configuration files or database for user IDs'
            },
            {
                pattern: /\.permissions\.has\s*\(\s*[^)]*\)\s*&&/g,
                severity: 'low',
                message: 'Permission check detected - ensure comprehensive validation',
                fix: 'Implement proper permission hierarchy and error handling'
            },
            {
                pattern: /await\s+(?!.*\.catch)/g,
                severity: 'medium',
                message: 'Async operation without error handling',
                fix: 'Add try-catch blocks or .catch() for async operations'
            }
        ];
    }

    // Enhanced optimization rules for Discord bots
    initializeOptimizationRules() {
        return [
            {
                pattern: /client\.guilds\.cache\.forEach/g,
                suggestion: 'Consider using for...of loop for better performance with large guild counts',
                improvement: 'Faster iteration over large collections'
            },
            {
                pattern: /setInterval\s*\([^,]+,\s*[1-9]\d{0,2}\s*\)/g,
                suggestion: 'Short intervals can cause rate limiting - consider longer intervals',
                improvement: 'Prevents Discord API rate limiting'
            },
            {
                pattern: /client\.users\.fetch/g,
                suggestion: 'Cache user data when possible to reduce API calls',
                improvement: 'Reduced API calls and improved response time'
            },
            {
                pattern: /\.channel\.send\s*\(\s*\{[^}]*\}\s*\)/g,
                suggestion: 'Consider using embeds for rich message formatting',
                improvement: 'Better user experience and message presentation'
            },
            {
                pattern: /new\s+EmbedBuilder\s*\(\s*\)/g,
                suggestion: 'Reuse embed builders when possible',
                improvement: 'Reduced object creation and memory usage'
            }
        ];
    }

    // Get advanced Discord bot templates
    getEconomyBotTemplate() {
        return {
            'index.js': `const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('./database.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const db = new Database();

client.once('ready', () => {
    console.log('Economy bot is ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const userId = interaction.user.id;

    switch (commandName) {
        case 'balance':
            const balance = await db.getBalance(userId);
            const embed = new EmbedBuilder()
                .setTitle('💰 Your Balance')
                .setDescription(\`You have **\${balance}** coins\`)
                .setColor(0x00ff00);
            await interaction.reply({ embeds: [embed] });
            break;

        case 'daily':
            const dailyReward = 100;
            const lastDaily = await db.getLastDaily(userId);
            const now = Date.now();
            
            if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
                await interaction.reply('You already claimed your daily reward today!');
                return;
            }
            
            await db.addBalance(userId, dailyReward);
            await db.setLastDaily(userId, now);
            
            await interaction.reply(\`You received **\${dailyReward}** coins!\`);
            break;

        case 'transfer':
            const target = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            
            if (target.id === userId) {
                await interaction.reply('You cannot transfer to yourself!');
                return;
            }
            
            const senderBalance = await db.getBalance(userId);
            if (senderBalance < amount) {
                await interaction.reply('Insufficient balance!');
                return;
            }
            
            await db.addBalance(userId, -amount);
            await db.addBalance(target.id, amount);
            
            await interaction.reply(\`Transferred **\${amount}** coins to \${target.username}!\`);
            break;
    }
});

const commands = [
    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer coins to another user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to transfer to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount to transfer')
                .setRequired(true)
                .setMinValue(1))
];

client.login(process.env.DISCORD_TOKEN);`,

            'database.js': `const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./economy.db');
        this.init();
    }

    init() {
        this.db.serialize(() => {
            this.db.run(\`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                balance INTEGER DEFAULT 0,
                last_daily INTEGER DEFAULT 0
            )\`);
        });
    }

    async getBalance(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.balance : 0);
            });
        });
    }

    async addBalance(userId, amount) {
        return new Promise((resolve, reject) => {
            this.db.run(\`INSERT OR REPLACE INTO users (id, balance) 
                        VALUES (?, COALESCE((SELECT balance FROM users WHERE id = ?), 0) + ?)\`,
                [userId, userId, amount], function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                });
        });
    }

    async getLastDaily(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT last_daily FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.last_daily : 0);
            });
        });
    }

    async setLastDaily(userId, timestamp) {
        return new Promise((resolve, reject) => {
            this.db.run(\`INSERT OR REPLACE INTO users (id, last_daily, balance) 
                        VALUES (?, ?, COALESCE((SELECT balance FROM users WHERE id = ?), 0))\`,
                [userId, timestamp, userId], function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                });
        });
    }
}

module.exports = Database;`
        };
    }

    getLevelingBotTemplate() {
        return {
            'index.js': `const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const Database = require('./database.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const db = new Database();

client.once('ready', () => {
    console.log('Leveling bot is ready!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    
    // Add XP (random between 15-25)
    const xpGain = Math.floor(Math.random() * 10) + 15;
    const result = await db.addXP(userId, guildId, xpGain);
    
    if (result.levelUp) {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Level Up!')
            .setDescription(\`\${message.author.username} reached level **\${result.newLevel}**!\`)
            .setColor(0xffd700)
            .setThumbnail(message.author.displayAvatarURL());
            
        await message.channel.send({ embeds: [embed] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'rank':
            const user = interaction.options.getUser('user') || interaction.user;
            const stats = await db.getUserStats(user.id, interaction.guild.id);
            
            if (!stats) {
                await interaction.reply('This user has no stats yet!');
                return;
            }
            
            // Create rank card
            const canvas = Canvas.createCanvas(800, 300);
            const ctx = canvas.getContext('2d');
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 800, 0);
            gradient.addColorStop(0, '#7289da');
            gradient.addColorStop(1, '#5865f2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 300);
            
            // User avatar
            const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'jpg' }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, 150, 60, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 40, 90, 120, 120);
            ctx.restore();
            
            // Username
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Arial';
            ctx.fillText(user.username, 200, 120);
            
            // Level and XP
            ctx.font = '24px Arial';
            ctx.fillText(\`Level \${stats.level}\`, 200, 160);
            ctx.fillText(\`\${stats.xp}/\${stats.xpToNext} XP\`, 200, 190);
            
            // Progress bar
            const progressWidth = 400;
            const progress = stats.xp / stats.xpToNext;
            
            ctx.fillStyle = '#36393f';
            ctx.fillRect(200, 220, progressWidth, 20);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(200, 220, progressWidth * progress, 20);
            
            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'rank.png' });
            await interaction.reply({ files: [attachment] });
            break;

        case 'leaderboard':
            const leaderboard = await db.getLeaderboard(interaction.guild.id);
            
            const embed = new EmbedBuilder()
                .setTitle('🏆 Leaderboard')
                .setColor(0xffd700);
                
            if (leaderboard.length === 0) {
                embed.setDescription('No users in leaderboard yet!');
            } else {
                const description = leaderboard.map((user, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : \`\${index + 1}.\`;
                    return \`\${medal} <@\${user.user_id}> - Level \${user.level} (\${user.total_xp} XP)\`;
                }).join('\\n');
                
                embed.setDescription(description);
            }
            
            await interaction.reply({ embeds: [embed] });
            break;
    }
});

const commands = [
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your or another user\\'s rank')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check rank for')),
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server leaderboard')
];

client.login(process.env.DISCORD_TOKEN);`,

            'database.js': `const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./leveling.db');
        this.init();
    }

    init() {
        this.db.serialize(() => {
            this.db.run(\`CREATE TABLE IF NOT EXISTS user_levels (
                user_id TEXT,
                guild_id TEXT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                total_xp INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, guild_id)
            )\`);
        });
    }

    calculateLevel(totalXP) {
        return Math.floor(0.1 * Math.sqrt(totalXP)) + 1;
    }

    calculateXPForLevel(level) {
        return Math.pow((level - 1) / 0.1, 2);
    }

    async addXP(userId, guildId, xpGain) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?', 
                [userId, guildId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const currentTotalXP = row ? row.total_xp : 0;
                const newTotalXP = currentTotalXP + xpGain;
                const oldLevel = row ? row.level : 1;
                const newLevel = this.calculateLevel(newTotalXP);
                const currentLevelXP = newTotalXP - this.calculateXPForLevel(newLevel);

                const query = \`INSERT OR REPLACE INTO user_levels 
                              (user_id, guild_id, xp, level, total_xp) 
                              VALUES (?, ?, ?, ?, ?)\`;

                this.db.run(query, [userId, guildId, currentLevelXP, newLevel, newTotalXP], 
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve({
                            levelUp: newLevel > oldLevel,
                            newLevel: newLevel,
                            oldLevel: oldLevel,
                            xpGain: xpGain
                        });
                    });
            });
        });
    }

    async getUserStats(userId, guildId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?', 
                [userId, guildId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(null);
                    return;
                }

                const xpForNextLevel = this.calculateXPForLevel(row.level + 1);
                const xpForCurrentLevel = this.calculateXPForLevel(row.level);
                const xpToNext = xpForNextLevel - row.total_xp;

                resolve({
                    level: row.level,
                    xp: row.total_xp - xpForCurrentLevel,
                    totalXP: row.total_xp,
                    xpToNext: xpForNextLevel - xpForCurrentLevel,
                    progress: (row.total_xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)
                });
            });
        });
    }

    async getLeaderboard(guildId, limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(\`SELECT user_id, level, total_xp 
                        FROM user_levels 
                        WHERE guild_id = ? 
                        ORDER BY total_xp DESC 
                        LIMIT ?\`, 
                [guildId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(rows || []);
            });
        });
    }
}

module.exports = Database;`
        };
    }

    getTicketSystemTemplate() {
        return `const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const activeTickets = new Map();

client.once('ready', () => {
    console.log('Ticket system bot is ready!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        switch (commandName) {
            case 'ticket-setup':
                const embed = new EmbedBuilder()
                    .setTitle('🎫 Support Tickets')
                    .setDescription('Click the button below to create a support ticket')
                    .setColor(0x0099ff);

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('Create Ticket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🎫')
                    );

                await interaction.reply({ embeds: [embed], components: [button] });
                break;
        }
    }

    if (interaction.isButton()) {
        const { customId } = interaction;

        switch (customId) {
            case 'create_ticket':
                await createTicket(interaction);
                break;
            case 'close_ticket':
                await closeTicket(interaction);
                break;
        }
    }
});

async function createTicket(interaction) {
    const userId = interaction.user.id;
    const guild = interaction.guild;
    
    // Check if user already has a ticket
    if (activeTickets.has(userId)) {
        await interaction.reply({ content: 'You already have an active ticket!', ephemeral: true });
        return;
    }

    try {
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: \`ticket-\${interaction.user.username}\`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: userId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }
            ]
        });

        activeTickets.set(userId, ticketChannel.id);

        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket')
            .setDescription(\`Welcome \${interaction.user}! Please describe your issue and our staff will assist you shortly.\`)
            .setColor(0x00ff00)
            .setTimestamp();

        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await ticketChannel.send({ embeds: [ticketEmbed], components: [closeButton] });
        await interaction.reply({ content: \`Ticket created! Check \${ticketChannel}\`, ephemeral: true });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({ content: 'Failed to create ticket. Please try again.', ephemeral: true });
    }
}

async function closeTicket(interaction) {
    const channel = interaction.channel;
    
    if (!channel.name.startsWith('ticket-')) {
        await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closing')
        .setDescription('Ticket will be deleted in 5 seconds...')
        .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });

    // Remove from active tickets
    for (const [userId, channelId] of activeTickets.entries()) {
        if (channelId === channel.id) {
            activeTickets.delete(userId);
            break;
        }
    }

    setTimeout(async () => {
        try {
            await channel.delete();
        } catch (error) {
            console.error('Error deleting ticket channel:', error);
        }
    }, 5000);
}

const commands = [
    new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Set up the ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
];

client.login(process.env.DISCORD_TOKEN);`;
    }

    getReactionRoleTemplate() {
        return `const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions]
});

const reactionRoles = new Map();

client.once('ready', () => {
    console.log('Reaction roles bot is ready!');
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    // Handle partial reactions
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    const key = \`\${reaction.message.id}-\${reaction.emoji.name}\`;
    const roleId = reactionRoles.get(key);

    if (roleId) {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);

        if (role && !member.roles.cache.has(roleId)) {
            try {
                await member.roles.add(role);
                console.log(\`Added role \${role.name} to \${user.username}\`);
            } catch (error) {
                console.error('Error adding role:', error);
            }
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    const key = \`\${reaction.message.id}-\${reaction.emoji.name}\`;
    const roleId = reactionRoles.get(key);

    if (roleId) {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);

        if (role && member.roles.cache.has(roleId)) {
            try {
                await member.roles.remove(role);
                console.log(\`Removed role \${role.name} from \${user.username}\`);
            } catch (error) {
                console.error('Error removing role:', error);
            }
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'reaction-role':
            const messageId = interaction.options.getString('message_id');
            const emoji = interaction.options.getString('emoji');
            const role = interaction.options.getRole('role');

            try {
                const message = await interaction.channel.messages.fetch(messageId);
                await message.react(emoji);

                const key = \`\${messageId}-\${emoji}\`;
                reactionRoles.set(key, role.id);

                await interaction.reply(\`Reaction role set up! React with \${emoji} to get the \${role.name} role.\`);
            } catch (error) {
                console.error('Error setting up reaction role:', error);
                await interaction.reply({ content: 'Failed to set up reaction role. Check the message ID and emoji.', ephemeral: true });
            }
            break;

        case 'role-panel':
            const embed = new EmbedBuilder()
                .setTitle('🎭 Role Selection')
                .setDescription('React to get roles!')
                .addFields(
                    { name: '🎮', value: 'Gamer', inline: true },
                    { name: '🎵', value: 'Music Lover', inline: true },
                    { name: '🎨', value: 'Artist', inline: true }
                )
                .setColor(0x0099ff);

            const sentMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

            // Set up reaction roles for the panel
            const roleMap = {
                '🎮': 'gamer_role_id',
                '🎵': 'music_role_id',
                '🎨': 'artist_role_id'
            };

            for (const [emoji, roleId] of Object.entries(roleMap)) {
                await sentMessage.react(emoji);
                const key = \`\${sentMessage.id}-\${emoji}\`;
                reactionRoles.set(key, roleId);
            }
            break;
    }
});

const commands = [
    new SlashCommandBuilder()
        .setName('reaction-role')
        .setDescription('Set up a reaction role')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Message ID to add reaction role to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji to react with')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to give')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('role-panel')
        .setDescription('Create a role selection panel')
];

client.login(process.env.DISCORD_TOKEN);`;
    }

    getAutoModerationTemplate() {
        return `const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Auto-moderation settings
const autoModConfig = {
    badWords: ['spam', 'toxic', 'inappropriate'],
    spamLimit: 5, // messages in timeWindow
    timeWindow: 5000, // 5 seconds
    maxMentions: 5,
    maxEmojis: 10,
    linkWhitelist: ['discord.gg', 'youtube.com', 'github.com']
};

const userMessageHistory = new Map();
const warnings = new Map();

client.once('ready', () => {
    console.log('Auto-moderation bot is ready!');
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    
    // Skip if user has manage messages permission
    if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const violations = [];

    // Check for bad words
    const content = message.content.toLowerCase();
    for (const word of autoModConfig.badWords) {
        if (content.includes(word)) {
            violations.push('Inappropriate language');
            break;
        }
    }

    // Check for spam
    const userId = message.author.id;
    if (!userMessageHistory.has(userId)) {
        userMessageHistory.set(userId, []);
    }

    const userMessages = userMessageHistory.get(userId);
    const now = Date.now();
    
    // Remove old messages outside time window
    const recentMessages = userMessages.filter(timestamp => now - timestamp < autoModConfig.timeWindow);
    
    if (recentMessages.length >= autoModConfig.spamLimit) {
        violations.push('Spam detected');
    }
    
    // Add current message timestamp
    recentMessages.push(now);
    userMessageHistory.set(userId, recentMessages);

    // Check for excessive mentions
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    if (mentions > autoModConfig.maxMentions) {
        violations.push('Excessive mentions');
    }

    // Check for excessive emojis
    const emojiCount = (message.content.match(/<a?:\\w+:\\d+>/g) || []).length + 
                      (message.content.match(/\\p{Emoji}/gu) || []).length;
    if (emojiCount > autoModConfig.maxEmojis) {
        violations.push('Excessive emojis');
    }

    // Check for unauthorized links
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    const urls = message.content.match(urlRegex) || [];
    for (const url of urls) {
        const isWhitelisted = autoModConfig.linkWhitelist.some(domain => url.includes(domain));
        if (!isWhitelisted) {
            violations.push('Unauthorized link');
            break;
        }
    }

    // Check for ALL CAPS (more than 70% uppercase)
    const uppercaseRatio = (message.content.match(/[A-Z]/g) || []).length / message.content.length;
    if (message.content.length > 10 && uppercaseRatio > 0.7) {
        violations.push('Excessive caps');
    }

    // Take action if violations found
    if (violations.length > 0) {
        await handleViolations(message, violations);
    }
});

async function handleViolations(message, violations) {
    const userId = message.author.id;
    
    // Delete the message
    try {
        await message.delete();
    } catch (error) {
        console.error('Failed to delete message:', error);
    }

    // Track warnings
    if (!warnings.has(userId)) {
        warnings.set(userId, []);
    }

    const userWarnings = warnings.get(userId);
    userWarnings.push({
        violations: violations,
        timestamp: Date.now(),
        channelId: message.channel.id
    });

    const warningCount = userWarnings.length;

    // Create violation embed
    const embed = new EmbedBuilder()
        .setTitle('⚠️ Auto-Moderation Action')
        .setDescription(\`\${message.author} violated community guidelines\`)
        .addFields(
            { name: 'Violations', value: violations.join(', '), inline: true },
            { name: 'Warning Count', value: warningCount.toString(), inline: true },
            { name: 'Channel', value: message.channel.toString(), inline: true }
        )
        .setColor(0xff9900)
        .setTimestamp();

    // Send warning to channel
    await message.channel.send({ embeds: [embed] });

    // Escalate punishment based on warning count
    try {
        if (warningCount >= 5) {
            // Ban after 5 warnings
            await message.member.ban({ reason: 'Auto-moderation: Multiple violations' });
            
            const banEmbed = new EmbedBuilder()
                .setTitle('🔨 User Banned')
                .setDescription(\`\${message.author.tag} has been banned for repeated violations\`)
                .setColor(0xff0000);
                
            await message.channel.send({ embeds: [banEmbed] });
            
        } else if (warningCount >= 3) {
            // Timeout for 1 hour after 3 warnings
            await message.member.timeout(60 * 60 * 1000, 'Auto-moderation: Multiple violations');
            
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ User Timed Out')
                .setDescription(\`\${message.author.tag} has been timed out for 1 hour\`)
                .setColor(0xff6600);
                
            await message.channel.send({ embeds: [timeoutEmbed] });
        }
    } catch (error) {
        console.error('Failed to apply punishment:', error);
    }

    // Log to moderation channel (if exists)
    const modChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs');
    if (modChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('🤖 Auto-Moderation Log')
            .addFields(
                { name: 'User', value: \`\${message.author.tag} (\${message.author.id})\`, inline: true },
                { name: 'Channel', value: message.channel.toString(), inline: true },
                { name: 'Violations', value: violations.join(', '), inline: false },
                { name: 'Message Content', value: message.content.substring(0, 1000) || 'No content', inline: false },
                { name: 'Warning Count', value: warningCount.toString(), inline: true }
            )
            .setColor(0xff9900)
            .setTimestamp();

        await modChannel.send({ embeds: [logEmbed] });
    }
}

client.login(process.env.DISCORD_TOKEN);`;
    }

    getDashboardBotTemplate() {
        return {
            'index.js': `const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const app = express();

// Passport configuration
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Express middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    const guilds = req.user.guilds.filter(guild => 
        (guild.permissions & 0x20) === 0x20 // MANAGE_GUILD permission
    );
    
    res.render('dashboard', { user: req.user, guilds: guilds });
});

app.get('/dashboard/:guildId', ensureAuthenticated, async (req, res) => {
    const guildId = req.params.guildId;
    const guild = client.guilds.cache.get(guildId);
    
    if (!guild) {
        return res.redirect('/dashboard');
    }
    
    // Check if user has permission to manage this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || (userGuild.permissions & 0x20) !== 0x20) {
        return res.redirect('/dashboard');
    }
    
    const guildData = {
        name: guild.name,
        memberCount: guild.memberCount,
        channels: guild.channels.cache.size,
        roles: guild.roles.cache.size,
        icon: guild.iconURL()
    };
    
    res.render('guild-dashboard', { user: req.user, guild: guildData });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Start bot and server
client.once('ready', () => {
    console.log('Dashboard bot is ready!');
});

client.login(process.env.DISCORD_TOKEN);

app.listen(3000, () => {
    console.log('Dashboard server running on port 3000');
});`,

            'views/index.ejs': `<!DOCTYPE html>
<html>
<head>
    <title>Discord Bot Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="text-center">
            <h1>Discord Bot Dashboard</h1>
            <% if (user) { %>
                <p>Welcome, <%= user.username %>!</p>
                <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
                <a href="/logout" class="btn btn-secondary">Logout</a>
            <% } else { %>
                <p>Please login to access the dashboard</p>
                <a href="/login" class="btn btn-primary">Login with Discord</a>
            <% } %>
        </div>
    </div>
</body>
</html>`,

            'views/dashboard.ejs': `<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Your Servers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">Bot Dashboard</a>
            <div class="navbar-nav ms-auto">
                <span class="navbar-text me-3">Welcome, <%= user.username %>!</span>
                <a href="/logout" class="btn btn-outline-light">Logout</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h2>Your Servers</h2>
        <div class="row">
            <% guilds.forEach(guild => { %>
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><%= guild.name %></h5>
                            <p class="card-text">Manage your bot settings for this server</p>
                            <a href="/dashboard/<%= guild.id %>" class="btn btn-primary">Manage</a>
                        </div>
                    </div>
                </div>
            <% }); %>
        </div>
    </div>
</body>
</html>`
        };
    }

    getShardedBotTemplate() {
        return `const { ShardingManager } = require('discord.js');
const path = require('path');

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto'
});

manager.on('shardCreate', shard => {
    console.log(\`Launched shard \${shard.id}\`);
});

manager.spawn();`;
    }

    getMicroserviceBotTemplate() {
        return `const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const redis = require('redis');

// Redis client for inter-service communication
const redisClient = redis.createClient();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const app = express();
app.use(express.json());

// Microservice API endpoints
app.post('/api/send-message', async (req, res) => {
    const { channelId, content } = req.body;
    
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/guild-info/:guildId', async (req, res) => {
    const guildId = req.params.guildId;
    
    try {
        const guild = await client.guilds.fetch(guildId);
        res.json({
            name: guild.name,
            memberCount: guild.memberCount,
            channels: guild.channels.cache.size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

client.once('ready', () => {
    console.log('Microservice bot is ready!');
    app.listen(3001, () => {
        console.log('API server running on port 3001');
    });
});

client.login(process.env.DISCORD_TOKEN);`;
    }

    getAIPoweredBotTemplate() {
        return `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const natural = require('natural');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// AI-powered features
const sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

// Knowledge base for AI responses
const knowledgeBase = {
    greetings: ['hello', 'hi', 'hey', 'greetings'],
    questions: ['what', 'how', 'when', 'where', 'why', 'who'],
    responses: {
        greeting: ['Hello there!', 'Hi! How can I help?', 'Hey! Nice to see you!'],
        question: ['That\\'s a great question!', 'Let me think about that...', 'Interesting query!'],
        positive: ['I\\'m glad to hear that!', 'That sounds wonderful!', 'Awesome!'],
        negative: ['I\\'m sorry to hear that.', 'That doesn\\'t sound good.', 'I understand your concern.']
    }
};

client.once('ready', () => {
    console.log('AI-powered bot is ready!');
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const content = message.content.toLowerCase().replace(\`<@\${client.user.id}>\`, '').trim();
    
    // Sentiment analysis
    const tokens = tokenizer.tokenize(content);
    const sentimentScore = sentiment.getSentiment(tokens);
    
    // Intent detection
    const isGreeting = knowledgeBase.greetings.some(word => content.includes(word));
    const isQuestion = knowledgeBase.questions.some(word => content.startsWith(word));
    
    let response;
    
    if (isGreeting) {
        response = getRandomResponse('greeting');
    } else if (isQuestion) {
        response = getRandomResponse('question');
    } else if (sentimentScore > 0.1) {
        response = getRandomResponse('positive');
    } else if (sentimentScore < -0.1) {
        response = getRandomResponse('negative');
    } else {
        response = generateContextualResponse(content);
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🤖 AI Response')
        .setDescription(response)
        .addFields(
            { name: 'Sentiment Score', value: sentimentScore.toFixed(2), inline: true },
            { name: 'Detected Intent', value: getIntent(isGreeting, isQuestion), inline: true }
        )
        .setColor(sentimentScore > 0 ? 0x00ff00 : sentimentScore < 0 ? 0xff0000 : 0x0099ff);
    
    await message.reply({ embeds: [embed] });
});

function getRandomResponse(type) {
    const responses = knowledgeBase.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
}

function getIntent(isGreeting, isQuestion) {
    if (isGreeting) return 'Greeting';
    if (isQuestion) return 'Question';
    return 'General';
}

function generateContextualResponse(content) {
    // Simple keyword-based responses
    const keywords = {
        'help': 'I\\'m here to help! What do you need assistance with?',
        'bot': 'Yes, I\\'m a bot powered by AI! How can I assist you?',
        'discord': 'Discord is an amazing platform for communities!',
        'code': 'Programming is fun! Are you working on something interesting?',
        'music': 'I love music! What\\'s your favorite genre?',
        'game': 'Gaming is awesome! What games do you enjoy?'
    };
    
    for (const [keyword, response] of Object.entries(keywords)) {
        if (content.includes(keyword)) {
            return response;
        }
    }
    
    return 'That\\'s interesting! Tell me more about that.';
}

client.login(process.env.DISCORD_TOKEN);`;
    }

    getEnterpriseBotTemplate() {
        return `const { Client, GatewayIntentBits } = require('discord.js');
const { Pool } = require('pg');
const redis = require('redis');
const winston = require('winston');

// Enterprise-grade logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Database connection pool
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Redis for caching
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

class EnterpriseBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION']
        });
        
        this.setupEventHandlers();
        this.setupErrorHandling();
        this.setupGracefulShutdown();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            logger.info(\`Bot logged in as \${this.client.user.tag}\`);
            this.startHealthCheck();
        });

        this.client.on('messageCreate', async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                logger.error('Error handling message:', error);
            }
        });

        this.client.on('guildCreate', async (guild) => {
            logger.info(\`Joined guild: \${guild.name} (\${guild.id})\`);
            await this.onGuildJoin(guild);
        });
    }

    setupErrorHandling() {
        this.client.on('error', (error) => {
            logger.error('Discord client error:', error);
        });

        this.client.on('warn', (warning) => {
            logger.warn('Discord client warning:', warning);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }

    setupGracefulShutdown() {
        const gracefulShutdown = () => {
            logger.info('Received shutdown signal, gracefully shutting down...');
            
            this.client.destroy();
            db.end();
            redisClient.quit();
            
            process.exit(0);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }

    async handleMessage(message) {
        if (message.author.bot) return;

        // Rate limiting check
        const rateLimitKey = \`rate_limit:\${message.author.id}\`;
        const messageCount = await redisClient.incr(rateLimitKey);
        
        if (messageCount === 1) {
            await redisClient.expire(rateLimitKey, 60); // 1 minute window
        }
        
        if (messageCount > 30) { // 30 messages per minute limit
            logger.warn(\`Rate limit exceeded for user \${message.author.id}\`);
            return;
        }

        // Log message for analytics
        await this.logMessage(message);

        // Process commands
        if (message.content.startsWith('!')) {
            await this.handleCommand(message);
        }
    }

    async logMessage(message) {
        try {
            await db.query(\`
                INSERT INTO message_logs (user_id, guild_id, channel_id, content, timestamp)
                VALUES ($1, $2, $3, $4, $5)
            \`, [
                message.author.id,
                message.guild?.id,
                message.channel.id,
                message.content,
                new Date()
            ]);
        } catch (error) {
            logger.error('Failed to log message:', error);
        }
    }

    async handleCommand(message) {
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        switch (commandName) {
            case 'stats':
                await this.handleStatsCommand(message);
                break;
            case 'health':
                await this.handleHealthCommand(message);
                break;
            default:
                await message.reply('Unknown command.');
        }
    }

    async handleStatsCommand(message) {
        try {
            const stats = await this.getServerStats();
            await message.reply(\`Server Stats: \${JSON.stringify(stats, null, 2)}\`);
        } catch (error) {
            logger.error('Error getting stats:', error);
            await message.reply('Failed to get server stats.');
        }
    }

    async handleHealthCommand(message) {
        const health = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size
        };

        await message.reply(\`\`\`json\\n\${JSON.stringify(health, null, 2)}\\n\`\`\`\`);
    }

    async getServerStats() {
        const result = await db.query(\`
            SELECT 
                COUNT(*) as total_messages,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT guild_id) as active_guilds
            FROM message_logs 
            WHERE timestamp > NOW() - INTERVAL '24 hours'
        \`);

        return result.rows[0];
    }

    async onGuildJoin(guild) {
        try {
            await db.query(\`
                INSERT INTO guilds (guild_id, name, member_count, joined_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (guild_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    member_count = EXCLUDED.member_count
            \`, [guild.id, guild.name, guild.memberCount, new Date()]);
        } catch (error) {
            logger.error('Failed to log guild join:', error);
        }
    }

    startHealthCheck() {
        setInterval(async () => {
            const health = {
                timestamp: new Date(),
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            };

            await redisClient.setex('bot_health', 300, JSON.stringify(health));
            logger.info('Health check completed', health);
        }, 60000); // Every minute
    }

    async start() {
        try {
            await redisClient.connect();
            logger.info('Connected to Redis');
            
            await this.client.login(process.env.DISCORD_TOKEN);
            logger.info('Bot started successfully');
        } catch (error) {
            logger.error('Failed to start bot:', error);
            process.exit(1);
        }
    }
}

const bot = new EnterpriseBot();
bot.start();`;
    }

    // Keep all existing methods but enhance them
    async generateBotCode(userId, prompt, language = 'javascript') {
        try {
            const userPlan = await this.getUserPlan(userId);
            const canGenerate = await this.checkUsageLimits(userId, userPlan);
            
            if (!canGenerate) {
                return {
                    success: false,
                    error: 'You have reached your command limit. Please upgrade your plan.',
                    upgradeRequired: true
                };
            }

            // Enhanced prompt analysis with Discord-specific knowledge
            const analysis = this.analyzePromptAdvanced(prompt);
            const template = this.selectBestTemplateAdvanced(analysis, language, userPlan);
            const customizedCode = this.customizeTemplateAdvanced(template, prompt, analysis, userPlan);

            await this.incrementUsage(userId);
            
            return {
                success: true,
                code: customizedCode,
                files: customizedCode.files,
                structure: customizedCode.structure,
                analysis: analysis,
                recommendations: this.generateRecommendations(analysis, userPlan),
                bestPractices: this.getBestPracticesForBot(analysis)
            };
        } catch (error) {
            console.error('Enhanced AI generation error:', error);
            return {
                success: false,
                error: 'Failed to generate bot code. Please try again.'
            };
        }
    }

    analyzePromptAdvanced(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        const analysis = {
            type: 'discord_bot',
            features: [],
            complexity: 'basic',
            keywords: [],
            intents: [],
            permissions: [],
            architecture: 'monolithic',
            scalability: 'low',
            database_needed: false,
            api_integrations: []
        };

        // Enhanced feature detection
        const advancedFeatureMap = {
            moderation: {
                keywords: ['ban', 'kick', 'mute', 'warn', 'moderate', 'automod', 'filter'],
                intents: ['Guilds', 'GuildMembers', 'GuildBans', 'GuildMessages'],
                permissions: ['BanMembers', 'KickMembers', 'ManageMessages', 'ModerateMembers']
            },
            music: {
                keywords: ['music', 'play', 'queue', 'song', 'audio', 'playlist', 'youtube'],
                intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages'],
                permissions: ['Connect', 'Speak']
            },
            economy: {
                keywords: ['economy', 'money', 'coins', 'shop', 'buy', 'balance', 'bank'],
                intents: ['Guilds', 'GuildMessages'],
                permissions: ['SendMessages'],
                database_needed: true
            },
            leveling: {
                keywords: ['level', 'xp', 'experience', 'rank', 'leaderboard'],
                intents: ['Guilds', 'GuildMessages', 'MessageContent'],
                permissions: ['SendMessages', 'AttachFiles'],
                database_needed: true
            },
            tickets: {
                keywords: ['ticket', 'support', 'help desk', 'report'],
                intents: ['Guilds', 'GuildMessages'],
                permissions: ['ManageChannels', 'SendMessages']
            },
            reaction_roles: {
                keywords: ['reaction role', 'react role', 'emoji role'],
                intents: ['Guilds', 'GuildMessageReactions', 'GuildMembers'],
                permissions: ['ManageRoles', 'AddReactions']
            },
            dashboard: {
                keywords: ['dashboard', 'web interface', 'control panel'],
                intents: ['Guilds'],
                permissions: ['ManageGuild'],
                api_integrations: ['express', 'oauth2']
            }
        };

        // Detect features and set requirements
        for (const [feature, config] of Object.entries(advancedFeatureMap)) {
            if (config.keywords.some(keyword => lowerPrompt.includes(keyword))) {
                analysis.features.push(feature);
                analysis.intents.push(...config.intents);
                analysis.permissions.push(...config.permissions);
                if (config.database_needed) analysis.database_needed = true;
                if (config.api_integrations) analysis.api_integrations.push(...config.api_integrations);
            }
        }

        // Remove duplicates
        analysis.intents = [...new Set(analysis.intents)];
        analysis.permissions = [...new Set(analysis.permissions)];
        analysis.api_integrations = [...new Set(analysis.api_integrations)];

        // Determine complexity and architecture
        if (analysis.features.length > 3 || analysis.database_needed || analysis.api_integrations.length > 0) {
            analysis.complexity = 'advanced';
            analysis.architecture = 'modular';
        }

        if (lowerPrompt.includes('enterprise') || lowerPrompt.includes('scale') || lowerPrompt.includes('microservice')) {
            analysis.complexity = 'pro';
            analysis.architecture = 'microservices';
            analysis.scalability = 'high';
        }

        return analysis;
    }

    selectBestTemplateAdvanced(analysis, language, userPlan) {
        const templates = this.codePatterns.discord_bot.templates;

        // Advanced template selection based on features and plan
        if (analysis.features.includes('economy') && userPlan.features.includes('advanced_generation')) {
            return templates.economy;
        }
        if (analysis.features.includes('leveling') && userPlan.features.includes('advanced_generation')) {
            return templates.leveling;
        }
        if (analysis.features.includes('tickets') && userPlan.features.includes('advanced_generation')) {
            return templates.ticket_system;
        }
        if (analysis.features.includes('reaction_roles')) {
            return templates.reaction_roles;
        }
        if (analysis.features.includes('moderation')) {
            return templates.auto_moderation || templates.moderation;
        }
        if (analysis.features.includes('dashboard') && userPlan.name === 'pro') {
            return templates.dashboard;
        }

        // Fallback to basic template
        return templates.basic;
    }

    generateRecommendations(analysis, userPlan) {
        const recommendations = [];

        if (analysis.database_needed) {
            recommendations.push('Consider using PostgreSQL or MongoDB for persistent data storage');
        }

        if (analysis.features.length > 2) {
            recommendations.push('Use a modular architecture to organize your code better');
        }

        if (analysis.intents.includes('MessageContent')) {
            recommendations.push('Remember to enable the Message Content Intent in Discord Developer Portal');
        }

        if (userPlan.name === 'starter' && analysis.complexity === 'advanced') {
            recommendations.push('Upgrade to Premium plan for advanced features and better performance');
        }

        if (analysis.scalability === 'high') {
            recommendations.push('Consider implementing Redis for caching and session management');
        }

        return recommendations;
    }

    getBestPracticesForBot(analysis) {
        const practices = [];

        practices.push(...this.bestPractices.security);

        if (analysis.database_needed) {
            practices.push('Use connection pooling for database connections');
            practices.push('Implement proper database indexing');
        }

        if (analysis.features.includes('moderation')) {
            practices.push('Log all moderation actions for audit trails');
            practices.push('Implement progressive punishment systems');
        }

        if (analysis.complexity === 'advanced') {
            practices.push(...this.bestPractices.performance);
        }

        return practices;
    }

    // Enhanced methods for additional AI features
    async analyzePerformance(userId, code, language) {
        const userPlan = await this.getUserPlan(userId);
        
        if (!this.hasFeatureAccess(userPlan, 'code_optimization')) {
            return {
                success: false,
                error: 'Performance analysis requires Premium plan or higher.'
            };
        }

        const analysis = {
            metrics: {
                score: this.calculatePerformanceScore(code),
                executionTime: this.estimateExecutionTime(code),
                memoryUsage: this.estimateMemoryUsage(code)
            },
            bottlenecks: this.identifyBottlenecks(code),
            suggestions: this.generatePerformanceSuggestions(code)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            performance: analysis
        };
    }

    async performCodeReview(userId, code, language) {
        const userPlan = await this.getUserPlan(userId);
        
        if (!this.hasFeatureAccess(userPlan, 'code_optimization')) {
            return {
                success: false,
                error: 'Code review requires Premium plan or higher.'
            };
        }

        const review = {
            qualityScore: this.calculateQualityScore(code),
            maintainability: this.assessMaintainability(code),
            styleIssues: this.findStyleIssues(code),
            suggestions: this.generateCodeSuggestions(code)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            review: review
        };
    }

    async generateDocumentation(userId, code, language) {
        const userPlan = await this.getUserPlan(userId);
        
        if (!this.hasFeatureAccess(userPlan, 'advanced_generation')) {
            return {
                success: false,
                error: 'Documentation generation requires Premium plan or higher.'
            };
        }

        const docs = {
            apiDocs: this.generateAPIDocumentation(code),
            readme: this.generateReadmeContent(code),
            codeComments: this.generateCodeComments(code)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            documentation: docs
        };
    }

    async generateTests(userId, code, language) {
        const userPlan = await this.getUserPlan(userId);
        
        if (!this.hasFeatureAccess(userPlan, 'advanced_generation')) {
            return {
                success: false,
                error: 'Test generation requires Premium plan or higher.'
            };
        }

        const tests = {
            unitTests: this.generateUnitTests(code, language),
            integrationTests: userPlan.name === 'pro' ? this.generateIntegrationTests(code) : null,
            coverage: this.estimateTestCoverage(code)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            tests: tests
        };
    }

    async translateCode(userId, code, fromLanguage, toLanguage) {
        const userPlan = await this.getUserPlan(userId);
        
        if (!this.hasFeatureAccess(userPlan, 'advanced_generation')) {
            return {
                success: false,
                error: 'Code translation requires Premium plan or higher.'
            };
        }

        const translation = {
            translatedCode: this.performCodeTranslation(code, fromLanguage, toLanguage),
            compatibilityIssues: this.findCompatibilityIssues(code, fromLanguage, toLanguage),
            migrationNotes: this.generateMigrationNotes(fromLanguage, toLanguage)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            translation: translation
        };
    }

    async performAIBrainstorming(userId, topic, domain) {
        const userPlan = await this.getUserPlan(userId);
        
        if (userPlan.name !== 'pro') {
            return {
                success: false,
                error: 'AI Brainstorming is only available for Pro plan users.'
            };
        }

        const brainstorming = {
            ideas: this.generateIdeas(topic, domain),
            solutions: this.generateSolutions(topic, domain),
            innovations: this.generateInnovations(topic, domain)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            brainstorming: brainstorming
        };
    }

    async generateAdvancedCode(userId, prompt, language, complexity) {
        const userPlan = await this.getUserPlan(userId);
        
        if (complexity === 'pro' && userPlan.name !== 'pro') {
            return {
                success: false,
                error: 'Pro-level complexity requires Pro plan.'
            };
        }

        const generation = {
            code: this.generateComplexCode(prompt, language, complexity),
            metadata: this.generateCodeMetadata(prompt, complexity)
        };

        await this.incrementUsage(userId);
        
        return {
            success: true,
            ...generation
        };
    }

    // Helper methods for enhanced features
    calculatePerformanceScore(code) {
        let score = 100;
        
        // Deduct points for performance issues
        if (code.includes('while (true)')) score -= 30;
        if (code.includes('setInterval') && code.includes('1000')) score -= 10;
        if ((code.match(/for\s*\(/g) || []).length > 3) score -= 15;
        if (code.includes('fetch') && !code.includes('await')) score -= 20;
        
        return Math.max(score, 0);
    }

    identifyBottlenecks(code) {
        const bottlenecks = [];
        
        if (code.includes('while (true)')) {
            bottlenecks.push('Infinite loop detected - potential performance issue');
        }
        
        if (code.includes('client.guilds.cache.forEach')) {
            bottlenecks.push('Iterating over all guilds - consider caching or limiting');
        }
        
        if ((code.match(/await/g) || []).length > 10) {
            bottlenecks.push('Many async operations - consider Promise.all() for parallel execution');
        }
        
        return bottlenecks;
    }

    generatePerformanceSuggestions(code) {
        const suggestions = [];
        
        suggestions.push('Implement caching for frequently accessed data');
        suggestions.push('Use database indexing for better query performance');
        suggestions.push('Consider using worker threads for CPU-intensive tasks');
        
        if (code.includes('setInterval')) {
            suggestions.push('Use longer intervals to reduce CPU usage');
        }
        
        return suggestions;
    }

    calculateQualityScore(code) {
        let score = 100;
        
        // Check for best practices
        if (!code.includes('try') && code.includes('await')) score -= 20;
        if (!code.includes('const') && code.includes('var')) score -= 15;
        if ((code.match(/console\.log/g) || []).length > 5) score -= 10;
        if (!code.includes('//') && !code.includes('/*')) score -= 15;
        
        return Math.max(score, 0);
    }

    // Keep all existing helper methods and add these enhanced ones
    customizeTemplateAdvanced(template, prompt, analysis, userPlan) {
        const botName = this.extractBotName(prompt) || 'EnhancedBot';
        const description = this.extractDescription(prompt);
        const prefix = this.extractPrefix(prompt) || '!';

        const files = {};
        
        if (typeof template === 'object') {
            // Multi-file template
            for (const [filename, code] of Object.entries(template)) {
                files[filename] = this.customizeCodeAdvanced(code, { 
                    botName, description, prefix, analysis, userPlan 
                });
            }
        } else {
            // Single file template
            files['index.js'] = this.customizeCodeAdvanced(template, { 
                botName, description, prefix, analysis, userPlan 
            });
        }

        // Add enhanced configuration files
        files['package.json'] = this.generateAdvancedPackageJson(botName, analysis);
        files['config.json'] = this.generateAdvancedConfig(botName, prefix, analysis);
        files['README.md'] = this.generateAdvancedReadme(botName, description, analysis);
        
        if (analysis.database_needed) {
            files['database.js'] = this.generateDatabaseModule(analysis);
        }
        
        if (analysis.api_integrations.length > 0) {
            files['api.js'] = this.generateAPIModule(analysis);
        }

        return {
            files: files,
            structure: this.generateAdvancedFolderStructure(files, analysis),
            totalLines: Object.values(files).join('\n').split('\n').length,
            features: analysis.features,
            complexity: analysis.complexity
        };
    }

    customizeCodeAdvanced(code, options) {
        let customized = code
            .replace(/{{BOT_NAME}}/g, options.botName)
            .replace(/{{DESCRIPTION}}/g, options.description)
            .replace(/{{PREFIX}}/g, options.prefix)
            .replace(/{{FEATURES}}/g, options.analysis.features.join(', ') || 'basic commands');

        // Add required intents based on analysis
        if (options.analysis.intents.length > 0) {
            const intentsString = options.analysis.intents.map(intent => `GatewayIntentBits.${intent}`).join(', ');
            customized = customized.replace(
                /intents:\s*\[[^\]]*\]/,
                `intents: [${intentsString}]`
            );
        }

        return customized;
    }

    generateAdvancedPackageJson(botName, analysis) {
        const dependencies = {
            "discord.js": "^14.0.0"
        };

        // Add dependencies based on analysis
        if (analysis.database_needed) {
            dependencies["sqlite3"] = "^5.1.0";
            dependencies["pg"] = "^8.8.0";
        }

        if (analysis.features.includes('music')) {
            dependencies["@discordjs/voice"] = "^0.16.0";
            dependencies["ytdl-core"] = "^4.11.0";
        }

        if (analysis.features.includes('leveling')) {
            dependencies["@napi-rs/canvas"] = "^0.1.0";
        }

        if (analysis.api_integrations.includes('express')) {
            dependencies["express"] = "^4.18.0";
            dependencies["express-session"] = "^1.17.0";
            dependencies["passport"] = "^0.6.0";
            dependencies["passport-discord"] = "^0.1.4";
        }

        if (analysis.complexity === 'advanced' || analysis.complexity === 'pro') {
            dependencies["redis"] = "^4.5.0";
            dependencies["winston"] = "^3.8.0";
        }

        return JSON.stringify({
            "name": botName.toLowerCase().replace(/\s+/g, '-'),
            "version": "1.0.0",
            "description": `${botName} - Enhanced Discord Bot with AI-powered features`,
            "main": "index.js",
            "scripts": {
                "start": "node index.js",
                "dev": "nodemon index.js",
                "test": "jest",
                "lint": "eslint ."
            },
            "dependencies": dependencies,
            "devDependencies": {
                "nodemon": "^2.0.0",
                "jest": "^29.0.0",
                "eslint": "^8.0.0"
            },
            "engines": {
                "node": ">=16.0.0"
            }
        }, null, 2);
    }

    generateAdvancedConfig(botName, prefix, analysis) {
        const config = {
            "token": "YOUR_BOT_TOKEN_HERE",
            "clientId": "YOUR_CLIENT_ID_HERE",
            "guildId": "YOUR_GUILD_ID_HERE",
            "prefix": prefix,
            "features": analysis.features,
            "intents": analysis.intents,
            "permissions": analysis.permissions
        };

        if (analysis.database_needed) {
            config.database = {
                "type": "sqlite",
                "path": "./bot.db"
            };
        }

        return JSON.stringify(config, null, 2);
    }

    generateAdvancedReadme(botName, description, analysis) {
        return `# ${botName}

## Description
${description}

## Features
${analysis.features.map(f => `- ${f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}`).join('\n')}

## Required Intents
${analysis.intents.map(i => `- ${i}`).join('\n')}

## Required Permissions
${analysis.permissions.map(p => `- ${p.replace(/([A-Z])/g, ' $1').trim()}`).join('\n')}

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and bot
3. Copy the bot token and client ID
4. Update \`config.json\` with your credentials
5. Enable required intents in the Developer Portal

### 3. Database Setup
${analysis.database_needed ? '- Run database migrations\n- Configure database connection' : '- No database required for this bot'}

### 4. Run the Bot
\`\`\`bash
npm start
\`\`\`

## Architecture
- **Type**: ${analysis.architecture}
- **Complexity**: ${analysis.complexity}
- **Scalability**: ${analysis.scalability}

## Support
This bot was generated by Smart Serve AI Assistant - Custom Local AI System
No external APIs required!

## License
MIT License
`;
    }

    generateDatabaseModule(analysis) {
        return `const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

class Database {
    constructor(type = 'sqlite') {
        this.type = type;
        this.init();
    }

    init() {
        if (this.type === 'sqlite') {
            this.db = new sqlite3.Database('./bot.db');
            this.initSQLite();
        } else if (this.type === 'postgresql') {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
            this.initPostgreSQL();
        }
    }

    initSQLite() {
        this.db.serialize(() => {
            // Create tables based on features
            ${analysis.features.includes('economy') ? `
            this.db.run(\`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                balance INTEGER DEFAULT 0,
                last_daily INTEGER DEFAULT 0
            )\`);` : ''}
            
            ${analysis.features.includes('leveling') ? `
            this.db.run(\`CREATE TABLE IF NOT EXISTS user_levels (
                user_id TEXT,
                guild_id TEXT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                total_xp INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, guild_id)
            )\`);` : ''}
        });
    }

    async initPostgreSQL() {
        // PostgreSQL table creation
        ${analysis.features.includes('economy') ? `
        await this.pool.query(\`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT PRIMARY KEY,
                balance INTEGER DEFAULT 0,
                last_daily TIMESTAMP DEFAULT NULL
            )
        \`);` : ''}
    }

    // Add methods based on features
    ${analysis.features.includes('economy') ? `
    async getBalance(userId) {
        if (this.type === 'sqlite') {
            return new Promise((resolve, reject) => {
                this.db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) reject(err);
                    resolve(row ? row.balance : 0);
                });
            });
        }
    }` : ''}
}

module.exports = Database;`;
    }

    generateAPIModule(analysis) {
        return `const express = require('express');
const session = require('express-session');
${analysis.api_integrations.includes('oauth2') ? "const passport = require('passport');" : ''}

class APIServer {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        ${analysis.api_integrations.includes('oauth2') ? `
        this.app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }));
        
        this.app.use(passport.initialize());
        this.app.use(passport.session());` : ''}
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                guilds: this.bot.guilds.cache.size,
                users: this.bot.users.cache.size,
                uptime: process.uptime()
            });
        });

        // Bot statistics
        this.app.get('/api/stats', (req, res) => {
            res.json({
                guilds: this.bot.guilds.cache.size,
                users: this.bot.users.cache.size,
                channels: this.bot.channels.cache.size
            });
        });

        ${analysis.features.includes('dashboard') ? `
        // Dashboard routes
        this.app.get('/dashboard', (req, res) => {
            res.sendFile(__dirname + '/public/dashboard.html');
        });` : ''}
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(\`API server running on port \${port}\`);
        });
    }
}

module.exports = APIServer;`;
    }

    // Keep all existing methods and enhance where needed
    async getUserPlan(userId) {
        try {
            const user = await this.database.getUserById(userId);
            const planName = user?.plan || 'starter';
            return {
                name: planName,
                ...this.planLimits[planName]
            };
        } catch (error) {
            console.error('Error getting user plan:', error);
            return { name: 'starter', ...this.planLimits.starter };
        }
    }

    async checkUsageLimits(userId, userPlan) {
        if (userPlan.commands === -1) return true;
        
        const usage = await this.getUserUsage(userId);
        return usage < userPlan.commands;
    }

    async getUserUsage(userId) {
        try {
            const result = await this.database.pool.query(
                'SELECT command_count FROM user_usage WHERE user_id = $1',
                [userId]
            );
            return result.rows[0]?.command_count || 0;
        } catch (error) {
            console.error('Error getting user usage:', error);
            return 0;
        }
    }

    async incrementUsage(userId) {
        try {
            await this.database.pool.query(`
                INSERT INTO user_usage (user_id, command_count, last_reset) 
                VALUES ($1, 1, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    command_count = user_usage.command_count + 1,
                    updated_at = CURRENT_TIMESTAMP
            `, [userId]);
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    }
}

module.exports = CustomAIBotAssistant;
