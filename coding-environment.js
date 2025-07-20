// Check if user is admin (you can modify this logic based on your authentication)
function checkAdminStatus() {
    // This is a placeholder - integrate with your actual admin check
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        document.getElementById('adminControls').style.display = 'block';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();

    // Get template/bot type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const templateType = urlParams.get('template');
    const botType = urlParams.get('bot');

    if (templateType) {
        document.title = `${templateType} Template - Smart Serve`;
    } else if (botType) {
        document.title = `${botType} Bot - Smart Serve`;
    }

    // Initialize terminal cursor blinking
    initializeTerminal();

    // Load user code from Discord bot
    loadUserCodeFromDiscord();
});

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('filesSidebar');
    sidebar.classList.toggle('active');
}

// Tab functionality
document.addEventListener('click', function(e) {
    // Handle tab clicks
    if (e.target.closest('.tab')) {
        const tab = e.target.closest('.tab');
        const fileName = tab.getAttribute('data-file');

        // Don't close if clicking the close button
        if (e.target.classList.contains('tab-close')) {
            e.stopPropagation();
            closeTab(fileName);
            return;
        }

        switchTab(fileName);
    }

    // Handle console tab clicks
    if (e.target.closest('.console-tab')) {
        const consoleTab = e.target.closest('.console-tab');
        const consoleType = consoleTab.getAttribute('data-console');
        switchConsoleTab(consoleType);
    }

    // Handle file item clicks
    if (e.target.closest('.file-item')) {
        const fileItem = e.target.closest('.file-item');
        const fileName = fileItem.querySelector('span').textContent;

        if (!fileItem.classList.contains('folder') && fileName !== 'New File') {
            openFile(fileName);
        }
    }
});

// Switch between tabs
function switchTab(fileName) {
    // Remove active class from all tabs and editor contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.editor-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding editor content
    const activeTab = document.querySelector(`.tab[data-file="${fileName}"]`);
    const activeContent = document.querySelector(`.editor-content[data-file="${fileName}"]`);

    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
    }
}

// Switch between console tabs
function switchConsoleTab(consoleType) {
    // Remove active class from all console tabs and panels
    document.querySelectorAll('.console-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.console-panel').forEach(panel => panel.classList.remove('active'));

    // Add active class to clicked console tab and corresponding panel
    const activeConsoleTab = document.querySelector(`.console-tab[data-console="${consoleType}"]`);
    const activeConsolePanel = document.querySelector(`.console-panel[data-console="${consoleType}"]`);

    if (activeConsoleTab && activeConsolePanel) {
        activeConsoleTab.classList.add('active');
        activeConsolePanel.classList.add('active');
    }
}

// Close tab
function closeTab(fileName) {
    const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
    const content = document.querySelector(`.editor-content[data-file="${fileName}"]`);

    if (tab && content) {
        const wasActive = tab.classList.contains('active');

        tab.remove();
        content.remove();

        // If this was the active tab, activate another tab
        if (wasActive) {
            const remainingTabs = document.querySelectorAll('.tab');
            if (remainingTabs.length > 0) {
                const newActiveFile = remainingTabs[0].getAttribute('data-file');
                switchTab(newActiveFile);
            }
        }
    }
}

// Create new tab
function createNewTab() {
    const fileName = prompt('Enter file name:');
    if (fileName && fileName.trim()) {
        createTab(fileName.trim());
    }
}

// Create tab
function createTab(fileName) {
    // Check if tab already exists
    if (document.querySelector(`.tab[data-file="${fileName}"]`)) {
        switchTab(fileName);
        return;
    }

    // Create new tab
    const tabsContainer = document.querySelector('.tabs-container');
    const newTabBtn = document.querySelector('.new-tab');

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-file', fileName);
    tab.innerHTML = `
        <span>${fileName}</span>
        <i class="fas fa-times tab-close"></i>
    `;

    tabsContainer.insertBefore(tab, newTabBtn);

    // Create corresponding editor content
    const editorContainer = document.querySelector('.editor-container');
    const editorContent = document.createElement('div');
    editorContent.className = 'editor-content';
    editorContent.setAttribute('data-file', fileName);
    editorContent.innerHTML = `
        <textarea class="code-editor" placeholder="// Add your code here..."></textarea>
    `;

    editorContainer.appendChild(editorContent);

    // Switch to new tab
    switchTab(fileName);
}

