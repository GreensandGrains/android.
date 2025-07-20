
// Global variables
let currentFile = 'index.js';
let openFiles = new Map();
let fileContents = new Map();
let syntaxHighlighter = null;
let autocompleteEnabled = true;
let isDarkTheme = true;

// JavaScript keywords and functions for autocomplete
const jsKeywords = [
    'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 
    'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 
    'throw', 'new', 'class', 'extends', 'import', 'export', 'default', 'typeof',
    'instanceof', 'in', 'of', 'this', 'super', 'static', 'get', 'set'
];

const jsFunctions = [
    'console.log()', 'console.error()', 'console.warn()', 'console.info()',
    'setTimeout()', 'setInterval()', 'clearTimeout()', 'clearInterval()',
    'parseInt()', 'parseFloat()', 'isNaN()', 'isFinite()',
    'JSON.stringify()', 'JSON.parse()', 'Object.keys()', 'Object.values()',
    'Array.isArray()', 'Array.from()', 'Array.of()',
    'Math.random()', 'Math.floor()', 'Math.ceil()', 'Math.round()',
    'Date.now()', 'new Date()', 'Promise.resolve()', 'Promise.reject()'
];

const discordJSFunctions = [
    'client.login()', 'client.on()', 'client.once()', 'client.emit()',
    'message.reply()', 'message.channel.send()', 'message.delete()',
    'interaction.reply()', 'interaction.followUp()', 'interaction.deferReply()',
    'guild.members.cache', 'guild.channels.cache', 'guild.roles.cache',
    'new EmbedBuilder()', 'new SlashCommandBuilder()', 'new ButtonBuilder()'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeIDE();
});

