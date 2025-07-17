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

// Load user code from Discord bot
async function loadUserCodeFromDiscord() {
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