// Open file
function openFile(fileName) {
    createTab(fileName);
}

// Create new file
function createNewFile() {
    createNewTab();
}

// Clear console
function clearConsole() {
    const activePanel = document.querySelector('.console-panel.active');
    if (activePanel) {
        const consoleType = activePanel.getAttribute('data-console');

        if (consoleType === 'terminal') {
            document.getElementById('terminalOutput').innerHTML = `
                <div class="terminal-line">
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-cursor">|</span>
                </div>
            `;
        } else if (consoleType === 'output') {
            document.getElementById('outputContent').innerHTML = '<p>Code output will appear here...</p>';
        } else if (consoleType === 'problems') {
            document.getElementById('problemsContent').innerHTML = '<p>No problems detected.</p>';
        }
    }
}

// Run code
function runCode() {
    const activeEditor = document.querySelector('.editor-content.active .code-editor');
    if (activeEditor) {
        const code = activeEditor.value;

        // Switch to output tab
        switchConsoleTab('output');

        // Simulate code execution (replace with actual execution logic)
        document.getElementById('outputContent').innerHTML = `
            <p>Running code...</p>
            <p>Output will appear here when code is executed.</p>
            <p>Code length: ${code.length} characters</p>
        `;
    }
}

// Initialize terminal
function initializeTerminal() {
    const terminalInput = document.querySelector('.terminal-input');

    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                executeTerminalCommand(command);
                this.value = '';
            }
        }
    });
}