async function initializeIDE() {
    // Show loading screen
    showLoadingScreen();
    
    // Simulate loading delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Initialize components
    initializeFileSystem();
    initializeEditor();
    initializeTerminal();
    initializeResizeHandles();
    initializeKeyboardShortcuts();
    initializeContextMenu();
    
    // Load user authentication
    checkAuthentication();
    
    // Load user code from Discord or templates
    await loadUserCodeFromDiscord();
    
    console.log('🚀 Smart Serve IDE initialized successfully!');
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

function checkAuthentication() {
    const userData = localStorage.getItem('userData');
    const sessionToken = sessionStorage.getItem('sessionToken');
    
    if (userData && sessionToken) {
        try {
            const user = JSON.parse(userData);
            const userAvatarMini = document.getElementById('userAvatarMini');
            if (userAvatarMini) {
                userAvatarMini.src = user.avatar || `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// File System Management
function initializeFileSystem() {
    // Initialize default files
    fileContents.set('index.js', getDefaultFileContent('javascript'));
    fileContents.set('package.json', getDefaultFileContent('json'));
    fileContents.set('README.md', getDefaultFileContent('markdown'));
    
    // Open default file
    openFiles.set('index.js', { type: 'javascript', modified: false });
    
    // Set up file tree event listeners
    setupFileTreeEvents();
    
    console.log('📁 File system initialized');
}

function setupFileTreeEvents() {
    const fileTree = document.getElementById('fileTree');
    
    fileTree.addEventListener('click', function(e) {
        const treeItem = e.target.closest('.tree-item');
        if (!treeItem) return;
        
        if (treeItem.classList.contains('folder')) {
            toggleFolder(treeItem);
        } else if (treeItem.classList.contains('file')) {
            const fileName = treeItem.getAttribute('data-name');
            const fileType = treeItem.getAttribute('data-type');
            openFile(fileName, fileType);
        }
    });
}

function toggleFolder(folderElement) {
    const isExpanded = folderElement.classList.contains('expanded');
    
    if (isExpanded) {
        folderElement.classList.remove('expanded');
        folderElement.classList.add('collapsed');
    } else {
        folderElement.classList.remove('collapsed');
        folderElement.classList.add('expanded');
    }
}

function openFile(fileName, fileType = 'javascript') {
    // Add to open files if not already open
    if (!openFiles.has(fileName)) {
        openFiles.set(fileName, { type: fileType, modified: false });
        
        // Ensure file content exists
        if (!fileContents.has(fileName)) {
            fileContents.set(fileName, getDefaultFileContent(fileType));
        }
        
        createTab(fileName, fileType);
    }
    
    // Switch to this file
    switchToFile(fileName);
    
    // Update file tree selection
    updateFileTreeSelection(fileName);
}

function createTab(fileName, fileType) {
    const tabBar = document.getElementById('tabBar');
    const tabAdd = tabBar.querySelector('.tab-add');
    
    // Create new tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-file', fileName);
    tab.setAttribute('data-type', fileType);
    
    tab.innerHTML = `
        <div class="tab-content">
            <i class="${getFileIcon(fileType)} tab-icon"></i>
            <span class="tab-name">${fileName}</span>
            <button class="tab-close" onclick="closeTab('${fileName}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add click event
    tab.addEventListener('click', (e) => {
        if (!e.target.closest('.tab-close')) {
            switchToFile(fileName);
        }
    });
    
    // Insert before tab-add button
    tabBar.insertBefore(tab, tabAdd);
    
    // Create editor panel
    createEditorPanel(fileName, fileType);
}

function createEditorPanel(fileName, fileType) {
    const editorContainer = document.getElementById('editorContainer');
    
    const panel = document.createElement('div');
    panel.className = 'editor-panel';
    panel.setAttribute('data-file', fileName);
    
    const content = fileContents.get(fileName) || getDefaultFileContent(fileType);
    
    panel.innerHTML = `
        <div class="editor-header">
            <div class="editor-info">
                <span class="editor-file-name">${fileName}</span>
                <span class="editor-file-path">~/Discord Bot Project/${fileName}</span>
            </div>
            <div class="editor-actions">
                <button class="editor-btn" onclick="formatCode()" title="Format Code">
                    <i class="fas fa-code"></i>
                </button>
                <button class="editor-btn" onclick="copyCode()" title="Copy All">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
        <div class="editor-content">
            <div class="line-numbers" id="lineNumbers-${fileName}">
                <div class="line-number">1</div>
            </div>
            <textarea 
                class="code-editor" 
                id="editor-${fileName}"
                spellcheck="false"
                autocomplete="off"
                placeholder="// Start coding here..."
            >${content}</textarea>
            <div class="syntax-overlay" id="syntaxOverlay-${fileName}"></div>
        </div>
    `;
    
    editorContainer.appendChild(panel);
    
    // Initialize editor for this panel
    initializeEditorPanel(fileName, fileType);
}

function initializeEditorPanel(fileName, fileType) {
    const editor = document.getElementById(`editor-${fileName}`);
    const lineNumbers = document.getElementById(`lineNumbers-${fileName}`);
    const syntaxOverlay = document.getElementById(`syntaxOverlay-${fileName}`);
    
    // Update line numbers
    updateLineNumbers(editor, lineNumbers);
    
    // Apply syntax highlighting
    applySyntaxHighlighting(editor, syntaxOverlay, fileType);
    
    // Add event listeners
    editor.addEventListener('input', function(e) {
        updateLineNumbers(editor, lineNumbers);
        applySyntaxHighlighting(editor, syntaxOverlay, fileType);
        markFileModified(fileName);
        saveFileContent(fileName, editor.value);
        
        // Auto-completion
        if (autocompleteEnabled) {
            handleAutoComplete(e);
        }
    });
    
    editor.addEventListener('keydown', function(e) {
        handleEditorKeyDown(e, fileName);
    });
    
    editor.addEventListener('scroll', function() {
        // Sync scroll with syntax overlay and line numbers
        syntaxOverlay.scrollTop = editor.scrollTop;
        syntaxOverlay.scrollLeft = editor.scrollLeft;
        lineNumbers.scrollTop = editor.scrollTop;
    });
}

function switchToFile(fileName) {
    // Update current file
    currentFile = fileName;
    
    // Update tab states
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-file') === fileName) {
            tab.classList.add('active');
        }
    });
    
    // Update editor panel states
    document.querySelectorAll('.editor-panel').forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('data-file') === fileName) {
            panel.classList.add('active');
        }
    });
    
    // Focus the editor
    const editor = document.getElementById(`editor-${fileName}`);
    if (editor) {
        setTimeout(() => editor.focus(), 100);
    }
}

