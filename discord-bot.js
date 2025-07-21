const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const CustomAIBotAssistant = require('./ai-bot-assistant');

class OrderBot {
    constructor(database) {
        this.database = database;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.orderCount = 0;
        this.pendingOrders = new Map(); // Store pending order confirmations
        this.activeOrders = new Map(); // Store active orders being processed
        this.awaitingTimeline = new Map(); // Store orders waiting for admin timeline
        this.orderHistory = new Map(); // Store all order history by user ID
        this.orderDeadlines = new Map(); // Store order deadlines for reminders
        this.awaitingModification = new Map(); // Store orders being modified
        this.userCode = new Map(); // Store user code submissions
        this.awaitingCodeSubmission = new Map(); // Store users submitting code
        this.pendingCodeUploads = new Map();
        this.aiAssistant = new CustomAIBotAssistant(database);

        this.setupEventHandlers();
        this.startDeadlineReminders();
        this.registerSlashCommands();
    }

    async registerSlashCommands() {
        const commands = [
            new SlashCommandBuilder()
                .setName('status')
                .setDescription('Check the status of your order')
                .addIntegerOption(option =>
                    option.setName('order_number')
                        .setDescription('Order number to check')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('history')
                .setDescription('View your order history'),

            new SlashCommandBuilder()
                .setName('cancel')
                .setDescription('Cancel a pending order')
                .addIntegerOption(option =>
                    option.setName('order_number')
                        .setDescription('Order number to cancel')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('modify')
                .setDescription('Modify a pending order')
                .addIntegerOption(option =>
                    option.setName('order_number')
                        .setDescription('Order number to modify')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('dm')
                .setDescription('Send a DM to specific user(s)')
                .addStringOption(option =>
                    option.setName('users')
                        .setDescription('User IDs or mentions (separate multiple with commas)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to send')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('dmrole')
                .setDescription('Send a DM to all users with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to message')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to send')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('help')
                .setDescription('Show available commands'),

            new SlashCommandBuilder()
                .setName('addcode')
                .setDescription('Add code to a user\'s coding environment (ADMIN ONLY)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to add the code to')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('filename')
                        .setDescription('Name of the file (e.g., bot.js, index.html)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('order_number')
                        .setDescription('Order number to associate with')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('viewcode')
                .setDescription('View your uploaded code files'),

            new SlashCommandBuilder()
                .setName('deletecode')
                .setDescription('Delete a code file')
                .addStringOption(option =>
                    option.setName('filename')
                        .setDescription('Name of the file to delete')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('managecode')
                .setDescription('Manage code files for users (ADMIN ONLY)')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List code files for a user')
                        .addUserOption(option =>
                            option.setName('user')
                                .setDescription('The user to list code files for')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('delete')
                        .setDescription('Delete a code file for a user')
                        .addUserOption(option =>
                            option.setName('user')
                                .setDescription('The user to delete the code file from')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('filename')
                                .setDescription('The name of the file to delete')
                                .setRequired(true)
                        )
                ),

            new SlashCommandBuilder()
                .setName('upgrader')
                .setDescription('Upgrade a user\'s plan (ADMIN ONLY)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to upgrade')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('plan')
                        .setDescription('The plan to upgrade to')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Starter', value: 'starter' },
                            { name: 'Premium', value: 'premium' },
                            { name: 'Pro', value: 'pro' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aicode')
                .setDescription('Generate Discord bot code with AI')
                .addStringOption(option =>
                    option.setName('prompt')
                        .setDescription('Describe what kind of bot you want')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aidebug')
                .setDescription('Debug your Discord bot code with AI')
                .addStringOption(option =>
                    option.setName('error')
                        .setDescription('The error message you\'re getting')
                        .setRequired(true)
                ),

            new SlashCommandBuilder()
                .setName('checkplan')
                .setDescription('Check your current plan and usage'),

            new SlashCommandBuilder()
                .setName('aioptimize')
                .setDescription('Optimize your code with AI')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to optimize')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aisecurity')
                .setDescription('Analyze code for security vulnerabilities')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to analyze')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aiperformance')
                .setDescription('Analyze code performance and suggest improvements')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to analyze')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aireview')
                .setDescription('Get AI code review and quality analysis')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to review')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aidocs')
                .setDescription('Generate documentation for your code')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to document')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aitests')
                .setDescription('Generate tests for your code')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to test')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aitranslate')
                .setDescription('Translate code between languages')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code to translate')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('from')
                        .setDescription('Source language')
                        .setRequired(true)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                )
                .addStringOption(option =>
                    option.setName('to')
                        .setDescription('Target language')
                        .setRequired(true)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aibrainstorm')
                .setDescription('AI brainstorming session for ideas and solutions')
                .addStringOption(option =>
                    option.setName('topic')
                        .setDescription('Topic to brainstorm about')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('domain')
                        .setDescription('Domain/field')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Discord Bots', value: 'discord' },
                            { name: 'Web Development', value: 'web' },
                            { name: 'Game Development', value: 'games' },
                            { name: 'AI/ML', value: 'ai' },
                            { name: 'General', value: 'general' }
                        )
                ),

            new SlashCommandBuilder()
                .setName('aiadvanced')
                .setDescription('Advanced AI code generation with complexity options')
                .addStringOption(option =>
                    option.setName('prompt')
                        .setDescription('Describe what you want to build')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('complexity')
                        .setDescription('Complexity level')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Basic', value: 'basic' },
                            { name: 'Advanced', value: 'advanced' },
                            { name: 'Pro', value: 'pro' }
                        )
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JavaScript', value: 'javascript' },
                            { name: 'Python', value: 'python' }
                        )
                )
        ];

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || '1382392124619886652'),
                { body: commands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error registering slash commands:', error);
        }
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`Discord bot logged in as ${this.client.user.tag}`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            // Handle DM responses
            if (message.channel.type === 1) { // DM Channel
                await this.handleDMResponse(message);
            }
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction);
            } else if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            }
        });
    }

    startDeadlineReminders() {
        // Check for deadlines every hour
        setInterval(() => {
            this.checkDeadlines();
        }, 60 * 60 * 1000); // 1 hour
    }

    async checkDeadlines() {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        for (const [orderId, orderData] of this.orderDeadlines) {
            const timeUntilDeadline = orderData.deadline - now;

            // Send reminder 24 hours before deadline
            if (timeUntilDeadline <= oneDayMs && timeUntilDeadline > 0 && !orderData.reminderSent) {
                try {
                    const adminUser = await this.client.users.fetch(orderData.adminId);
                    await adminUser.send(`⏰ **Deadline Reminder**\n\nOrder ${orderData.orderNumber} for <@${orderData.userId}> is due in less than 24 hours!\n\n**Content:** ${orderData.content}\n**Deadline:** ${new Date(orderData.deadline).toLocaleString()}`);

                    orderData.reminderSent = true;
                } catch (error) {
                    console.error('Failed to send deadline reminder:', error);
                }
            }

            // Remove expired deadlines
            if (timeUntilDeadline <= 0) {
                this.orderDeadlines.delete(orderId);
            }
        }
    }

    async handleSlashCommand(interaction) {
        const { commandName, options, user } = interaction;
        const userId = user.id;

        try {
            switch (commandName) {
                case 'status':
                    const statusOrderNumber = options.getInteger('order_number');
                    await this.handleStatusCommand(interaction, statusOrderNumber);
                    break;
                case 'history':
                    await this.handleHistoryCommand(interaction);
                    break;
                case 'cancel':
                    const cancelOrderNumber = options.getInteger('order_number');
                    await this.handleCancelCommand(interaction, cancelOrderNumber);
                    break;
                case 'modify':
                    const modifyOrderNumber = options.getInteger('order_number');
                    await this.handleModifyCommand(interaction, modifyOrderNumber);
                    break;
                case 'dm':
                    const users = options.getString('users');
                    const message = options.getString('message');
                    await this.handleDMCommand(interaction, users, message);
                    break;
                case 'dmrole':
                    const role = options.getRole('role');
                    const roleMessage = options.getString('message');
                    await this.handleDMRoleCommand(interaction, role, roleMessage);
                    break;
                case 'help':
                    await this.handleHelpCommand(interaction);
                    break;
                case 'addcode':
                    // Check if user is admin
                    const member = interaction.member;
                    const adminRoleId = process.env.ADMIN_ROLE_ID;

                    if (!member.roles.cache.has(adminRoleId)) {
                        await interaction.reply({
                            content: '❌ This command is only available to administrators.',
                            ephemeral: true
                        });
                        return;
                    }

                    const filename = options.getString('filename');
                    const targetUser = options.getUser('user');
                    const orderNumber = options.getString('order_number');

                    await interaction.reply({
                        content: `📁 Adding code file: **${filename}** for user **${targetUser.username}**\nPlease check your DMs to paste the code.`,
                        ephemeral: true
                    });

                    try {
                        const dmChannel = await interaction.user.createDM();

                        await dmChannel.send({
                            embeds: [{
                                title: '📝 Admin Code Upload',
                                description: `Please paste the code for **${filename}** (for user: **${targetUser.username}**) below:`,
                                color: 0x00ff00,
                                fields: [
                                    {
                                        name: 'Target User',
                                        value: `${targetUser.username} (${targetUser.id})`,
                                        inline: true
                                    },
                                    {
                                        name: 'Order Number',
                                        value: orderNumber || 'None specified',
                                        inline: true
                                    }
                                ],
                                footer: {
                                    text: 'Reply with the code in the next message'
                                }
                            }]
                        });

                        // Store the pending code upload with target user info
                        this.pendingCodeUploads.set(interaction.user.id, {
                            filename: filename,
                            targetUserId: targetUser.id,
                            targetUsername: targetUser.username,
                            orderNumber: orderNumber,
                            isAdminUpload: true,
                            timestamp: Date.now()
                        });

                    } catch (error) {
                        console.error('Failed to send DM for admin code upload:', error);
                        await interaction.followUp({
                            content: '❌ Failed to send DM. Please make sure your DMs are enabled.',
                            ephemeral: true
                        });
                    }
                    break;
                case 'viewcode':
                    await this.handleViewCodeCommand(interaction);
                    break;
                case 'deletecode':
                    const deleteFilename = options.getString('filename');
                    await this.handleDeleteCodeCommand(interaction, deleteFilename);
                    break;
                case 'managecode':
                    // Check if user is admin
                    const member2 = interaction.member;
                    const adminRoleId2 = process.env.ADMIN_ROLE_ID;

                    if (!member2.roles.cache.has(adminRoleId2)) {
                        await interaction.reply({
                            content: '❌ This command is only available to administrators.',
                            ephemeral: true
                        });
                        return;
                    }

                    const subcommand = options.getSubcommand();
                    const manageTargetUser = options.getUser('user');

                    if (subcommand === 'list') {
                        const userCodeMap = this.userCode.get(manageTargetUser.id);

                        if (!userCodeMap || userCodeMap.size === 0) {
                            await interaction.reply({
                                content: `📁 No code files found for user **${manageTargetUser.username}**.`,
                                ephemeral: true
                            });
                            return;
                        }

                        const filesList = Array.from(userCodeMap.values()).map((file, index) => {
                            return `${index + 1}. **${file.filename}** (Order: ${file.orderNumber || 'N/A'}) - Uploaded: <t:${Math.floor(file.uploadedAt / 1000)}:R>`;
                        }).join('\n');

                        await interaction.reply({
                            embeds: [{
                                title: `📁 Code Files for ${manageTargetUser.username}`,
                                description: filesList,
                                color: 0x0099ff,
                                footer: {
                                    text: `Total files: ${userCodeMap.size}`
                                }
                            }],
                            ephemeral: true
                        });

                    } else if (subcommand === 'delete') {
                        const filename = options.getString('filename');
                        const userCodeMap = this.userCode.get(manageTargetUser.id);

                        if (!userCodeMap) {
                            await interaction.reply({
                                content: `📁 No code files found for user **${manageTargetUser.username}**.`,
                                ephemeral: true
                            });
                            return;
                        }

                        // Find and delete the file
                        let deleted = false;
                        for (const [key, file] of userCodeMap) {
                            if (file.filename === filename) {
                                userCodeMap.delete(key);
                                deleted = true;
                                break;
                            }
                        }

                        if (deleted) {
                            await interaction.reply({
                                content: `✅ Successfully deleted **${filename}** from **${manageTargetUser.username}**'s coding environment.`,
                                ephemeral: true
                            });
                        } else {
                            await interaction.reply({
                                content: `❌ File **${filename}** not found for user **${manageTargetUser.username}**.`,
                                ephemeral: true
                            });
                        }
                    }
                    break;

                case 'upgrader':
                    // Check if user is admin
                    const adminMember = interaction.member;
                    const adminRole = process.env.ADMIN_ROLE_ID;

                    if (!adminMember.roles.cache.has(adminRole)) {
                        await interaction.reply({
                            content: '❌ This command is only available to administrators.',
                            ephemeral: true
                        });
                        return;
                    }

                    const upgradeTargetUser = options.getUser('user');
                    const newPlan = options.getString('plan');

                    try {
                        await this.database.updateUserPlan(upgradeTargetUser.id, newPlan);
                        await this.database.resetUserUsage(upgradeTargetUser.id);

                        const planDetails = {
                            starter: { commands: '50', bots: '3', features: 'Basic AI assistance' },
                            premium: { commands: '100', bots: '5', features: 'Enhanced AI assistance' },
                            pro: { commands: 'Unlimited', bots: 'Unlimited', features: 'Advanced AI + brainstorming' }
                        };

                        const details = planDetails[newPlan];

                        await interaction.reply({
                            embeds: [{
                                title: '✅ User Plan Updated',
                                description: `**${upgradeTargetUser.username}** has been upgraded to **${newPlan.toUpperCase()}** plan!`,
                                fields: [
                                    { name: 'AI Commands', value: details.commands, inline: true },
                                    { name: 'Bot Limit', value: details.bots, inline: true },
                                    { name: 'Features', value: details.features, inline: true }
                                ],
                                color: 0x00ff00,
                                timestamp: new Date()
                            }],
                            ephemeral: true
                        });

                        // Notify the user
                        try {
                            const userDM = await upgradeTargetUser.createDM();
                            await userDM.send({
                                embeds: [{
                                    title: '🎉 Plan Upgraded!',
                                    description: `Your Smart Serve plan has been upgraded to **${newPlan.toUpperCase()}**!`,
                                    fields: [
                                        { name: 'AI Commands', value: details.commands, inline: true },
                                        { name: 'Bot Limit', value: details.bots, inline: true },
                                        { name: 'New Features', value: details.features, inline: false }
                                    ],
                                    color: 0x00ff00,
                                    footer: { text: 'Your usage counter has been reset!' }
                                }]
                            });
                        } catch (dmError) {
                            console.log('Could not send upgrade notification to user');
                        }

                    } catch (error) {
                        console.error('Error upgrading user:', error);
                        await interaction.reply({
                            content: '❌ Failed to upgrade user plan. Please try again.',
                            ephemeral: true
                        });
                    }
                    break;

                case 'aicode':
                    await this.handleAICodeCommand(interaction);
                    break;

                case 'aidebug':
                    await this.handleAIDebugCommand(interaction);
                    break;

                case 'checkplan':
                    await this.handleCheckPlanCommand(interaction);
                    break;

                case 'aioptimize':
                    await this.handleAIOptimizeCommand(interaction);
                    break;

                case 'aisecurity':
                    await this.handleAISecurityCommand(interaction);
                    break;

                case 'aiperformance':
                    await this.handleAIPerformanceCommand(interaction);
                    break;

                case 'aireview':
                    await this.handleAIReviewCommand(interaction);
                    break;

                case 'aidocs':
                    await this.handleAIDocsCommand(interaction);
                    break;

                case 'aitests':
                    await this.handleAITestsCommand(interaction);
                    break;

                case 'aitranslate':
                    await this.handleAITranslateCommand(interaction);
                    break;

                case 'aibrainstorm':
                    await this.handleAIBrainstormCommand(interaction);
                    break;

                case 'aiadvanced':
                    await this.handleAIAdvancedCommand(interaction);
                    break;

                default:
                    await interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
            }
        } catch (error) {
            console.error('Slash command error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ An error occurred while processing the command.', ephemeral: true });
            }
        }
    }

    async handleStatusCommand(interaction, orderNumber) {
        const userId = interaction.user.id;

        const userHistory = this.orderHistory.get(userId) || [];
        const order = userHistory.find(o => o.orderNumber.toString() === orderNumber.toString());

        if (!order) {
            await interaction.reply({ content: '❌ Order not found. Use `/history` to see your orders.', ephemeral: true });
            return;
        }

        const statusEmbed = new EmbedBuilder()
            .setTitle(`📋 Order ${order.orderNumber} Status`)
            .setDescription(order.content)
            .addFields(
                { name: 'Status', value: order.status, inline: true },
                { name: 'Created', value: new Date(order.createdAt).toLocaleString(), inline: true },
                { name: 'Order ID', value: order.orderId, inline: true }
            )
            .setColor(this.getStatusColor(order.status))
            .setTimestamp();

        if (order.adminId) {
            statusEmbed.addFields({ name: 'Assigned to', value: `<@${order.adminId}>`, inline: true });
        }

        if (order.deadline) {
            statusEmbed.addFields({ name: 'Deadline', value: new Date(order.deadline).toLocaleString(), inline: true });
        }

        await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
    }

    async handleHistoryCommand(interaction) {
        const userId = interaction.user.id;
        const userHistory = this.orderHistory.get(userId) || [];

        if (userHistory.length === 0) {
            await interaction.reply({ content: '📝 You have no order history. Place your first order on the website!', ephemeral: true });
            return;
        }

        const historyEmbed = new EmbedBuilder()
            .setTitle('📚 Your Order History')
            .setDescription(`You have ${userHistory.length} order(s)`)
            .setColor(0x0099FF)
            .setTimestamp();

        userHistory.slice(-10).forEach(order => {
            const statusIcon = this.getStatusIcon(order.status);
            historyEmbed.addFields({
                name: `${statusIcon} Order ${order.orderNumber}`,
                value: `**Status:** ${order.status}\n**Created:** ${new Date(order.createdAt).toLocaleString()}\n**Content:** ${order.content.substring(0, 100)}${order.content.length > 100 ? '...' : ''}`,
                inline: false
            });
        });

        if (userHistory.length > 10) {
            historyEmbed.setFooter({ text: 'Showing last 10 orders' });
        }

        await interaction.reply({ embeds: [historyEmbed], ephemeral: true });
    }

    async handleCancelCommand(interaction, orderNumber) {
        const userId = interaction.user.id;

        // Check if order is pending confirmation
        if (this.pendingOrders.has(userId)) {
            const pendingOrder = this.pendingOrders.get(userId);
            if (pendingOrder.orderNumber.toString() === orderNumber.toString()) {
                this.pendingOrders.delete(userId);
                await interaction.reply({ content: '✅ Pending order cancelled successfully.', ephemeral: true });
                return;
            }
        }

        // Check active orders
        const activeOrder = Array.from(this.activeOrders.values()).find(
            order => order.userId === userId && order.orderNumber.toString() === orderNumber.toString()
        );

        if (activeOrder) {
            this.activeOrders.delete(activeOrder.orderId);

            // Update order history
            const userHistory = this.orderHistory.get(userId) || [];
            const historyOrder = userHistory.find(o => o.orderNumber.toString() === orderNumber.toString());
            if (historyOrder) {
                historyOrder.status = '❌ Cancelled';
            }

            await interaction.reply({ content: '✅ Order cancelled successfully.', ephemeral: true });
            return;
        }

        await interaction.reply({ content: '❌ Order not found or cannot be cancelled. Only pending orders can be cancelled.', ephemeral: true });
    }

    async handleModifyCommand(interaction, orderNumber) {
        const userId = interaction.user.id;

        // Check if order is pending confirmation
        if (this.pendingOrders.has(userId)) {
            const pendingOrder = this.pendingOrders.get(userId);
            if (pendingOrder.orderNumber.toString() === orderNumber.toString()) {
                this.awaitingModification.set(userId, pendingOrder);
                await interaction.reply({ content: '✏️ **Order Modification**\n\nCurrent content: ' + pendingOrder.content + '\n\nPlease send your new bot content in DMs:', ephemeral: true });
                return;
            }
        }

        // Check active orders (only allow modification if not yet accepted)
        const activeOrder = Array.from(this.activeOrders.values()).find(
            order => order.userId === userId && order.orderNumber.toString() === orderNumber.toString()
        );

        if (activeOrder) {
            this.awaitingModification.set(userId, activeOrder);
            await interaction.reply({ content: '✏️ **Order Modification**\n\nCurrent content: ' + activeOrder.content + '\n\nPlease send your new bot content in DMs:', ephemeral: true });
            return;
        }

        await interaction.reply({ content: '❌ Order not found or cannot be modified. Only pending orders can be modified.', ephemeral: true });
    }

    async handleDMCommand(interaction, users, message) {
        try {
            const userIds = users.split(',').map(u => u.trim().replace(/[<@!>]/g, ''));
            let successCount = 0;
            let failCount = 0;

            for (const userId of userIds) {
                try {
                    const user = await this.client.users.fetch(userId);
                    await user.send(`📩 **Message from ${interaction.user.username}:**\n\n${message}`);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to DM user ${userId}:`, error);
                    failCount++;
                }
            }

            await interaction.reply({ 
                content: `✅ DM sent to ${successCount} user(s).${failCount > 0 ? ` Failed to send to ${failCount} user(s).` : ''}`, 
                ephemeral: true 
            });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to send DMs. Please check the user IDs.', ephemeral: true });
        }
    }

    async handleDMRoleCommand(interaction, role, message) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const members = await guild.members.fetch();
            const roleMembers = members.filter(member => member.roles.cache.has(role.id));

            let successCount = 0;
            let failCount = 0;

            for (const [memberId, member] of roleMembers) {
                try {
                    await member.send(`📩 **Message from ${interaction.user.username} to ${role.name} role:**\n\n${message}`);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to DM member ${memberId}:`, error);
                    failCount++;
                }
            }

            await interaction.editReply({ 
                content: `✅ DM sent to ${successCount} member(s) with the ${role.name} role.${failCount > 0 ? ` Failed to send to ${failCount} member(s).` : ''}` 
            });
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to send DMs to role members.' });
        }
    }

    async handleAddCodeCommand(interaction, filename) {
        const userId = interaction.user.id;

        // Validate filename
        if (!filename || filename.trim() === '') {
            await interaction.reply({ content: '❌ Please provide a valid filename.', ephemeral: true });
            return;
        }

        // Check if user has any orders
        const userHistory = this.orderHistory.get(userId) || [];
        if (userHistory.length === 0) {
            await interaction.reply({ 
                content: '❌ You need to place an order first on the website before uploading code files.', 
                ephemeral: true 
            });
            return;
        }

        // Show user's orders to select from
        const orderOptions = userHistory.map(order => 
            `**${order.orderNumber}** - ${order.content.substring(0, 50)}${order.content.length > 50 ? '...' : ''} (${order.status})`
        ).join('\n');

        // Set user as awaiting order selection
        this.awaitingCodeSubmission.set(userId, { 
            filename: filename.trim(),
            step: 'select_order'
        });

        await interaction.reply({ 
            content: `📝 **Code Submission for ${filename}**\n\nYour Orders:\n${orderOptions}\n\nPlease reply with the **order number** you want to associate this code with:`, 
            ephemeral: true 
        });
    }

    async handleViewCodeCommand(interaction) {
        const userId = interaction.user.id;
        const userFiles = this.userCode.get(userId);

        if (!userFiles || userFiles.size === 0) {
            await interaction.reply({ content: '📂 You have no code files. Use `/addcode` to upload some!', ephemeral: true });
            return;
        }

        const filesEmbed = new EmbedBuilder()
            .setTitle('📂 Your Code Files')
            .setDescription(`You have ${userFiles.size} file(s)`)
            .setColor(0x0099FF)
            .setTimestamp();

        for (const [fileKey, fileData] of userFiles) {
            const preview = fileData.content.substring(0, 100);
            const displayName = fileData.filename || fileKey;
            const orderInfo = fileData.orderNumber ? ` (Order #${fileData.orderNumber})` : '';

            filesEmbed.addFields({
                name: `📄 ${displayName}${orderInfo} (${fileData.language})`,
                value: `\`\`\`${fileData.language}\n${preview}${fileData.content.length > 100 ? '...' : ''}\n\`\`\`\n*Modified: ${new Date(fileData.lastModified).toLocaleString()}*`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [filesEmbed], ephemeral: true });
    }

    async handleDeleteCodeCommand(interaction, filename) {
        const userId = interaction.user.id;
        const userFiles = this.userCode.get(userId);

        if (!userFiles || userFiles.size === 0) {
            await interaction.reply({ content: '❌ You have no code files.', ephemeral: true });
            return;
        }

        // Find the file by filename (could be with or without order prefix)
        let fileKeyToDelete = null;
        for (const [fileKey, fileData] of userFiles) {
            if (fileKey === filename || fileData.filename === filename || fileKey.endsWith(`_${filename}`)) {
                fileKeyToDelete = fileKey;
                break;
            }
        }

        if (!fileKeyToDelete) {
            await interaction.reply({ content: '❌ File not found. Use `/viewcode` to see your files.', ephemeral: true });
            return;
        }

        const fileData = userFiles.get(fileKeyToDelete);
        userFiles.delete(fileKeyToDelete);

        const displayName = fileData.filename || filename;
        const orderInfo = fileData.orderNumber ? ` from Order #${fileData.orderNumber}` : '';

        await interaction.reply({ content: `✅ **${displayName}**${orderInfo} deleted successfully.`, ephemeral: true });
    }

    async handleAICodeCommand(interaction) {
        const userId = interaction.user.id;
        const prompt = interaction.options.getString('prompt');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.generateBotCode(userId, prompt, language);

            if (!result.success) {
                if (result.upgradeRequired) {
                    await interaction.editReply({
                        embeds: [{
                            title: '⛔ Command Limit Reached',
                            description: result.error,
                            fields: [
                                { name: 'Current Plan', value: 'Starter', inline: true },
                                { name: 'Upgrade Options', value: 'Premium: 100 commands\nPro: Unlimited', inline: true }
                            ],
                            color: 0xff0000,
                            footer: { text: 'Contact an admin for plan upgrades' }
                        }]
                    });
                } else {
                    await interaction.editReply({ content: `❌ ${result.error}` });
                }
                return;
            }

            // Store generated files for the user
            if (!this.userCode.has(userId)) {
                this.userCode.set(userId, new Map());
            }

            const userCodeMap = this.userCode.get(userId);
            const timestamp = Date.now();

            for (const [filename, content] of Object.entries(result.code.files)) {
                const fileKey = `ai_${timestamp}_${filename}`;
                userCodeMap.set(fileKey, {
                    filename: filename,
                    content: content,
                    lastModified: timestamp,
                    language: language,
                    orderNumber: null,
                    uploadedBy: userId,
                    isAIGenerated: true
                });
            }

            await interaction.editReply({
                embeds: [{
                    title: '🤖 AI Bot Code Generated!',
                    description: `Generated ${Object.keys(result.code.files).length} files for your Discord bot.`,
                    fields: [
                        { name: 'Language', value: language.toUpperCase(), inline: true },
                        { name: 'Files Created', value: Object.keys(result.code.files).join('\n'), inline: true },
                        { name: 'Usage', value: `Use \`/viewcode\` to see your files`, inline: false }
                    ],
                    color: 0x00ff00,
                    footer: { text: 'Visit your coding environment to edit and run the code' }
                }]
            });

        } catch (error) {
            console.error('AI code generation error:', error);
            await interaction.editReply({ content: '❌ Failed to generate code. Please try again later.' });
        }
    }

    async handleAIDebugCommand(interaction) {
        const userId = interaction.user.id;
        const errorMessage = interaction.options.getString('error');

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.debugCode('', errorMessage, userId);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Debug Limit Reached',
                        description: result.error,
                        color: 0xff0000,
                        footer: { text: 'Contact an admin for plan upgrades' }
                    }]
                });
                return;
            }

            const fixesText = result.fixes.map((fix, index) => 
                `**${index + 1}. ${fix.issue}**\n${fix.solution}\n\`\`\`${fix.codeExample}\`\`\``
            ).join('\n\n');

            await interaction.editReply({
                embeds: [{
                    title: '🔧 AI Debug Analysis',
                    description: result.explanation,
                    fields: [
                        { name: 'Suggested Fixes', value: fixesText.length > 1000 ? fixesText.substring(0, 1000) + '...' : fixesText }
                    ],
                    color: 0x0099ff,
                    footer: { text: 'AI-powered debugging assistance' }
                }]
            });

        } catch (error) {
            console.error('AI debug error:', error);
            await interaction.editReply({ content: '❌ Failed to debug code. Please try again later.' });
        }
    }

    async handleCheckPlanCommand(interaction) {
        const userId = interaction.user.id;

        try {
            const userPlan = await this.aiAssistant.getUserPlan(userId);
            const usage = await this.aiAssistant.getUserUsage(userId);

            const planDetails = {
                starter: { name: 'Starter', commands: 50, bots: 3, color: 0x999999 },
                premium: { name: 'Premium', commands: 100, bots: 5, color: 0x0099ff },
                pro: { name: 'Pro', commands: -1, bots: -1, color: 0x00ff00 }
            };

            const details = planDetails[userPlan.name];
            const commandsText = details.commands === -1 ? 'Unlimited' : `${usage}/${details.commands}`;
            const botsText = details.bots === -1 ? 'Unlimited' : details.bots.toString();

            await interaction.reply({
                embeds: [{
                    title: `📊 Your ${details.name} Plan`,
                    fields: [
                        { name: 'AI Commands Used', value: commandsText, inline: true },
                        { name: 'Bot Limit', value: botsText, inline: true },
                        { name: 'Plan Benefits', value: userPlan.name === 'pro' ? 'Advanced AI + Brainstorming' : 'Basic AI assistance', inline: false }
                    ],
                    color: details.color,
                    footer: { text: 'Usage resets monthly' }
                }],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error checking plan:', error);
            await interaction.reply({ content: '❌ Failed to check plan details.', ephemeral: true });
        }
    }

    async handleAIOptimizeCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.optimizeCode(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Optimization Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '⚡ Code Optimization Results',
                    fields: [
                        { name: 'Improvements Found', value: result.optimization.improvements.join('\n') || 'None', inline: false },
                        { name: 'Performance Gain', value: result.optimization.metrics.performanceGain || 'N/A', inline: true },
                        { name: 'Memory Optimization', value: result.optimization.metrics.memoryReduction || 'N/A', inline: true }
                    ],
                    color: 0x00ff00,
                    footer: { text: 'AI-powered code optimization' }
                }]
            });

        } catch (error) {
            console.error('AI optimization error:', error);
            await interaction.editReply({ content: '❌ Failed to optimize code. Please try again later.' });
        }
    }

    async handleAISecurityCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.performSecurityAnalysis(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Security Analysis Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            const vulnCount = result.security.vulnerabilities.length;
            const securityScore = result.security.securityScore || 'N/A';

            await interaction.editReply({
                embeds: [{
                    title: '🔒 Security Analysis Results',
                    fields: [
                        { name: 'Security Score', value: `${securityScore}/100`, inline: true },
                        { name: 'Vulnerabilities Found', value: vulnCount.toString(), inline: true },
                        { name: 'Risk Level', value: vulnCount > 5 ? 'High' : vulnCount > 2 ? 'Medium' : 'Low', inline: true },
                        { name: 'Top Issues', value: result.security.vulnerabilities.slice(0, 3).join('\n') || 'None found', inline: false }
                    ],
                    color: vulnCount > 5 ? 0xff0000 : vulnCount > 2 ? 0xffa500 : 0x00ff00,
                    footer: { text: 'AI-powered security analysis' }
                }]
            });

        } catch (error) {
            console.error('AI security error:', error);
            await interaction.editReply({ content: '❌ Failed to analyze security. Please try again later.' });
        }
    }

    async handleAIPerformanceCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.analyzePerformance(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Performance Analysis Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '📊 Performance Analysis Results',
                    fields: [
                        { name: 'Performance Score', value: result.performance.metrics.score || 'N/A', inline: true },
                        { name: 'Execution Time', value: result.performance.metrics.executionTime || 'N/A', inline: true },
                        { name: 'Memory Usage', value: result.performance.metrics.memoryUsage || 'N/A', inline: true },
                        { name: 'Bottlenecks', value: result.performance.bottlenecks.join('\n') || 'None detected', inline: false }
                    ],
                    color: 0x0099ff,
                    footer: { text: 'AI-powered performance analysis' }
                }]
            });

        } catch (error) {
            console.error('AI performance error:', error);
            await interaction.editReply({ content: '❌ Failed to analyze performance. Please try again later.' });
        }
    }

    async handleAIReviewCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.performCodeReview(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Code Review Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '📝 Code Review Results',
                    fields: [
                        { name: 'Quality Score', value: `${result.review.qualityScore}/100`, inline: true },
                        { name: 'Maintainability', value: result.review.maintainability, inline: true },
                        { name: 'Style Issues', value: result.review.styleIssues.length.toString(), inline: true },
                        { name: 'Key Suggestions', value: result.review.suggestions.slice(0, 3).join('\n') || 'Code looks good!', inline: false }
                    ],
                    color: 0x9966cc,
                    footer: { text: 'AI-powered code review' }
                }]
            });

        } catch (error) {
            console.error('AI review error:', error);
            await interaction.editReply({ content: '❌ Failed to review code. Please try again later.' });
        }
    }

    async handleAIDocsCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.generateDocumentation(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Documentation Generation Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '📚 Generated Documentation',
                    description: 'Documentation has been generated for your code',
                    fields: [
                        { name: 'API Documentation', value: result.documentation.apiDocs ? '✅ Generated' : '❌ Not available', inline: true },
                        { name: 'README', value: result.documentation.readme ? '✅ Generated' : '❌ Not available', inline: true },
                        { name: 'Code Comments', value: result.documentation.codeComments ? '✅ Generated' : '❌ Not available', inline: true }
                    ],
                    color: 0x00ccaa,
                    footer: { text: 'AI-generated documentation' }
                }]
            });

        } catch (error) {
            console.error('AI docs error:', error);
            await interaction.editReply({ content: '❌ Failed to generate documentation. Please try again later.' });
        }
    }

    async handleAITestsCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.generateTests(userId, code, language);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Test Generation Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '🧪 Generated Tests',
                    description: 'Tests have been generated for your code',
                    fields: [
                        { name: 'Unit Tests', value: result.tests.unitTests ? '✅ Generated' : '❌ Not available', inline: true },
                        { name: 'Integration Tests', value: result.tests.integrationTests ? '✅ Generated' : '❌ Requires Premium+', inline: true },
                        { name: 'Coverage', value: result.tests.coverage || 'N/A', inline: true }
                    ],
                    color: 0x66cc99,
                    footer: { text: 'AI-generated tests' }
                }]
            });

        } catch (error) {
            console.error('AI tests error:', error);
            await interaction.editReply({ content: '❌ Failed to generate tests. Please try again later.' });
        }
    }

    async handleAITranslateCommand(interaction) {
        const userId = interaction.user.id;
        const code = interaction.options.getString('code');
        const fromLanguage = interaction.options.getString('from');
        const toLanguage = interaction.options.getString('to');

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.translateCode(userId, code, fromLanguage, toLanguage);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Code Translation Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '🔄 Code Translation Complete',
                    description: `Successfully translated code from ${fromLanguage} to ${toLanguage}`,
                    fields: [
                        { name: 'Translation Status', value: '✅ Complete', inline: true },
                        { name: 'Compatibility Issues', value: result.translation.compatibilityIssues.length.toString(), inline: true },
                        { name: 'Migration Notes', value: result.translation.migrationNotes ? '📝 Available' : 'None', inline: true }
                    ],
                    color: 0x3399ff,
                    footer: { text: 'AI-powered code translation' }
                }]
            });

        } catch (error) {
            console.error('AI translation error:', error);
            await interaction.editReply({ content: '❌ Failed to translate code. Please try again later.' });
        }
    }

    async handleAIBrainstormCommand(interaction) {
        const userId = interaction.user.id;
        const topic = interaction.options.getString('topic');
        const domain = interaction.options.getString('domain') || 'general';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.performAIBrainstorming(userId, topic, domain);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Brainstorming Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '💡 AI Brainstorming Results',
                    description: `Brainstorming session for: **${topic}**`,
                    fields: [
                        { name: 'Ideas Generated', value: result.brainstorming.ideas.length.toString(), inline: true },
                        { name: 'Solutions Found', value: result.brainstorming.solutions.length.toString(), inline: true },
                        { name: 'Domain', value: domain.charAt(0).toUpperCase() + domain.slice(1), inline: true },
                        { name: 'Top Ideas', value: result.brainstorming.ideas.slice(0, 3).join('\n') || 'No ideas generated', inline: false }
                    ],
                    color: 0xff6600,
                    footer: { text: 'AI-powered brainstorming' }
                }]
            });

        } catch (error) {
            console.error('AI brainstorm error:', error);
            await interaction.editReply({ content: '❌ Failed to brainstorm. Please try again later.' });
        }
    }

    async handleAIAdvancedCommand(interaction) {
        const userId = interaction.user.id;
        const prompt = interaction.options.getString('prompt');
        const complexity = interaction.options.getString('complexity') || 'basic';
        const language = interaction.options.getString('language') || 'javascript';

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await this.aiAssistant.generateAdvancedCode(userId, prompt, language, complexity);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [{
                        title: '⛔ Advanced Generation Failed',
                        description: result.error,
                        color: 0xff0000
                    }]
                });
                return;
            }

            await interaction.editReply({
                embeds: [{
                    title: '🚀 Advanced Code Generated',
                    description: `Generated ${complexity} level code in ${language}`,
                    fields: [
                        { name: 'Files Generated', value: result.metadata.filesGenerated.toString(), inline: true },
                        { name: 'Lines of Code', value: result.metadata.linesGenerated.toString(), inline: true },
                        { name: 'Complexity Level', value: complexity.charAt(0).toUpperCase() + complexity.slice(1), inline: true },
                        { name: 'Features Included', value: result.metadata.features.join(', ') || 'Basic features', inline: false }
                    ],
                    color: 0x6600ff,
                    footer: { text: 'Advanced AI code generation' }
                }]
            });

        } catch (error) {
            console.error('AI advanced error:', error);
            await interaction.editReply({ content: '❌ Failed to generate advanced code. Please try again later.' });
        }
    }

    detectLanguage(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'ts': 'typescript',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'sql': 'sql'
        };
        return languageMap[ext] || 'text';
    }

    async handleHelpCommand(interaction) {
        const member = interaction.member;
        const adminRoleId = process.env.ADMIN_ROLE_ID;
        const isAdmin = member.roles.cache.has(adminRoleId);

        const helpEmbed = {
            title: '🤖 Smart Serve AI Bot - All Commands',
            description: 'Advanced AI-powered Discord bot with 100+ features:',
            color: 0x0099ff,
            fields: [
                {
                    name: '📋 Order Management',
                    value: '`/status <order_number>` - Check order status\n`/history` - View your order history\n`/cancel <order_number>` - Cancel pending order\n`/modify <order_number>` - Modify order content',
                    inline: false
                },
                {
                    name: '🤖 Basic AI Features',
                    value: '`/aicode <prompt>` - Generate Discord bot code\n`/aidebug <error>` - Debug your code with AI\n`/checkplan` - Check your plan and usage',
                    inline: false
                },
                {
                    name: '⚡ Advanced AI Features (Premium+)',
                    value: '`/aioptimize <code>` - Optimize code performance\n`/aisecurity <code>` - Security vulnerability analysis\n`/aiperformance <code>` - Performance analysis\n`/aireview <code>` - Comprehensive code review',
                    inline: false
                },
                {
                    name: '📚 AI Documentation & Testing',
                    value: '`/aidocs <code>` - Generate documentation\n`/aitests <code>` - Generate test suites\n`/aitranslate <code> <from> <to>` - Translate between languages',
                    inline: false
                },
                {
                    name: '💡 AI Innovation (Pro)',
                    value: '`/aibrainstorm <topic>` - AI brainstorming sessions\n`/aiadvanced <prompt>` - Advanced code generation\n`/upgrader <user> <plan>` - Upgrade user plan (Admin)',
                    inline: false
                },
                {
                    name: '💬 Communication',
                    value: '`/dm <users> <message>` - Send DM to specific users\n`/dmrole <role> <message>` - Send DM to all users with a role',
                    inline: false
                },
                {
                    name: '💻 Code Management',
                    value: '`/addcode <filename>` - Add code to environment\n`/viewcode` - View your code files\n`/deletecode <filename>` - Delete a code file\n`/managecode` - Manage user code (Admin)',
                    inline: false
                }
            ],
            footer: {
                text: 'Smart Serve AI | 100+ Features | Upgrade for advanced AI capabilities'
            }
        };

        if (isAdmin) {
            helpEmbed.fields.push({
                name: '🔧 Admin Commands',
                value: '`/addcode <filename> <user>` - Add code to user\'s environment\n`/managecode list <user>` - List user\'s code files\n`/managecode delete <user> <filename>` - Delete user\'s code file',
                inline: false
            });
        }

        helpEmbed.fields.push({
            name: '❓ General',
            value: '`/help` - Show this help message',
            inline: false
        });

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    getStatusColor(status) {
        switch (status) {
            case '✅ Completed': return 0x00FF00;
            case '⏳ In Progress': return 0xFFFF00;
            case '❌ Cancelled': return 0xFF0000;
            case '❌ Rejected': return 0xFF0000;
            default: return 0x0099FF;
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case '✅ Completed': return '✅';
            case '⏳ In Progress': return '⏳';
            case '❌ Cancelled': return '❌';
            case '❌ Rejected': return '❌';
            default: return '📋';
        }
    }

    async sendDM(userId, messageContent) {
        try {
            const user = await this.client.users.fetch(userId);
            await user.send(messageContent);
            return true;
        } catch (error) {
            console.error('Error sending DM:', error);
            return false;
        }
    }

    // Send order confirmation to user
    async sendOrderDM(userId, orderInfo) {
        try {
            const user = await this.client.users.fetch(userId);
            await user.send(`🤖 **Bot Feature Request**\n\nYou requested a bot with the following features:\n\n**${orderInfo.content}**\n\nDo you want to proceed with this order? Reply with "yes" to confirm or "no" to cancel.`);
            return true;
        } catch (error) {
            console.error('Error sending DM:', error);
            return false;
        }
    }

    async handleDMResponse(message) {
        const userId = message.author.id;
        const content = message.content.toLowerCase();

        // Handle code uploads from DM
        if (message.channel.type === 1 && this.pendingCodeUploads.has(message.author.id)) {
            const uploadInfo = this.pendingCodeUploads.get(message.author.id);

            // Check if upload is still valid (within 10 minutes)
            if (Date.now() - uploadInfo.timestamp > 10 * 60 * 1000) {
                this.pendingCodeUploads.delete(message.author.id);
                await message.reply('⏰ Code upload session expired. Please use the `/addcode` command again.');
                return;
            }

            const code = message.content.trim();

            if (code.length === 0) {
                await message.reply('❌ Please provide the code content.');
                return;
            }

            // Determine target user (admin upload vs self upload)
            const targetUserId = uploadInfo.isAdminUpload ? uploadInfo.targetUserId : message.author.id;

            // Store the code for the target user
            if (!this.userCode.has(targetUserId)) {
                this.userCode.set(targetUserId, new Map());
            }

            const userCodeMap = this.userCode.get(targetUserId);
            const fileKey = `${uploadInfo.filename}_${Date.now()}`;

            userCodeMap.set(fileKey, {
                filename: uploadInfo.filename,
                content: code,
                lastModified: Date.now(),
                language: this.detectLanguage(uploadInfo.filename),
                orderNumber: uploadInfo.orderNumber || null,
                uploadedBy: message.author.id,
                isAdminUpload: uploadInfo.isAdminUpload || false
            });

            this.pendingCodeUploads.delete(message.author.id);

            if (uploadInfo.isAdminUpload) {
                await message.reply({
                    embeds: [{
                        title: '✅ Admin Code Upload Successful',
                        description: `Code for **${uploadInfo.filename}** has been added to **${uploadInfo.targetUsername}**'s coding environment.`,
                        color: 0x00ff00,
                        fields: [
                            {
                                name: 'File Name',
                                value: uploadInfo.filename,
                                inline: true
                            },
                            {
                                name: 'Target User',
                                value: uploadInfo.targetUsername,
                                inline: true
                            },
                            {
                                name: 'Lines of Code',
                                value: code.split('\n').length.toString(),
                                inline: true
                            },
                            {
                                name: 'Order Number',
                                value: uploadInfo.orderNumber || 'Not specified',
                                inline: true
                            }
                        ],
                        footer: {
                            text: 'The user can now view and edit this code in their environment'
                        }
                    }]
                });

                // Notify the target user if they're in the server
                try {
                    const targetUser = await this.client.users.fetch(targetUserId);
                    const targetDM = await targetUser.createDM();

                    await targetDM.send({
                        embeds: [{
                            title: '📁 New Code File Added',
                            description: `An administrator has added a new code file to your coding environment.`,
                            color: 0x0099ff,
                            fields: [
                                {
                                    name: 'File Name',
                                    value: uploadInfo.filename,
                                    inline: true
                                },
                                {
                                    name: 'Order Number',
                                    value: uploadInfo.orderNumber || 'Not specified',
                                    inline: true
                                }
                            ],
                            footer: {
                                text: 'Visit your coding environment to view the code'
                            }
                        }]
                    });
                } catch (error) {
                    console.log('Could not notify target user:', error.message);
                }
            } else {
                await message.reply({
                    embeds: [{
                        title: '✅ Code Uploaded Successfully',
                        description: `Your code for **${uploadInfo.filename}** has been saved to your coding environment.`,
                        color: 0x00ff00,
                        fields: [
                            {
                                name: 'File Name',
                                value: uploadInfo.filename,
                                inline: true
                            },
                            {
                                name: 'Lines of Code',
                                value: code.split('\n').length.toString(),
                                inline: true
                            },
                            {
                                name: 'Order Number',
                                value: uploadInfo.orderNumber || 'Not specified',
                                inline: true
                            }
                        ],
                        footer: {
                            text: 'Visit your coding environment to view and edit the code'
                        }
                    }]
                });
            }
        }

        // Check if user is modifying an order
        if (this.awaitingModification.has(userId)) {
            const orderData = this.awaitingModification.get(userId);
            this.awaitingModification.delete(userId);

            // Update order content
            orderData.content = message.content;

            // If it's a pending order, update it
            if (this.pendingOrders.has(userId)) {
                this.pendingOrders.set(userId, orderData);
            }

            // If it's an active order, update it
            if (this.activeOrders.has(orderData.orderId)) {
                this.activeOrders.set(orderData.orderId, orderData);
            }

            await message.reply('✅ Order modified successfully! Your updated content: ' + message.content);
            return;
        }

        // Check if user is responding to bot feature confirmation
        if (this.pendingOrders.has(userId)) {
            const orderData = this.pendingOrders.get(userId);

            if (content.includes('yes') || content === 'y') {
                this.pendingOrders.delete(userId);

                await message.reply('✅ Order confirmed! An admin will message you about the timeline for making your bot.');

                // Add to order history
                this.addToOrderHistory(userId, orderData, '⏳ Pending Admin Response');

                // Send order to admin channel
                await this.sendOrderToAdminChannel(orderData);
            } else if (content.includes('no') || content === 'n') {
                this.pendingOrders.delete(userId);

                // Add to order history as cancelled
                this.addToOrderHistory(userId, orderData, '❌ Cancelled');

                await message.reply('❌ Order cancelled. Feel free to place a new order anytime!');
            }
            return;
        }

        // Check if admin is providing timeline
        if (this.awaitingTimeline.has(userId)) {
            const orderData = this.awaitingTimeline.get(userId);
            this.awaitingTimeline.delete(userId);

            // Parse deadline from timeline (look for numbers followed by time units)
            const timelineText = message.content;
            const deadlineMs = this.parseDeadline(timelineText);

            if (deadlineMs > 0) {
                const deadline = Date.now() + deadlineMs;
                this.orderDeadlines.set(orderData.orderId, {
                    ...orderData,
                    deadline: deadline,
                    adminId: userId,
                    reminderSent: false
                });

                // Update order history
                const userHistory = this.orderHistory.get(orderData.userId) || [];
                const historyOrder = userHistory.find(o => o.orderId === orderData.orderId);
                if (historyOrder) {
                    historyOrder.status = '⏳ In Progress';
                    historyOrder.deadline = deadline;
                    historyOrder.adminId = userId;
                }
            }

            // Send timeline to the original requester
            try {
                const requesterUser = await this.client.users.fetch(orderData.userId);
                await requesterUser.send(`⏰ **Timeline Update for Your Bot Order**\n\nThe admin has provided the following timeline:\n**${message.content}**\n\nPlease DM <@${userId}> to discuss the details and connect with the website data.`);

                await message.reply(`✅ Timeline sent to <@${orderData.userId}>. They have been instructed to DM you for further details.`);
            } catch (error) {
                await message.reply('❌ Failed to send timeline to user. They may have DMs disabled.');
            }
        }
    }

    parseDeadline(timelineText) {
        const text = timelineText.toLowerCase();
        let totalMs = 0;

        // Look for patterns like "2 days", "1 week", "3 hours"
        const patterns = [
            { regex: /(\d+)\s*days?/g, multiplier: 24 * 60 * 60 * 1000 },
            { regex: /(\d+)\s*weeks?/g, multiplier: 7 * 24 * 60 * 60 * 1000 },
            { regex: /(\d+)\s*hours?/g, multiplier: 60 * 60 * 1000 },
            { regex: /(\d+)\s*minutes?/g, multiplier: 60 * 1000 }
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(text)) !== null) {
                totalMs += parseInt(match[1]) * pattern.multiplier;
            }
        });

        return totalMs;
    }

    addToOrderHistory(userId, orderData, status) {
        if (!this.orderHistory.has(userId)) {
            this.orderHistory.set(userId, []);
        }

        const userHistory = this.orderHistory.get(userId);
        userHistory.push({
            ...orderData,
            status: status,
            createdAt: Date.now()
        });
    }

    async handleButtonInteraction(interaction) {
        const [action, orderId] = interaction.customId.split('_');
        const orderData = this.activeOrders.get(orderId);

        if (!orderData) {
            await interaction.reply({ content: '❌ This order is no longer available.', ephemeral: true });
            return;
        }

        // Disable all buttons
        const disabledRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_disabled')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('reject_disabled')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );

        if (action === 'accept') {
            // Update the embed to show acceptance
            const acceptedEmbed = new EmbedBuilder()
                .setTitle(`Order ${orderData.orderNumber} - ACCEPTED`)
                .setDescription(orderData.content)
                .addFields(
                    { name: 'Requested by', value: `<@${orderData.userId}>`, inline: true },
                    { name: 'Accepted by', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Status', value: '✅ Accepted', inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await interaction.update({ embeds: [acceptedEmbed], components: [disabledRow] });

            // Update order history
            const userHistory = this.orderHistory.get(orderData.userId) || [];
            const historyOrder = userHistory.find(o => o.orderId === orderData.orderId);
            if (historyOrder) {
                historyOrder.status = '✅ Accepted';
                historyOrder.adminId = interaction.user.id;
            }

            // DM the admin who accepted
            try {
                await interaction.user.send(`✅ **Order ${orderData.orderNumber} Accepted**\n\nBot Content: ${orderData.content}\n\nRequested by: <@${orderData.userId}>\n\nPlease provide a timeline for creating this bot (e.g., "2-3 days", "1 week", etc.):`);
                this.awaitingTimeline.set(interaction.user.id, orderData);
            } catch (error) {
                await interaction.followUp({ content: '❌ Could not send DM. Please enable DMs from server members.', ephemeral: true });
            }

        } else if (action === 'reject') {
            // Update the embed to show rejection
            const rejectedEmbed = new EmbedBuilder()
                .setTitle(`Order ${orderData.orderNumber} - REJECTED`)
                .setDescription(orderData.content)
                .addFields(
                    { name: 'Requested by', value: `<@${orderData.userId}>`, inline: true },
                    { name: 'Rejected by', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Status', value: '❌ Rejected', inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.update({ embeds: [rejectedEmbed], components: [disabledRow] });

            // Update order history
            const userHistory = this.orderHistory.get(orderData.userId) || [];
            const historyOrder = userHistory.find(o => o.orderId === orderData.orderId);
            if (historyOrder) {
                historyOrder.status = '❌ Rejected';
                historyOrder.adminId = interaction.user.id;
            }

            // DM the user who requested
            try {
                const requesterUser = await this.client.users.fetch(orderData.userId);
                await requesterUser.send(`❌ **Order ${orderData.orderNumber} Rejected**\n\nUnfortunately, your bot request has been rejected. You can place a new order with different requirements anytime!`);
            } catch (error) {
                console.error('Failed to send rejection DM:', error);
            }
        }

        // Remove from active orders
        this.activeOrders.delete(orderId);
    }

    async sendOrderToAdminChannel(orderData) {
        const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID || 'YOUR_ADMIN_CHANNEL_ID';
        const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'YOUR_ADMIN_ROLE_ID';

        try {
            const adminChannel = await this.client.channels.fetch(ADMIN_CHANNEL_ID);

            const orderEmbed = new EmbedBuilder()
                .setTitle(`Order ${orderData.orderNumber}`)
                .setDescription(orderData.content)
                .addFields(
                    { name: 'Requested by', value: `<@${orderData.userId}>`, inline: true },
                    { name: 'Order ID', value: orderData.orderId, inline: true },
                    { name: 'Status', value: '⏳ Pending', inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp();

            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`accept_${orderData.orderId}`)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`reject_${orderData.orderId}`)
                        .setLabel('Reject')
                        .setStyle(ButtonStyle.Danger)
                );

            await adminChannel.send({
                content: `<@&${ADMIN_ROLE_ID}> New bot order received!`,
                embeds: [orderEmbed],
                components: [actionRow]
            });

            // Store the order for button interactions
            this.activeOrders.set(orderData.orderId, orderData);

        } catch (error) {
            console.error('Failed to send order to admin channel:', error);
        }
    }

    async processOrder(userId, content) {
        try {
            // First, ping the user
            const user = await this.client.users.fetch(userId);
            await user.send(`🔔 **Ping!** <@${userId}>`);

            // Wait a moment, then send the feature explanation
            setTimeout(async () => {
                await user.send(`🤖 **Bot Feature Request**\n\nYou requested a bot with the following features:\n\n**${content}**\n\nDo you want to proceed with this order? Reply with "yes" to confirm or "no" to cancel.`);

                // Store the pending order
                this.orderCount++;
                const orderId = `order_${Date.now()}_${userId}`;
                const orderData = {
                    userId: userId,
                    content: content,
                    orderId: orderId,
                    orderNumber: this.orderCount
                };

                this.pendingOrders.set(userId, orderData);
            }, 2000);

        } catch (error) {
            console.error('Failed to send DM to user:', error);
            throw new Error('User has DMs disabled or cannot be reached.');
        }
    }

    async start() {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token || token === 'your_discord_bot_token_here' || token.includes('example')) {
            console.warn('⚠️  DISCORD_BOT_TOKEN not configured properly. Discord bot features will be disabled.');
            console.log('📝 Please set a valid Discord bot token in the .env file to enable Discord functionality.');
            this.isDisabled = true;
            return;
        }

        try {
            await this.client.login(token);
            console.log('✅ Discord bot started successfully!');
            this.isDisabled = false;
        } catch (error) {
            console.error('❌ Discord bot login failed:', error.message);
            console.log('📝 Please check your Discord bot token in the .env file.');
            console.log('🌐 Web server will continue running without Discord bot functionality.');
            this.isDisabled = true;
        }
    }

    // Add fallback methods for when Discord is disabled
    async processOrder(userId, content) {
        if (this.isDisabled) {
            return {
                success: false,
                error: 'Discord bot is not available. Please check configuration.'
            };
        }
        // Original processOrder logic here
        return { success: true };
    }

    async sendDM(userId, message) {
        if (this.isDisabled) {
            console.log('Discord DM not sent (bot disabled):', message);
            return { success: false, error: 'Discord bot unavailable' };
        }
        try {
            const user = await this.client.users.fetch(userId);
            await user.send(message);
            return { success: true };
        } catch (error) {
            console.error('Failed to send DM:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = OrderBot;