// Execute terminal command
function executeTerminalCommand(command) {
    const terminalOutput = document.getElementById('terminalOutput');

    // Add command to output
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.innerHTML = `
        <span class="terminal-prompt">$</span>
        <span>${command}</span>
    `;

    terminalOutput.appendChild(commandLine);

    // Add response (simulate command execution)
    const responseLine = document.createElement('div');
    responseLine.className = 'terminal-line';

    if (command === 'clear') {
        clearConsole();
        return;
    } else if (command === 'ls') {
        responseLine.innerHTML = '<span>index.js  bot.js  package.json  README.md</span>';
    } else if (command.startsWith('npm')) {
        responseLine.innerHTML = '<span>npm command executed</span>';
    } else {
        responseLine.innerHTML = `<span>Command not found: ${command}</span>`;
    }

    terminalOutput.appendChild(responseLine);

    // Add cursor line
    const cursorLine = document.createElement('div');
    cursorLine.className = 'terminal-line';
    cursorLine.innerHTML = `
        <span class="terminal-prompt">$</span>
        <span class="terminal-cursor">|</span>
    `;

    terminalOutput.appendChild(cursorLine);

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Admin functions
function saveTemplate() {
    if (confirm('Save current template?')) {
        alert('Template saved successfully!');
    }
}

function deployBot() {
    if (confirm('Deploy bot to production?')) {
        alert('Bot deployment started!');
    }
}

function manageFiles() {
    alert('File management panel will open here.');
}

// Load template files based on template type
function loadTemplateFiles(templateName) {
    // Clear existing tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.remove());
    document.querySelectorAll('.editor-content').forEach(content => content.remove());

    const templateFiles = getTemplateFiles(templateName);
    
    // Create tabs for template files
    Object.entries(templateFiles).forEach(([filename, fileData]) => {
        createTabWithContent(filename, fileData.content, fileData.language);
    });

    // Update files sidebar
    updateFilesSidebar(Object.keys(templateFiles));
}

// Get template-specific files
function getTemplateFiles(templateName) {
    const templates = {
        'Moderation Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Auto-moderation settings
const moderationConfig = {
    autoDeleteSpam: true,
    maxMentions: 5,
    bannedWords: ['spam', 'scam'],
    warningThreshold: 3
};

// User warning system
const userWarnings = new Map();

client.on('ready', () => {
    console.log(\`🤖 \${client.user.tag} is now online and moderating!\`);
    client.user.setActivity('Moderating Server', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Auto-moderation checks
    await checkSpam(message);
    await checkBannedWords(message);
    await checkExcessiveMentions(message);
});

// Spam detection
async function checkSpam(message) {
    // Implementation for spam detection
    const userMessages = message.channel.messages.cache
        .filter(m => m.author.id === message.author.id && Date.now() - m.createdTimestamp < 5000)
        .size;

    if (userMessages > 5) {
        await message.delete();
        await warnUser(message.member, 'Spamming messages');
    }
}

// Check for banned words
async function checkBannedWords(message) {
    const containsBannedWord = moderationConfig.bannedWords.some(word => 
        message.content.toLowerCase().includes(word)
    );

    if (containsBannedWord) {
        await message.delete();
        await warnUser(message.member, 'Using banned words');
    }
}

// Check excessive mentions
async function checkExcessiveMentions(message) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentionCount > moderationConfig.maxMentions) {
        await message.delete();
        await warnUser(message.member, 'Excessive mentions');
    }
}

// Warning system
async function warnUser(member, reason) {
    const userId = member.id;
    const warnings = userWarnings.get(userId) || 0;
    userWarnings.set(userId, warnings + 1);

    const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('⚠️ Warning Issued')
        .setDescription(\`**User:** \${member}\n**Reason:** \${reason}\n**Warnings:** \${warnings + 1}/\${moderationConfig.warningThreshold}\`)
        .setTimestamp();

    // Send warning to moderation channel
    const modChannel = member.guild.channels.cache.find(ch => ch.name === 'mod-logs');
    if (modChannel) {
        await modChannel.send({ embeds: [embed] });
    }

    // Auto-punishment for reaching threshold
    if (warnings + 1 >= moderationConfig.warningThreshold) {
        await member.timeout(600000, \`Reached warning threshold: \${reason}\`); // 10 minute timeout
        userWarnings.delete(userId);
    }
}

// Slash commands for moderation
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction// This section should be part of the Discord bot template code, not the coding environmente });
    }
}

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "moderation-bot",
  "version": "1.0.0",
  "description": "Advanced Discord moderation bot with auto-moderation features",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["discord", "bot", "moderation", "auto-mod"],
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            },
            'commands.js': {
                content: `const { SlashCommandBuilder } = require('discord.js');

module.exports = [
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false)),
                
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false)),
                
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to clear')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
];`,
                language: 'javascript'
            },
            '.env': {
                content: `DISCORD_TOKEN=your_bot_token_here`,
                language: 'text'ired(false)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for muting')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from a channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
];`,
                language: 'javascript'
            },
            '.env': {
                content: `# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Optional: Guild ID for faster command registration
GUILD_ID=your_guild_id_here

# Moderation Settings
AUTO_MOD_ENABLED=true
MAX_WARNINGS=3
SPAM_THRESHOLD=5`,
                language: 'env'
            }
        },
        'Music Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Music queue system
const queue = new Map();