function closeTab(fileName) {
    // Don't close if it's the last tab
    if (openFiles.size <= 1) {
        showNotification('Cannot close the last tab', 'warning');
        return;
    }
    
    // Remove from open files
    openFiles.delete(fileName);
    
    // Remove tab
    const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
    if (tab) {
        tab.remove();
    }
    
    // Remove editor panel
    const panel = document.querySelector(`.editor-panel[data-file="${fileName}"]`);
    if (panel) {
        panel.remove();
    }
    
    // Switch to another open file
    if (currentFile === fileName) {
        const remainingFiles = Array.from(openFiles.keys());
        if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
        }
    }
}

// Editor Functionality
function initializeEditor() {
    // Initialize syntax highlighter
    initializeSyntaxHighlighter();
    
    console.log('✏️ Editor initialized');
}

function initializeSyntaxHighlighter() {
    // Custom syntax highlighting patterns
    const patterns = {
        javascript: [
            { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|class|extends|import|export|default|typeof|instanceof|in|of|this|super|static|get|set)\b/g, className: 'keyword' },
            { pattern: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g, className: 'string' },
            { pattern: /\/\/.*$/gm, className: 'comment' },
            { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment' },
            { pattern: /\b\d+\.?\d*\b/g, className: 'number' },
            { pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/g, className: 'function' },
            { pattern: /[+\-*/%=<>!&|^~?:]/g, className: 'operator' }
        ],
        json: [
            { pattern: /"([^"\\]|\\.)*"/g, className: 'string' },
            { pattern: /\b\d+\.?\d*\b/g, className: 'number' },
            { pattern: /\b(true|false|null)\b/g, className: 'keyword' }
        ],
        css: [
            { pattern: /\b[a-z-]+(?=\s*:)/gi, className: 'variable' },
            { pattern: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, className: 'string' },
            { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment' },
            { pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|fr)\b/g, className: 'number' }
        ]
    };
    
    syntaxHighlighter = { patterns };
}

function applySyntaxHighlighting(editor, overlay, fileType) {
    if (!syntaxHighlighter || !syntaxHighlighter.patterns[fileType]) {
        return;
    }
    
    let code = editor.value;
    const patterns = syntaxHighlighter.patterns[fileType];
    
    // Apply syntax highlighting
    patterns.forEach(({ pattern, className }) => {
        code = code.replace(pattern, `<span class="${className}">$&</span>`);
    });
    
    // Set the highlighted code
    overlay.innerHTML = code;
}

function updateLineNumbers(editor, lineNumbers) {
    const lines = editor.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => 
        `<div class="line-number">${index + 1}</div>`
    ).join('');
    
    lineNumbers.innerHTML = lineNumbersHtml;
}

function handleEditorKeyDown(e, fileName) {
    // Tab indentation
    if (e.key === 'Tab') {
        e.preventDefault();
        const editor = e.target;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        // Insert tab characters
        const tabChar = '    '; // 4 spaces
        editor.value = editor.value.substring(0, start) + tabChar + editor.value.substring(end);
        editor.setSelectionRange(start + tabChar.length, start + tabChar.length);
    }
    
    // Auto-close brackets and quotes
    const autoClosePairs = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'",
        '`': '`'
    };
    
    if (autoClosePairs[e.key]) {
        const editor = e.target;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        if (start === end) { // No selection
            e.preventDefault();
            const closeChar = autoClosePairs[e.key];
            editor.value = editor.value.substring(0, start) + e.key + closeChar + editor.value.substring(end);
            editor.setSelectionRange(start + 1, start + 1);
        }
    }
}

function handleAutoComplete(e) {
    const editor = e.target;
    const cursorPos = editor.selectionStart;
    const textBeforeCursor = editor.value.substring(0, cursorPos);
    const currentWord = textBeforeCursor.split(/\s/).pop();
    
    if (currentWord.length >= 2) {
        const suggestions = [...jsKeywords, ...jsFunctions, ...discordJSFunctions]
            .filter(item => item.toLowerCase().startsWith(currentWord.toLowerCase()))
            .slice(0, 10);
        
        if (suggestions.length > 0) {
            showAutocompleteSuggestions(suggestions, editor);
        } else {
            hideAutocompleteSuggestions();
        }
    } else {
        hideAutocompleteSuggestions();
    }
}

