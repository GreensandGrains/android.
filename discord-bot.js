const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

class OrderBot {
    constructor() {
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
            title: '🤖 Bot Commands Help',
            description: 'Here are all available commands:',
            color: 0x0099ff,
            fields: [
                {
                    name: '📋 Order Management',
                    value: '`/status <order_number>` - Check order status\n`/history` - View your order history\n`/cancel <order_number>` - Cancel pending order\n`/modify <order_number>` - Modify order content',
                    inline: false
                },
                {
                    name: '💬 Communication',
                    value: '`/dm <users> <message>` - Send DM to specific users\n`/dmrole <role> <message>` - Send DM to all users with a role',
                    inline: false
                },
                {
                    name: '💻 Code Management',
                    value: '`/viewcode` - View your uploaded code files\n`/deletecode <filename>` - Delete a code file',
                    inline: false
                }
            ],
            footer: {
                text: 'Smart Serve Bot | Use commands responsibly'
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
        if (!token) {
            console.error('DISCORD_BOT_TOKEN not found in environment variables');
            return;
        }

        await this.client.login(token);
    }
}

module.exports = OrderBot;