client.on('ready', () => {
    console.log(\`🎵 \${client.user.tag} is ready to play music!\`);
    client.user.setActivity('🎵 Music for everyone', { type: 'LISTENING' });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    switch (commandName) {
        case 'play':
            await handlePlay(interaction);
            break;
        case 'skip':
            await handleSkip(interaction);
            break;
        case 'stop':
            await handleStop(interaction);
            break;
        case 'queue':
            await handleQueue(interaction);
            break;
        case 'pause':
            await handlePause(interaction);
            break;
        case 'resume':
            await handleResume(interaction);
            break;
    }
});

async function handlePlay(interaction) {
    const song = options.getString('song');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('❌ You need to be in a voice channel to play music!');
    }

    await interaction.deferReply();

    try {
        const songInfo = await ytdl.getInfo(song);
        const songData = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            duration: songInfo.videoDetails.lengthSeconds,
            thumbnail: songInfo.videoDetails.thumbnails[0].url,
            requester: interaction.user
        };

        const serverQueue = queue.get(interaction.guild.id);

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: interaction.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                player: createAudioPlayer(),
                playing: true
            };

            queue.set(interaction.guild.id, queueConstruct);
            queueConstruct.songs.push(songData);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });

                queueConstruct.connection = connection;
                playSong(interaction.guild, queueConstruct.songs[0]);
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🎵 Now Playing')
                    .setDescription(\`**[\${songData.title}](\${songData.url})**\`)
                    .setThumbnail(songData.thumbnail)
                    .addFields({ name: 'Requested by', value: songData.requester.toString(), inline: true })
                    .setTimestamp();

                interaction.followUp({ embeds: [embed] });
            } catch (error) {
                queue.delete(interaction.guild.id);
                interaction.followUp('❌ There was an error connecting to the voice channel!');
            }
        } else {
            serverQueue.songs.push(songData);
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('🎵 Added to Queue')
                .setDescription(\`**[\${songData.title}](\${songData.url})**\`)
                .setThumbnail(songData.thumbnail)
                .addFields(
                    { name: 'Position in queue', value: serverQueue.songs.length.toString(), inline: true },
                    { name: 'Requested by', value: songData.requester.toString(), inline: true }
                )
                .setTimestamp();

            interaction.followUp({ embeds: [embed] });
        }
    } catch (error) {
        interaction.followUp('❌ There was an error playing that song!');
    }
}

function playSong(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
    const resource = createAudioResource(stream);
    
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0]);
    });
}

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "music-bot",
  "version": "1.0.0",
  "description": "Discord music bot with YouTube integration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "@discordjs/voice": "^0.16.1",
    "ytdl-core": "^4.11.5",
    "ffmpeg-static": "^5.2.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["discord", "bot", "music", "youtube"],
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            }
        },
        'AI Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Conversation context storage
const conversations = new Map();

client.on('ready', () => {
    console.log(\`🤖 \${client.user.tag} AI Assistant is online!\`);
    client.user.setActivity('Thinking...', { type: 'PLAYING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Respond to mentions or direct messages
    if (message.mentions.has(client.user) || message.channel.type === 'DM') {
        await handleAIResponse(message);
    }

    // Respond to specific triggers
    const triggers = ['hey ai', 'ask ai', 'ai help'];
    const content = message.content.toLowerCase();
    
    if (triggers.some(trigger => content.includes(trigger))) {
        await handleAIResponse(message);
    }
});

async function handleAIResponse(message) {
    const userId = message.author.id;
    const userMessage = message.content
        .replace(\`<@\${client.user.id}>\`, '')
        .replace(/hey ai|ask ai|ai help/gi, '')
        .trim();

    if (!userMessage) {
        return message.reply('👋 Hello! How can I help you today?');
    }

    // Show typing indicator
    await message.channel.sendTyping();

    try {
        // Get or create conversation context
        let conversation = conversations.get(userId) || [];
        
        // Add user message to conversation
        conversation.push({ role: 'user', content: userMessage });
        
        // Limit conversation history
        if (conversation.length > 10) {
            conversation = conversation.slice(-10);
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant in a Discord server. Be friendly, concise, and helpful. Keep responses under 2000 characters.'
                },
                ...conversation
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Add AI response to conversation
        conversation.push({ role: 'assistant', content: aiResponse });
        conversations.set(userId, conversation);

        // Create embed response
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setAuthor({ 
                name: 'AI Assistant', 
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(aiResponse)
            .setFooter({ text: 'Powered by OpenAI GPT-3.5' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('AI Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('❌ AI Error')
            .setDescription('Sorry, I encountered an error processing your request. Please try again later.')
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

// Slash commands for AI
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    switch (commandName) {
        case 'ask':
            await handleAskCommand(interaction);
            break;
        case 'clear':
            await handleClearCommand(interaction);
            break;
        case 'imagine':
            await handleImageCommand(interaction);
            break;
    }
});

async function handleAskCommand(interaction) {
    const question = options.getString('question');
    const userId = interaction.user.id;

    await interaction.deferReply();

    try {
        let conversation = conversations.get(userId) || [];
        conversation.push({ role: 'user', content: question });

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Be concise and helpful.'
                },
                ...conversation
            ],
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;
        conversation.push({ role: 'assistant', content: response });
        conversations.set(userId, conversation);

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🤖 AI Response')
            .setDescription(response)
            .setFooter({ text: \`Asked by \${interaction.user.tag}\` })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });

    } catch (error) {
        await interaction.followUp('❌ Error processing your question!');
    }
}

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "ai-bot",
  "version": "1.0.0",
  "description": "AI-powered Discord bot with OpenAI integration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "openai": "^4.20.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["discord", "bot", "ai", "openai", "gpt"],
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            }
        },
        // Add more templates...
        'Management Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(\`⚙️ \${client.user.tag} Management Bot is online!\`);
    client.user.setActivity('Managing Server', { type: 'WATCHING' });
});

// Auto role assignment for new members
client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeRole = member.guild.roles.cache.find(role => role.name === 'Member');
        if (welcomeRole) {
            await member.roles.add(welcomeRole);
        }

        const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
        if (welcomeChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('👋 Welcome!')
                .setDescription(\`Welcome to the server, \${member}!\`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            welcomeChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error welcoming new member:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "management-bot",
  "version": "1.0.0",
  "description": "Server management and administration bot",
  "main": "index.js",
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  },
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            }
        },
        'Economy Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// In-memory economy data (use database in production)
const economy = new Map();

client.on('ready', () => {
    console.log(\`💰 \${client.user.tag} Economy Bot is online!\`);
    client.user.setActivity('Managing Economy', { type: 'WATCHING' });
});

function getBalance(userId) {
    return economy.get(userId) || { coins: 1000, bank: 0 };
}

function setBalance(userId, data) {
    economy.set(userId, data);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    switch (commandName) {
        case 'balance':
            await handleBalance(interaction);
            break;
        case 'daily':
            await handleDaily(interaction);
            break;
        case 'work':
            await handleWork(interaction);
            break;
        case 'shop':
            await handleShop(interaction);
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "economy-bot",
  "version": "1.0.0",
  "description": "Virtual economy Discord bot with currency system",
  "main": "index.js",
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  },
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            }
        },
        'Gaming Bot': {
            'index.js': {
                content: `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(\`🎮 \${client.user.tag} Gaming Bot is online!\`);
    client.user.setActivity('Gaming Community', { type: 'WATCHING' });
});

// Gaming features implementation
const tournaments = new Map();
const teams = new Map();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'tournament':
            await handleTournament(interaction);
            break;
        case 'team':
            await handleTeam(interaction);
            break;
        case 'stats':
            await handleStats(interaction);
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);`,
                language: 'javascript'
            },
            'package.json': {
                content: `{
  "name": "gaming-bot",
  "version": "1.0.0",
  "description": "Gaming community Discord bot with tournaments and team management",
  "main": "index.js",
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  },
  "author": "Smart Serve",
  "license": "MIT"
}`,
                language: 'json'
            }
        }
    };

    return templates[templateName] || {
        'index.js': {
            content: '// Template files will be loaded here',
            language: 'javascript'
        }
    };
}