function showAutocompleteSuggestions(suggestions, editor) {
    let popup = document.getElementById('autocompletePopup');
    if (!popup) return;
    
    // Clear existing items
    popup.innerHTML = '';
    
    // Add suggestions
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.setAttribute('data-value', suggestion);
        item.innerHTML = `
            <i class="fas fa-code"></i>
            <span>${suggestion}</span>
        `;
        
        item.addEventListener('click', () => {
            insertAutocompleteSuggestion(suggestion, editor);
        });
        
        popup.appendChild(item);
    });
    
    // Position popup
    const rect = editor.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.top + 20}px`;
    popup.style.display = 'block';
}

function hideAutocompleteSuggestions() {
    const popup = document.getElementById('autocompletePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function insertAutocompleteSuggestion(suggestion, editor) {
    const cursorPos = editor.selectionStart;
    const textBeforeCursor = editor.value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words.pop();
    const textAfterCurrentWord = words.join(' ') + (words.length > 0 ? ' ' : '');
    
    const newText = textAfterCurrentWord + suggestion + editor.value.substring(cursorPos);
    editor.value = newText;
    editor.setSelectionRange(textAfterCurrentWord.length + suggestion.length, textAfterCurrentWord.length + suggestion.length);
    
    hideAutocompleteSuggestions();
    editor.focus();
}

// Terminal Functionality
function initializeTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    
    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                executeCommand(command);
                this.value = '';
            }
        }
    });
    
    // Add some welcome messages
    addTerminalOutput('Welcome to Smart Serve IDE Terminal!', 'info');
    addTerminalOutput('Type "help" for available commands', 'info');
    
    console.log('💻 Terminal initialized');
}

function executeCommand(command) {
    addTerminalOutput(`smartserve@discord-bot:~$ ${command}`, 'command');
    
    // Simple command processing
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd.toLowerCase()) {
        case 'help':
            showHelpCommands();
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'ls':
            listFiles();
            break;
        case 'pwd':
            addTerminalOutput('/home/smartserve/discord-bot', 'output');
            break;
        case 'whoami':
            addTerminalOutput('smartserve', 'output');
            break;
        case 'date':
            addTerminalOutput(new Date().toString(), 'output');
            break;
        case 'node':
            if (args[0]) {
                simulateNodeExecution(args[0]);
            } else {
                addTerminalOutput('Node.js REPL (simulated)', 'output');
            }
            break;
        case 'npm':
            handleNpmCommand(args);
            break;
        default:
            addTerminalOutput(`Command not found: ${cmd}`, 'error');
            addTerminalOutput('Type "help" for available commands', 'info');
    }
}

function addTerminalOutput(text, type = 'output') {
    const terminalOutput = document.getElementById('terminalOutput');
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    
    if (type === 'command') {
        line.innerHTML = `<span class="terminal-prefix">${text}</span>`;
    } else {
        line.textContent = text;
    }
    
    // Remove cursor from last line
    const existingCursor = terminalOutput.querySelector('.terminal-cursor');
    if (existingCursor) {
        existingCursor.remove();
    }
    
    terminalOutput.appendChild(line);
    
    // Add new cursor
    const cursorLine = document.createElement('div');
    cursorLine.className = 'terminal-line';
    cursorLine.innerHTML = `
        <span class="terminal-prefix">smartserve@discord-bot:~$</span>
        <span class="terminal-cursor">|</span>
    `;
    terminalOutput.appendChild(cursorLine);
    
    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function showHelpCommands() {
    const commands = [
        'Available commands:',
        '  help     - Show this help message',
        '  clear    - Clear terminal',
        '  ls       - List files',
        '  pwd      - Show current directory',
        '  whoami   - Show current user',
        '  date     - Show current date',
        '  node     - Run Node.js (simulated)',
        '  npm      - NPM commands (simulated)'
    ];
    
    commands.forEach(cmd => addTerminalOutput(cmd, 'info'));
}

function listFiles() {
    const files = Array.from(fileContents.keys());
    files.forEach(file => addTerminalOutput(file, 'output'));
}

function clearTerminal() {
    const terminalOutput = document.getElementById('terminalOutput');
    terminalOutput.innerHTML = `
        <div class="terminal-line">
            <span class="terminal-prefix">smartserve@discord-bot:~$</span>
            <span class="terminal-cursor">|</span>
        </div>
    `;
}

function simulateNodeExecution(filename) {
    addTerminalOutput(`Executing ${filename}...`, 'info');
    
    // Simulate execution delay
    setTimeout(() => {
        if (filename.includes('bot') || filename.includes('discord')) {
            addTerminalOutput('🤖 Discord bot started successfully!', 'success');
            addTerminalOutput('✅ Connected to Discord API', 'success');
            addTerminalOutput('📡 Bot is now online and ready!', 'success');
        } else {
            addTerminalOutput('✅ Program executed successfully', 'success');
        }
    }, 1000);
}

function handleNpmCommand(args) {
    const subCmd = args[0];
    
    switch (subCmd) {
        case 'install':
        case 'i':
            simulateNpmInstall(args.slice(1));
            break;
        case 'start':
            addTerminalOutput('Running npm start...', 'info');
            simulateNodeExecution('index.js');
            break;
        case 'run':
            const script = args[1];
            addTerminalOutput(`Running npm run ${script}...`, 'info');
            break;
        default:
            addTerminalOutput('npm help - show npm commands', 'info');
    }
}

function simulateNpmInstall(packages) {
    if (packages.length === 0) {
        addTerminalOutput('Installing dependencies...', 'info');
        packages = ['discord.js', 'dotenv'];
    } else {
        addTerminalOutput(`Installing ${packages.join(', ')}...`, 'info');
    }
    
    // Simulate install progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            addTerminalOutput('✅ Packages installed successfully!', 'success');
        }
    }, 500);
}

// Panel Management
function switchPanel(panelName) {
    // Update tab states
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-panel') === panelName) {
            tab.classList.add('active');
        }
    });
    
    // Update panel states
    document.querySelectorAll('.console-panel').forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('data-panel') === panelName) {
            panel.classList.add('active');
        }
    });
}

function togglePanel() {
    const bottomPanel = document.getElementById('bottomPanel');
    const toggleBtn = document.querySelector('.panel-actions .panel-btn i');
    
    if (bottomPanel.style.display === 'none') {
        bottomPanel.style.display = 'flex';
        toggleBtn.className = 'fas fa-chevron-down';
    } else {
        bottomPanel.style.display = 'none';
        toggleBtn.className = 'fas fa-chevron-up';
    }
}

function clearConsole() {
    const activePanel = document.querySelector('.console-panel.active');
    if (activePanel) {
        const panelType = activePanel.getAttribute('data-panel');
        
        switch (panelType) {
            case 'terminal':
                clearTerminal();
                break;
            case 'output':
                document.getElementById('outputContent').innerHTML = '';
                break;
            case 'problems':
                document.getElementById('problemsContent').innerHTML = '<div class="no-problems"><i class="fas fa-check-circle"></i><span>No problems detected</span></div>';
                break;
            case 'debug':
                document.getElementById('debugContent').innerHTML = '';
                break;
        }
    }
}

// Resize Handles
function initializeResizeHandles() {
    const leftHandle = document.getElementById('leftResizeHandle');
    const consoleHandle = document.getElementById('consoleResizeHandle');
    
    makeResizable(leftHandle, 'horizontal-left');
    makeResizable(consoleHandle, 'horizontal-bottom');
}

function makeResizable(handle, direction) {
    let isResizing = false;
    
    handle.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = direction.includes('horizontal') ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        if (direction === 'horizontal-left') {
            const newWidth = Math.max(200, Math.min(600, e.clientX));
            document.querySelector('.ide-container').style.gridTemplateColumns = `${newWidth}px 4px 1fr`;
        } else if (direction === 'horizontal-bottom') {
            const containerHeight = document.querySelector('.ide-container').clientHeight;
            const newHeight = Math.max(150, Math.min(500, containerHeight - e.clientY + 50));
            document.querySelector('.ide-container').style.gridTemplateRows = `1fr 4px ${newHeight}px`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
}

// Context Menu
function initializeContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.code-editor')) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('click', function() {
        hideContextMenu();
    });
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S: Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveAll();
        }
        
        // Ctrl/Cmd + N: New file
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewFile();
        }
        
        // Ctrl/Cmd + W: Close tab
        if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
            e.preventDefault();
            if (currentFile) {
                closeTab(currentFile);
            }
        }
        
        // Ctrl/Cmd + R: Run code
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            runCode();
        }
        
        // Ctrl/Cmd + `: Toggle terminal
        if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            switchPanel('terminal');
        }
        
        // F5: Run code
        if (e.key === 'F5') {
            e.preventDefault();
            runCode();
        }
        
        // Escape: Hide autocomplete
        if (e.key === 'Escape') {
            hideAutocompleteSuggestions();
            hideContextMenu();
        }
    });
}

// File operations
function createNewFile() {
    document.getElementById('fileModal').style.display = 'flex';
    document.getElementById('fileName').focus();
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
        // Add folder to file tree (implementation depends on your file tree structure)
        showNotification(`Folder "${folderName}" created`, 'success');
    }
}

function refreshFiles() {
    showNotification('Files refreshed', 'info');
    // Implement file refresh logic
}

function createFile() {
    const fileName = document.getElementById('fileName').value.trim();
    const fileType = document.getElementById('fileType').value;
    
    if (!fileName) {
        showNotification('Please enter a file name', 'error');
        return;
    }
    
    // Check if file already exists
    if (fileContents.has(fileName)) {
        showNotification('File already exists', 'warning');
        return;
    }
    
    // Create file
    fileContents.set(fileName, getDefaultFileContent(fileType));
    openFile(fileName, fileType);
    
    // Close modal
    closeModal('fileModal');
    
    // Add to file tree
    addFileToTree(fileName, fileType);
    
    showNotification(`File "${fileName}" created`, 'success');
}

function addFileToTree(fileName, fileType) {
    const fileTree = document.getElementById('fileTree');
    
    const treeItem = document.createElement('div');
    treeItem.className = 'tree-item file';
    treeItem.setAttribute('data-name', fileName);
    treeItem.setAttribute('data-type', fileType);
    
    treeItem.innerHTML = `
        <div class="tree-item-content">
            <i class="fas fa-chevron-right tree-arrow"></i>
            <i class="${getFileIcon(fileType)} file-icon"></i>
            <span class="file-name">${fileName}</span>
        </div>
    `;
    
    fileTree.appendChild(treeItem);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Clear form
    if (modalId === 'fileModal') {
        document.getElementById('fileName').value = '';
        document.getElementById('fileType').value = 'javascript';
    }
}