// Load user code from Discord bot or templates
async function loadUserCodeFromDiscord() {
    const urlParams = new URLSearchParams(window.location.search);
    const templateName = urlParams.get('template');
    
    if (templateName) {
        // Load template files
        loadTemplateFiles(templateName);
        
        // Update page title
        document.title = `${templateName} - Coding Environment`;
        
        return;
    }

    // Original Discord code loading logic
    try {
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) {
            console.log('No session token found');
            return;
        }

        const response = await fetch('/api/user/code', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (response.ok) {
            const userCode = await response.json();

            // Clear default tabs first
            document.querySelectorAll('.tab').forEach(tab => tab.remove());
            document.querySelectorAll('.editor-content').forEach(content => content.remove());

            // Add user's code files as tabs
            for (const [filename, fileData] of Object.entries(userCode)) {
                createTabWithContent(filename, fileData.content, fileData.language);
            }

            // If no files, create a default tab
            if (Object.keys(userCode).length === 0) {
                createTabWithContent('main.js', '// Welcome to your coding environment!\n// Use Discord commands to add your code files here.\n// Commands: /addcode <filename>, /viewcode, /deletecode <filename>', 'javascript');
            }

            // Update files sidebar
            updateFilesSidebar(Object.keys(userCode));

            console.log('Loaded Discord code files:', Object.keys(userCode));
        }
    } catch (error) {
        console.error('Error loading Discord code:', error);
        // Create default tab if error
        createTabWithContent('main.js', '// Welcome to your coding environment!\n// Use Discord commands to add your code files here.\n// Commands: /addcode <filename>, /viewcode, /deletecode <filename>', 'javascript');
    }
}