// Utility functions
function getFileIcon(fileType) {
    const iconMap = {
        javascript: 'fab fa-js-square js-icon',
        json: 'fas fa-file-code json-icon',
        css: 'fab fa-css3-alt css-icon',
        html: 'fab fa-html5 html-icon',
        markdown: 'fab fa-markdown md-icon',
        text: 'fas fa-file-alt'
    };
    
    return iconMap[fileType] || 'fas fa-file';
}

function getDefaultFileContent(fileType) {
    const templates = {
        javascript: `// Discord Bot - ${new Date().toLocaleDateString()}
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(\`🤖 \${client.user.tag} is online!\`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!hello') {
        message.reply('Hello! 👋');
    }
});

client.login(process.env.DISCORD_TOKEN);`,
        
        json: `{
  "name": "discord-bot",
  "version": "1.0.0",
  "description": "Smart Serve Discord Bot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  },
  "keywords": ["discord", "bot"],
  "author": "Smart Serve",
  "license": "MIT"
}`,
        
        css: `/* Smart Serve Bot Styles */
body {
    font-family: 'Inter', sans-serif;
    background: #0f0f0f;
    color: #ffffff;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.bot-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.bot-card:hover {
    border-color: #00d4ff;
    transform: translateY(-2px);
}`,
        
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Serve Bot Dashboard</title>
    <link href="style.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1>Smart Serve Bot Dashboard</h1>
            <p>Manage your Discord bot with ease</p>
        </header>
        
        <main>
            <div class="bot-card">
                <h2>Bot Status</h2>
                <div class="status online">
                    <span class="indicator"></span>
                    Online
                </div>
            </div>
        </main>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,
        
        markdown: `# Smart Serve Discord Bot

Welcome to your Discord bot project! This bot is built with Smart Serve IDE.

## Features

- 🤖 **Smart Commands** - Intelligent command handling
- 🎵 **Music Player** - High-quality music streaming
- 🔒 **Moderation** - Advanced server moderation tools
- 🎮 **Games** - Fun interactive games
- 📊 **Analytics** - Detailed server statistics

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure your bot token:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your bot token
   \`\`\`

3. Start the bot:
   \`\`\`bash
   npm start
   \`\`\`

## Commands

- \`!hello\` - Say hello to the bot
- \`!help\` - Show available commands
- \`!play <song>\` - Play a song
- \`!stop\` - Stop music playback

## Support

Need help? Visit [Smart Serve Support](https://smartserve.com/support)

---
Built with ❤️ by Smart Serve`,
        
        text: `Welcome to Smart Serve IDE!

This is a text file where you can write notes, documentation, or any plain text content.

Features:
- Real-time syntax highlighting
- Auto-completion
- File management
- Terminal integration
- Beautiful UI

Start coding your Discord bot today!`
    };
    
    return templates[fileType] || '// New file\n';
}

function markFileModified(fileName) {
    if (openFiles.has(fileName)) {
        const fileInfo = openFiles.get(fileName);
        if (!fileInfo.modified) {
            fileInfo.modified = true;
            openFiles.set(fileName, fileInfo);
            
            // Update tab to show modified state
            const tab = document.querySelector(`.tab[data-file="${fileName}"] .tab-name`);
            if (tab && !tab.textContent.endsWith('*')) {
                tab.textContent += '*';
            }
        }
    }
}

function saveFileContent(fileName, content) {
    fileContents.set(fileName, content);
    
    // Update file modified state
    if (openFiles.has(fileName)) {
        const fileInfo = openFiles.get(fileName);
        fileInfo.modified = false;
        openFiles.set(fileName, fileInfo);
        
        // Update tab to remove modified indicator
        const tab = document.querySelector(`.tab[data-file="${fileName}"] .tab-name`);
        if (tab && tab.textContent.endsWith('*')) {
            tab.textContent = tab.textContent.slice(0, -1);
        }
    }
}

function updateFileTreeSelection(fileName) {
    // Remove selection from all files
    document.querySelectorAll('.tree-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add selection to current file
    const fileItem = document.querySelector(`.tree-item[data-name="${fileName}"]`);
    if (fileItem) {
        fileItem.classList.add('active');
    }
}

// Load user code from Discord
async function loadUserCodeFromDiscord() {
    const urlParams = new URLSearchParams(window.location.search);
    const templateName = urlParams.get('template');
    const orderNumber = urlParams.get('order');
    
    if (templateName) {
        await loadTemplateFiles(templateName);
        return;
    }
    
    try {
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) {
            console.log('No session token found');
            return;
        }

        let url = '/api/user/code';
        if (orderNumber) {
            url = `/api/order/${orderNumber}/code`;
            
            // Update project name
            const projectName = document.getElementById('projectName');
            if (projectName) {
                projectName.textContent = `Order #${orderNumber}`;
            }
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (response.ok) {
            const userCode = await response.json();
            
            // Clear default files
            fileContents.clear();
            openFiles.clear();
            
            // Clear existing tabs and panels
            document.querySelectorAll('.tab:not(.tab-add)').forEach(tab => tab.remove());
            document.querySelectorAll('.editor-panel').forEach(panel => panel.remove());
            
            // Load user files
            let hasFiles = false;
            for (const [filename, fileData] of Object.entries(userCode)) {
                fileContents.set(filename, fileData.content);
                openFile(filename, fileData.language || getFileTypeFromExtension(filename));
                hasFiles = true;
            }
            
            // If no files, create default
            if (!hasFiles) {
                fileContents.set('index.js', getDefaultFileContent('javascript'));
                openFile('index.js', 'javascript');
            }
            
            showNotification('Code loaded successfully!', 'success');
            console.log('✅ User code loaded from Discord');
        }
    } catch (error) {
        console.error('Error loading user code:', error);
        // Create default file on error
        if (!fileContents.has('index.js')) {
            fileContents.set('index.js', getDefaultFileContent('javascript'));
            openFile('index.js', 'javascript');
        }
    }
}

function getFileTypeFromExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'js': 'javascript',
        'json': 'json',
        'css': 'css',
        'html': 'html',
        'htm': 'html',
        'md': 'markdown',
        'txt': 'text'
    };
    
    return typeMap[ext] || 'text';
}