// Create tab with content
function createTabWithContent(fileName, content, language = 'javascript') {
    // Check if tab already exists
    if (document.querySelector(`.tab[data-file="${fileName}"]`)) {
        const existingEditor = document.querySelector(`.editor-content[data-file="${fileName}"] .code-editor`);
        if (existingEditor) {
            existingEditor.value = content;
        }
        switchTab(fileName);
        return;
    }

    // Create new tab
    const tabsContainer = document.querySelector('.tabs-container');
    const newTabBtn = document.querySelector('.new-tab');

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-file', fileName);
    tab.innerHTML = `
        <span>${fileName}</span>
        <i class="fas fa-times tab-close"></i>
    `;

    tabsContainer.insertBefore(tab, newTabBtn);

    // Create corresponding editor content
    const editorContainer = document.querySelector('.editor-container');
    const editorContent = document.createElement('div');
    editorContent.className = 'editor-content';
    editorContent.setAttribute('data-file', fileName);
    editorContent.innerHTML = `
        <textarea class="code-editor" placeholder="// Add your ${language} code here...">${content}</textarea>
    `;

    editorContainer.appendChild(editorContent);

    // Switch to new tab
    switchTab(fileName);
}

// Update files sidebar with Discord files
function updateFilesSidebar(filenames) {
    const filesTree = document.querySelector('.files-tree');

    // Keep the "New File" button
    const newFileBtn = document.querySelector('.file-item[onclick="createNewFile()"]');

    // Clear existing files except new file button
    const existingFiles = document.querySelectorAll('.file-item:not([onclick="createNewFile()"])');
    existingFiles.forEach(file => file.remove());

    // Add Discord files
    filenames.forEach(filename => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <i class="fas fa-file-code"></i>
            <span>${filename}</span>
        `;
        fileItem.addEventListener('click', () => openFile(filename));
        filesTree.appendChild(fileItem);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveTemplate();
    }

    // Ctrl+` to toggle terminal
    if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        switchConsoleTab('terminal');
    }

    // Ctrl+Shift+P to toggle problems
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        switchConsoleTab('problems');
    }

    // Ctrl+R to refresh Discord code
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        loadUserCodeFromDiscord();
    }
});

// Load user code files
async function loadUserCode(orderNumber = null) {
    try {
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) {
            console.log('No session token found');
            return;
        }

        let url = '/api/user/code';
        if (orderNumber) {
            url = `/api/order/${orderNumber}/code`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (response.ok) {
            const codeFiles = await response.json();

            // Clear existing tabs except the first one
            const tabsContainer = document.querySelector('.editor-tabs');
            const firstTab = tabsContainer.querySelector('.tab');
            const otherTabs = tabsContainer.querySelectorAll('.tab:not(:first-child)');
            otherTabs.forEach(tab => tab.remove());

            // Add tabs for each code file
            Object.keys(codeFiles).forEach(filename => {
                if (filename !== 'main.js') { // Don't duplicate if main.js already exists
                    addCodeTab(filename, codeFiles[filename].content);
                }
            });

            // Update page title if order number is specified
            if (orderNumber) {
                const pageTitle = document.querySelector('.environment-header h1');
                if (pageTitle) {
                    pageTitle.textContent = `Order #${orderNumber} - Coding Environment`;
                }
            }

            console.log('User code loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load user code:', error);
    }
}

// Check URL parameters for order number
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');

    if (orderNumber) {
        loadUserCode(orderNumber);
    } else {
        loadUserCode();
    }
}

// Initialize the coding environment
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();

    // Initialize editor
    initializeEditor();

    // Check URL parameters and load appropriate code
    checkURLParameters();

    // Set up event listeners
    setupEventListeners();
});

// Initialize coding environment
function initializeCodingEnvironment() {
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get('template');
    const orderNumber = params.get('order');

    if (templateName) {
        document.title = `${templateName} - Coding Environment`;

        // Update header
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            headerTitle.textContent = templateName;
        }
    }

    // Load user's code files
    loadUserCodeFiles(orderNumber);

    // Initialize admin controls
    initializeAdminControls();

    // Check if user is admin and show appropriate UI
    checkAdminStatus();
}

// Add missing functions
function checkAuth() {
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (!sessionToken) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function initializeEditor() {
    console.log('Editor initialized');
}

function setupEventListeners() {
    console.log('Event listeners set up');
}