async function loadTemplateFiles(templateName) {
    // Template implementations would go here
    console.log(`Loading template: ${templateName}`);
    
    // Update project name
    const projectName = document.getElementById('projectName');
    if (projectName) {
        projectName.textContent = `${templateName} Template`;
    }
    
    showNotification(`Template "${templateName}" loaded!`, 'success');
}

// Action functions
function runCode() {
    switchPanel('output');
    
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    
    // Add running message
    const runningMsg = document.createElement('div');
    runningMsg.className = 'output-message info';
    runningMsg.innerHTML = `
        <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
        <span class="output-text">🚀 Running ${currentFile}...</span>
    `;
    outputContent.appendChild(runningMsg);
    
    // Simulate execution
    setTimeout(() => {
        const successMsg = document.createElement('div');
        successMsg.className = 'output-message success';
        successMsg.innerHTML = `
            <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="output-text">✅ Bot started successfully!</span>
        `;
        outputContent.appendChild(successMsg);
        
        const infoMsg = document.createElement('div');
        infoMsg.className = 'output-message info';
        infoMsg.innerHTML = `
            <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="output-text">🔗 Bot connected to Discord API</span>
        `;
        outputContent.appendChild(infoMsg);
    }, 1500);
    
    showNotification('Code execution started', 'info');
}

function saveAll() {
    // Save all open files
    let savedCount = 0;
    
    openFiles.forEach((fileInfo, fileName) => {
        if (fileInfo.modified) {
            const editor = document.getElementById(`editor-${fileName}`);
            if (editor) {
                saveFileContent(fileName, editor.value);
                savedCount++;
            }
        }
    });
    
    showNotification(savedCount > 0 ? `Saved ${savedCount} files` : 'All files up to date', 'success');
}

function formatCode() {
    const editor = document.getElementById(`editor-${currentFile}`);
    if (!editor) return;
    
    // Simple code formatting (basic indentation)
    const lines = editor.value.split('\n');
    let formatted = [];
    let indentLevel = 0;
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Decrease indent for closing brackets
        if (trimmedLine.match(/^[}\]]/)) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // Add formatted line
        formatted.push('    '.repeat(indentLevel) + trimmedLine);
        
        // Increase indent for opening brackets
        if (trimmedLine.match(/[{\[]$/)) {
            indentLevel++;
        }
    });
    
    editor.value = formatted.join('\n');
    
    // Update syntax highlighting
    const syntaxOverlay = document.getElementById(`syntaxOverlay-${currentFile}`);
    const lineNumbers = document.getElementById(`lineNumbers-${currentFile}`);
    const fileInfo = openFiles.get(currentFile);
    
    if (syntaxOverlay && fileInfo) {
        applySyntaxHighlighting(editor, syntaxOverlay, fileInfo.type);
        updateLineNumbers(editor, lineNumbers);
    }
    
    showNotification('Code formatted', 'success');
}

function copyCode() {
    const editor = document.getElementById(`editor-${currentFile}`);
    if (!editor) return;
    
    navigator.clipboard.writeText(editor.value).then(() => {
        showNotification('Code copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function copySelection() {
    // Implementation for copying selected text
}

function pasteText() {
    // Implementation for pasting text
}

function commentToggle() {
    // Implementation for toggling comments
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Set background color based on type
    const colors = {
        info: '#00d4ff',
        success: '#00ff88',
        warning: '#ffb800',
        error: '#ff4757'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

console.log('🎉 Smart Serve IDE loaded successfully!');
