// Global variables
let currentProject = null;
let openFiles = new Map();
let fileContents = new Map();
let isDarkTheme = true;
let isRunning = false;

// File type configurations
const FILE_TYPES = {
    python: {
        extension: '.py',
        icon: 'fab fa-python',
        language: 'python',
        template: `# Python Bot Script
def main():
    print("Hello from Python!")

if __name__ == "__main__":
    main()
`
    },
    javascript: {
        extension: '.js',
        icon: 'fab fa-js-square',
        language: 'javascript',
        template: `// JavaScript Bot Script
console.log("Hello from JavaScript!");

// Your bot code here
function main() {
    console.log("Bot is running!");
}

main();
`
    },
    text: {
        extension: '.txt',
        icon: 'fas fa-file-alt',
        language: 'text',
        template: '# Text file\n\nYour content here...'
    },
    env: {
        extension: '.env',
        icon: 'fas fa-cog',
        language: 'bash',
        template: '# Environment variables\nBOT_TOKEN=your_token_here\nDEBUG=true\n'
    }
};

// Initialize the IDE
document.addEventListener('DOMContentLoaded', function() {
    initializeIDE();
});

async function initializeIDE() {
    showLoadingScreen();

    // Simulate loading delay with realistic progress
    await simulateLoadingWithProgress();

    hideLoadingScreen();

    // Initialize components
    initializeProject();
    initializeEventListeners();
    setupConsole();
    checkAuthentication();
    await initializeAISystem();

    // Load project if specified
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    const orderNumber = urlParams.get('order');

    if (projectId || orderNumber) {
        await loadProject(projectId || orderNumber);
    } else {
        showWelcomeScreen();
    }

    console.log('🚀 Smart Serve IDE with Ultra-Advanced AI initialized successfully!');
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function initializeProject() {
    // Initialize empty project
    currentProject = {
        id: generateProjectId(),
        name: 'My Bot Project',
        files: new Map(),
        createdAt: Date.now(),
        lastModified: Date.now()
    };

    updateProjectName();
}

function generateProjectId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initializeEventListeners() {
    // Console tab switching
    const consoleTabs = document.querySelectorAll('.console-tab');
    consoleTabs.forEach(tab => {
        tab.addEventListener('click', () => switchConsoleTab(tab.dataset.panel));
    });

    // File modal
    const fileModal = document.getElementById('fileModal');
    if (fileModal) {
        fileModal.addEventListener('click', (e) => {
            if (e.target === fileModal) {
                closeModal('fileModal');
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                createNewFile();
                break;
            case 'r':
                e.preventDefault();
                runCode();
                break;
            case '`':
                e.preventDefault();
                toggleConsole();
                break;
        }
    }

    if (e.key === 'F5') {
        e.preventDefault();
        runCode();
    }
}

// Auto-save functionality
let autoSaveTimeout;
function autoSaveProject() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        await saveProjectSilently();
    }, 2000); // Save after 2 seconds of inactivity
}

async function saveProjectSilently() {
    try {
        const projectData = {
            ...currentProject,
            files: Array.from(currentProject.files.entries())
        };

        localStorage.setItem(`project_${currentProject.id}`, JSON.stringify(projectData));

        // Save to server and add to bots gallery
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (sessionToken) {
            await saveProjectToServer(projectData);
            await addToBotGallery(projectData);
        }

        // Update UI to show saved status
        updateSaveStatus('saved');

    } catch (error) {
        console.error('Auto-save error:', error);
        updateSaveStatus('error');
    }
}

async function addToBotGallery(projectData) {
    try {
        const response = await fetch('/api/bots/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            },
            body: JSON.stringify({
                projectId: projectData.id,
                name: projectData.name,
                description: `Auto-saved bot project: ${projectData.name}`,
                files: projectData.files,
                language: projectData.language || 'javascript',
                status: '🟢 Ready'
            })
        });

        if (response.ok) {
            console.log('Project added to bot gallery');
        }
    } catch (error) {
        console.error('Error adding to bot gallery:', error);
    }
}

function updateSaveStatus(status) {
    const statusElement = document.querySelector('.project-status .status-dot');
    if (statusElement) {
        statusElement.className = `status-dot ${status === 'saved' ? 'online' : status === 'saving' ? 'away' : 'offline'}`;
    }
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
    }
}

function redirectToBuilder() {
    // Redirect to bot builder instead of home
    const userData = localStorage.getItem('userData');
    if (userData) {
        window.location.href = 'bot-builder.html';
    } else {
        window.location.href = 'login.html';
    }
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const emptyState = document.getElementById('emptyState');

    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'flex';
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const emptyState = document.getElementById('emptyState');

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

// File Management
function createNewFile() {
    document.getElementById('fileModal').style.display = 'flex';
    document.getElementById('fileName').focus();
}

function createFileOfType(type) {
    const fileType = FILE_TYPES[type];
    if (!fileType) return;

    const fileName = prompt(`Enter ${type} file name:`, `main${fileType.extension}`);
    if (!fileName) return;

    const finalFileName = fileName.endsWith(fileType.extension) ? fileName : fileName + fileType.extension;

    createFileWithContent(finalFileName, type, fileType.template);
}

function createFile() {
    const fileName = document.getElementById('fileName').value.trim();
    const fileType = document.getElementById('fileType').value;

    if (!fileName) {
        alert('Please enter a file name');
        return;
    }

    const config = FILE_TYPES[fileType];
    const finalFileName = fileName.endsWith(config.extension) ? fileName : fileName + config.extension;

    createFileWithContent(finalFileName, fileType, config.template);
    closeModal('fileModal');
}

function createFileWithContent(fileName, type, content) {
    if (currentProject.files.has(fileName)) {
        alert('File already exists');
        return;
    }

    const fileData = {
        name: fileName,
        type: type,
        content: content,
        language: FILE_TYPES[type].language,
        createdAt: Date.now(),
        lastModified: Date.now()
    };

    currentProject.files.set(fileName, fileData);
    fileContents.set(fileName, content);

    addFileToExplorer(fileName, type);
    openFileInEditor(fileName);
    hideWelcomeScreen();

    showNotification(`File "${fileName}" created successfully`, 'success');
}

function addFileToExplorer(fileName, type) {
    const fileExplorer = document.getElementById('fileExplorer');
    const emptyState = document.getElementById('emptyState');

    if (emptyState) emptyState.style.display = 'none';

    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileName = fileName;
    fileItem.onclick = () => openFileInEditor(fileName);

    // Add right-click context menu
    fileItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showFileContextMenu(e, fileName);
    });

    const config = FILE_TYPES[type];
    fileItem.innerHTML = `
        <i class="${config.icon} file-icon ${type}"></i>
        <span class="file-name">${fileName}</span>
        <span class="main-file-indicator" style="display: none;">⭐</span>
    `;

    fileExplorer.appendChild(fileItem);
}

// Context menu for file operations
function showFileContextMenu(event, fileName) {
    // Remove existing context menu
    const existingMenu = document.getElementById('file-context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.id = 'file-context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
        position: fixed;
        top: ${event.clientY}px;
        left: ${event.clientX}px;
        background: var(--secondary-black);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 8px 0;
        z-index: 10000;
        min-width: 180px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    const menuItems = [
        {
            icon: 'fas fa-play',
            text: 'Set as Main File',
            action: () => setMainFile(fileName)
        },
        {
            icon: 'fas fa-edit',
            text: 'Rename',
            action: () => renameFile(fileName)
        },
        {
            icon: 'fas fa-trash',
            text: 'Delete',
            action: () => deleteFile(fileName)
        }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `
            <i class="${item.icon}"></i>
            <span>${item.text}</span>
        `;
        menuItem.onclick = () => {
            item.action();
            contextMenu.remove();
        };
        contextMenu.appendChild(menuItem);
    });

    document.body.appendChild(contextMenu);

    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Set main file for execution
function setMainFile(fileName) {
    // Remove main file indicator from all files
    document.querySelectorAll('.main-file-indicator').forEach(indicator => {
        indicator.style.display = 'none';
    });

    // Add main file indicator to selected file
    const fileItem = document.querySelector(`[data-file-name="${fileName}"]`);
    if (fileItem) {
        const indicator = fileItem.querySelector('.main-file-indicator');
        if (indicator) {
            indicator.style.display = 'inline';
        }
    }

    // Store main file in project
    currentProject.mainFile = fileName;
    showNotification(`Set "${fileName}" as main file`, 'success');
}

// Get main file for execution
function getMainFile() {
    // If main file is set, use it
    if (currentProject.mainFile && currentProject.files.has(currentProject.mainFile)) {
        return currentProject.mainFile;
    }

    // Otherwise use currently active file
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        return activeTab.dataset.fileName;
    }

    // Fallback to first file
    const firstFile = Array.from(currentProject.files.keys())[0];
    return firstFile;
}

function openFileInEditor(fileName) {
    const fileData = currentProject.files.get(fileName);
    if (!fileData) return;

    // Update file explorer selection
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.fileName === fileName) {
            item.classList.add('active');
        }
    });

    // Create or switch to tab
    createOrSwitchTab(fileName, fileData);

    // Create or switch to editor panel
    createOrSwitchEditor(fileName, fileData);
}

function createOrSwitchTab(fileName, fileData) {
    const tabContainer = document.getElementById('tabContainer');
    let existingTab = tabContainer.querySelector(`[data-file-name="${fileName}"]`);

    if (!existingTab) {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.fileName = fileName;

        const config = FILE_TYPES[fileData.type];
        tab.innerHTML = `
            <i class="${config.icon} tab-icon"></i>
            <span class="tab-name">${fileName}</span>
            <button class="tab-close" onclick="closeTab('${fileName}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        tab.onclick = (e) => {
            if (!e.target.closest('.tab-close')) {
                openFileInEditor(fileName);
            }
        };

        tabContainer.appendChild(tab);
        existingTab = tab;
    }

    // Set active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    existingTab.classList.add('active');
}

function createOrSwitchEditor(fileName, fileData) {
    const editorContainer = document.getElementById('editorContainer');
    let existingPanel = editorContainer.querySelector(`[data-file-name="${fileName}"]`);

    if (!existingPanel) {
        const panel = document.createElement('div');
        panel.className = 'editor-panel';
        panel.dataset.fileName = fileName;

        panel.innerHTML = `
            <div class="editor-header">
                <div class="editor-info">
                    <span class="editor-file-name">${fileName}</span>
                    <span class="editor-file-path">~/${currentProject.name}/${fileName}</span>
                </div>
                <div class="editor-actions">
                    <button class="icon-btn" onclick="formatCode('${fileName}')" title="Format Code">
                        <i class="fas fa-code"></i>
                    </button>
                    <button class="icon-btn" onclick="copyFileContent('${fileName}')" title="Copy All">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="editor-content">
                <div class="line-numbers" id="lineNumbers-${fileName}"></div>
                <textarea 
                    class="code-editor" 
                    id="editor-${fileName}"
                    data-language="${fileData.language}"
                    spellcheck="false"
                    autocomplete="off"
                    placeholder="Start coding here..."
                >${fileData.content}</textarea>
            </div>
        `;

        editorContainer.appendChild(panel);

        // Initialize editor
        initializeEditor(fileName, fileData);
        existingPanel = panel;
    }

    // Set active panel
    document.querySelectorAll('.editor-panel').forEach(panel => panel.classList.remove('active'));
    existingPanel.classList.add('active');

    // Focus editor
    const editor = document.getElementById(`editor-${fileName}`);
    if (editor) {
        setTimeout(() => editor.focus(), 100);
    }
}

function initializeEditor(fileName, fileData) {
    const editor = document.getElementById(`editor-${fileName}`);
    const lineNumbers = document.getElementById(`lineNumbers-${fileName}`);

    if (!editor || !lineNumbers) return;

    // Update line numbers
    updateLineNumbers(editor, lineNumbers);

    // Apply syntax highlighting based on language
    applySyntaxHighlighting(editor, fileData.language);

    // Add event listeners
    editor.addEventListener('input', function(e) {
        updateLineNumbers(editor, lineNumbers);
        applySyntaxHighlighting(editor, fileData.language);

        // Save content
        fileData.content = editor.value;
        fileData.lastModified = Date.now();
        fileContents.set(fileName, editor.value);

        // Mark as modified and trigger auto-save
        markTabAsModified(fileName);
        updateSaveStatus('saving');
        autoSaveProject();
    });

    editor.addEventListener('keydown', function(e) {
        handleEditorKeyDown(e, fileName);
    });

    editor.addEventListener('scroll', function() {
        lineNumbers.scrollTop = editor.scrollTop;
    });
}

function updateLineNumbers(editor, lineNumbers) {
    const lines = editor.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => 
        `<div class="line-number">${index + 1}</div>`
    ).join('');

    lineNumbers.innerHTML = lineNumbersHtml;
}

function applySyntaxHighlighting(editor, language) {
    // Simple syntax highlighting using CSS classes
    const content = editor.value;

    // This would be enhanced with a proper syntax highlighter like Prism.js
    // For now, we'll add basic highlighting through CSS classes
    editor.className = `code-editor language-${language}`;
}

function handleEditorKeyDown(e, fileName) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const editor = e.target;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        const tabChar = '    '; // 4 spaces
        editor.value = editor.value.substring(0, start) + tabChar + editor.value.substring(end);
        editor.setSelectionRange(start + tabChar.length, start + tabChar.length);

        // Trigger input event to update line numbers and content
        editor.dispatchEvent(new Event('input'));
    }
}

function markTabAsModified(fileName) {
    const tab = document.querySelector(`[data-file-name="${fileName}"]`);
    if (tab) {
        const tabName = tab.querySelector('.tab-name');
        if (tabName && !tabName.textContent.endsWith('*')) {
            tabName.textContent += '*';
        }
    }
}

function closeTab(fileName) {
    const tab = document.querySelector(`[data-file-name="${fileName}"]`);
    const panel = document.querySelector(`[data-file-name="${fileName}"]`);

    if (tab) tab.remove();
    if (panel) panel.remove();

    // If no more tabs, show welcome screen
    const remainingTabs = document.querySelectorAll('.tab');
    if (remainingTabs.length === 0) {
        showWelcomeScreen();
    } else {
        // Open the first remaining tab
        const firstTab = remainingTabs[0];
        const firstFileName = firstTab.dataset.fileName;
        openFileInEditor(firstFileName);
    }
}

// Console Management
function setupConsole() {
    addConsoleOutput('Welcome to Smart Serve IDE Console!', 'info');
    addConsoleOutput('Your code output will appear here when you run it.', 'info');
}

function switchConsoleTab(panelName) {
    // Update tab states
    document.querySelectorAll('.console-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.panel === panelName) {
            tab.classList.add('active');
        }
    });

    // Update panel states
    document.querySelectorAll('.console-view').forEach(view => {
        view.classList.remove('active');
        if (view.dataset.panel === panelName) {
            view.classList.add('active');
        }
    });
}

function addConsoleOutput(text, type = 'info') {
    const outputContent = document.getElementById('outputContent');
    if (!outputContent) return;

    const outputLine = document.createElement('div');
    outputLine.className = `output-line ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    outputLine.innerHTML = `
        <span class="output-time">[${timestamp}]</span>
        <span class="output-text">${text}</span>
    `;

    outputContent.appendChild(outputLine);
    outputContent.scrollTop = outputContent.scrollHeight;
}

function addTerminalOutput(text, type = 'output') {
    const terminalOutput = document.getElementById('terminalOutput');
    if (!terminalOutput) return;

    const terminalLine = document.createElement('div');
    terminalLine.className = `terminal-line ${type}`;
    terminalLine.textContent = text;

    terminalOutput.appendChild(terminalLine);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Global variables for process management
let currentProcess = null;
let executionWebSocket = null;
let inactivityTimer = null;
let lastActivityTime = Date.now();

// Project Actions
function runCode() {
    if (isRunning) {
        stopCode();
        return;
    }

    const runBtn = document.querySelector('.run-btn');
    const stopBtn = document.querySelector('.stop-btn');

    if (runBtn) runBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'flex';

    isRunning = true;
    lastActivityTime = Date.now();

    // Switch to both console and output tabs
    switchConsoleTab('console');

    // Clear previous output
    clearConsole();

    addConsoleOutput('🚀 Starting execution...', 'info');
    addTerminalOutput('Starting execution...', 'system');

    // Get main file to execute
    const mainFileName = getMainFile();
    if (!mainFileName) {
        addConsoleOutput('❌ No file selected for execution', 'error');
        stopCode();
        return;
    }

    const fileData = currentProject.files.get(mainFileName);
    if (!fileData) {
        addConsoleOutput('❌ File not found', 'error');
        stopCode();
        return;
    }

    addConsoleOutput(`📂 Executing: ${mainFileName}`, 'info');

    // Execute based on language
    if (fileData.language === 'javascript') {
        executeJavaScriptFile(mainFileName, fileData.content);
    } else if (fileData.language === 'python') {
        executePythonFile(mainFileName, fileData.content);
    } else {
        addConsoleOutput('❌ Unsupported language for execution', 'error');
        stopCode();
    }

    // Start inactivity timer
    startInactivityTimer();
}

// Execute JavaScript file with real Node.js environment
async function executeJavaScriptFile(fileName, code) {
    try {
        // Save file temporarily for execution
        const response = await fetch('/api/execute/javascript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            },
            body: JSON.stringify({
                fileName: fileName,
                code: code,
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to start JavaScript execution');
        }

        const result = await response.json();
        
        if (result.success) {
            addTerminalOutput(`> node ${fileName}`, 'command');
            
            // Connect to WebSocket for real-time output
            connectToExecutionStream(result.processId);
        } else {
            addConsoleOutput(`❌ Failed to execute: ${result.error}`, 'error');
            stopCode();
        }

    } catch (error) {
        addConsoleOutput(`❌ Execution Error: ${error.message}`, 'error');
        stopCode();
    }
}

// Execute Python file with real Python environment
async function executePythonFile(fileName, code) {
    try {
        // Save file temporarily for execution
        const response = await fetch('/api/execute/python', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            },
            body: JSON.stringify({
                fileName: fileName,
                code: code,
                projectId: currentProject.id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to start Python execution');
        }

        const result = await response.json();
        
        if (result.success) {
            addTerminalOutput(`> python3 ${fileName}`, 'command');
            
            // Connect to WebSocket for real-time output
            connectToExecutionStream(result.processId);
        } else {
            addConsoleOutput(`❌ Failed to execute: ${result.error}`, 'error');
            stopCode();
        }

    } catch (error) {
        addConsoleOutput(`❌ Execution Error: ${error.message}`, 'error');
        stopCode();
    }
}

// Connect to execution stream via WebSocket
function connectToExecutionStream(processId) {
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname;
        const wsPort = '5001'; // WebSocket server port
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/api/execute/stream/${processId}`;
        
        executionWebSocket = new WebSocket(wsUrl);

        executionWebSocket.onopen = () => {
            addConsoleOutput('🔗 Connected to execution stream', 'info');
        };

        executionWebSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'stdout') {
                addTerminalOutput(data.data, 'output');
                addConsoleOutput(data.data, 'output');
            } else if (data.type === 'stderr') {
                addTerminalOutput(data.data, 'error');
                addConsoleOutput(data.data, 'error');
            } else if (data.type === 'exit') {
                addConsoleOutput(`Process exited with code ${data.code}`, data.code === 0 ? 'success' : 'error');
                stopCode();
            }
            
            // Update activity time
            lastActivityTime = Date.now();
        };

        executionWebSocket.onerror = (error) => {
            addConsoleOutput('❌ WebSocket connection error', 'error');
            stopCode();
        };

        executionWebSocket.onclose = () => {
            addConsoleOutput('🔌 Execution stream closed', 'info');
            if (isRunning) {
                stopCode();
            }
        };

    } catch (error) {
        addConsoleOutput(`❌ Failed to connect to execution stream: ${error.message}`, 'error');
        stopCode();
    }
}

// Execute Python code (simulated with better parsing)
function executePython(code) {
    addConsoleOutput('🐍 Python execution (simulated)', 'info');

    try {
        const lines = code.split('\n');
        const variables = {};

        lines.forEach((line, index) => {
            line = line.trim();

            // Handle print statements
            if (line.startsWith('print(') && line.endsWith(')')) {
                const content = line.slice(6, -1);
                let output = content;

                // Replace variables
                Object.keys(variables).forEach(varName => {
                    output = output.replace(new RegExp(`\\b${varName}\\b`, 'g'), variables[varName]);
                });

                // Remove quotes for string literals
                output = output.replace(/^['"]|['"]$/g, '');
                addConsoleOutput(output, 'output');
            }

            // Handle simple variable assignments
            else if (line.includes(' = ') && !line.startsWith('#')) {
                const [varName, value] = line.split(' = ').map(s => s.trim());
                if (varName && value) {
                    // Simple value parsing
                    if (value.startsWith('"') && value.endsWith('"')) {
                        variables[varName] = value.slice(1, -1);
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        variables[varName] = value.slice(1, -1);
                    } else if (!isNaN(value)) {
                        variables[varName] = value;
                    } else {
                        variables[varName] = value;
                    }
                    addConsoleOutput(`📝 Variable ${varName} = ${variables[varName]}`, 'info');
                }
            }

            // Handle for loops (basic)
            else if (line.startsWith('for ') && line.endsWith(':')) {
                addConsoleOutput(`🔄 Loop detected: ${line}`, 'info');
            }

            // Handle if statements
            else if (line.startsWith('if ') && line.endsWith(':')) {
                addConsoleOutput(`🔀 Condition: ${line}`, 'info');
            }

            // Handle comments
            else if (line.startsWith('#')) {
                addConsoleOutput(`💬 ${line}`, 'comment');
            }

            // Handle imports
            else if (line.startsWith('import ') || line.startsWith('from ')) {
                addConsoleOutput(`📦 ${line}`, 'info');
            }
        });

        addConsoleOutput('✅ Python code simulation completed', 'success');
        addConsoleOutput('💡 Note: This is a basic simulation. For full Python execution, use a Python environment.', 'warning');

    } catch (error) {
        addConsoleOutput(`❌ Python simulation error: ${error.message}`, 'error');
    }
}

// Start inactivity timer (3 minutes)
function startInactivityTimer() {
    clearInactivityTimer();
    
    inactivityTimer = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivityTime;
        const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
        
        if (timeSinceActivity >= threeMinutes && isRunning) {
            addConsoleOutput('⏰ Auto-stopping due to inactivity (3 minutes)', 'warning');
            stopCode();
        }
    }, 30000); // Check every 30 seconds
}

// Clear inactivity timer
function clearInactivityTimer() {
    if (inactivityTimer) {
        clearInterval(inactivityTimer);
        inactivityTimer = null;
    }
}

// Enhanced stop function
async function stopCode() {
    const runBtn = document.querySelector('.run-btn');
    const stopBtn = document.querySelector('.stop-btn');

    if (runBtn) runBtn.style.display = 'flex';
    if (stopBtn) stopBtn.style.display = 'none';

    isRunning = false;
    
    // Clear inactivity timer
    clearInactivityTimer();

    // Close WebSocket connection
    if (executionWebSocket) {
        executionWebSocket.close();
        executionWebSocket = null;
    }

    // Stop server-side process
    if (currentProcess) {
        try {
            await fetch('/api/execute/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                },
                body: JSON.stringify({
                    processId: currentProcess
                })
            });
        } catch (error) {
            console.error('Error stopping process:', error);
        }
        currentProcess = null;
    }

    addConsoleOutput('🛑 Execution stopped', 'warning');
    addTerminalOutput('Process terminated', 'system');
}

// Track user activity
function updateActivity() {
    lastActivityTime = Date.now();
}

// Add activity listeners
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('scroll', updateActivity);
window.addEventListener('focus', updateActivity);

async function saveProject() {
    try {
        // Save to localStorage
        const projectData = {
            ...currentProject,
            files: Array.from(currentProject.files.entries())
        };

        localStorage.setItem(`project_${currentProject.id}`, JSON.stringify(projectData));

        // Save to server if logged in
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (sessionToken) {
            await saveProjectToServer(projectData);
        }

        // Remove modified indicators
        document.querySelectorAll('.tab-name').forEach(tabName => {
            if (tabName.textContent.endsWith('*')) {
                tabName.textContent = tabName.textContent.slice(0, -1);
            }
        });

        showNotification('Project saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('Failed to save project', 'error');
    }
}

async function saveProjectToServer(projectData) {
    try {
        const response = await fetch('/api/projects/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to save to server');
        }

        console.log('Project saved to server successfully');
    } catch (error) {
        console.error('Error saving to server:', error);
    }
}

async function downloadProject() {
    try {
        const zip = new JSZip();

        // Add all files to zip
        for (const [fileName, fileData] of currentProject.files) {
            zip.file(fileName, fileData.content);
        }

        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        showNotification('Project downloaded successfully!', 'success');

    } catch (error) {
        console.error('Error downloading project:', error);
        showNotification('Failed to download project', 'error');
    }
}

async function loadProject(projectId) {
    try {
        let projectData = null;
        const urlParams = new URLSearchParams(window.location.search);

        // Try to load from server first
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (sessionToken) {
            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });

                if (response.ok) {
                    projectData = await response.json();
                }
            } catch (error) {
                console.log('Could not load from server, trying localStorage');
            }
        }

        // Fallback to localStorage
        if (!projectData) {
            const stored = localStorage.getItem(`project_${projectId}`);
            if (stored) {
                projectData = JSON.parse(stored);
            }
        }

        if (projectData) {
            currentProject = {
                ...projectData,
                files: new Map(projectData.files)
            };

            updateProjectName();

            // Check if this is an AI chat project
            const projectType = urlParams.get('type');
            if (projectType === 'ai-chat') {
                await setupAIChatEnvironment(urlParams.get('description'), urlParams.get('files'));
            }

            // Check if this is a moderation template
            const template = urlParams.get('template');
            const commands = urlParams.get('commands');
            
            if (template === 'moderation' && commands) {
                await generateModerationBotFiles(commands.split(','));
            }

            // Load files into editor
            for (const [fileName, fileData] of currentProject.files) {
                fileContents.set(fileName, fileData.content);
                addFileToExplorer(fileName, fileData.type);
            }

            // Open first file if exists
            const firstFile = Array.from(currentProject.files.keys())[0];
            if (firstFile) {
                openFileInEditor(firstFile);
                hideWelcomeScreen();
            }

            showNotification('Project loaded successfully!', 'success');
        }

    } catch (error) {
        console.error('Error loading project:', error);
        showNotification('Failed to load project', 'error');
    }
}

// Setup AI chat environment
async function setupAIChatEnvironment(description, filesCount) {
    // Add AI chat panel to sidebar
    const sidebar = document.querySelector('.sidebar');
    
    const aiChatSection = document.createElement('div');
    aiChatSection.className = 'ai-chat-section';
    aiChatSection.innerHTML = `
        <div class="section-header">
            <i class="fas fa-robot"></i>
            <span>AI Assistant</span>
        </div>
        <div class="ai-chat-container">
            <div class="ai-messages" id="aiMessages">
                <div class="ai-message user">
                    <div class="message-content">${description || 'Help me create a bot'}</div>
                    ${filesCount > 0 ? `<div class="message-files">${filesCount} file(s) attached</div>` : ''}
                </div>
                <div class="ai-message assistant">
                    <div class="message-content">I'll help you create your bot! Let me analyze your requirements and generate the code for you.</div>
                </div>
            </div>
            <div class="ai-input-container">
                <input type="text" id="aiInput" placeholder="Ask AI assistant...">
                <button id="aiSendBtn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    // Insert before file explorer
    const fileExplorer = sidebar.querySelector('.sidebar-section');
    sidebar.insertBefore(aiChatSection, fileExplorer);
    
    // Generate initial bot files
    await generateInitialBotFiles(description);
}

// Generate moderation bot files with selected commands
async function generateModerationBotFiles(selectedCommands) {
    // Generate main bot file
    const mainBotCode = generateModerationBotCode(selectedCommands);
    createFileWithContent('main.py', 'python', mainBotCode);
    
    // Generate config file
    const configCode = `{
    "token": "YOUR_BOT_TOKEN_HERE",
    "prefix": "!",
    "moderator_roles": ["Moderator", "Admin"],
    "log_channel": "mod-logs"
}`;
    createFileWithContent('config.json', 'text', configCode);
    
    // Generate requirements file
    const requirementsCode = `py-cord==2.4.1
python-dotenv==1.0.0`;
    createFileWithContent('requirements.txt', 'text', requirementsCode);
    
    // Set main.py as the main file
    currentProject.mainFile = 'main.py';
    setMainFile('main.py');
    
    showNotification(`Generated moderation bot with ${selectedCommands.length} commands!`, 'success');
}

// Generate moderation bot Python code
function generateModerationBotCode(selectedCommands) {
    return `import discord
from discord.ext import commands
import json
import asyncio
from datetime import datetime, timedelta

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix=config['prefix'], intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user} is now online!')
    print(f'Bot ID: {bot.user.id}')
    print('-------------------')

# Helper function to check if user has moderation permissions
def has_mod_permissions():
    async def predicate(ctx):
        if ctx.author.guild_permissions.administrator:
            return True
        
        for role in ctx.author.roles:
            if role.name in config['moderator_roles']:
                return True
        
        await ctx.send("❌ You don't have permission to use this command!")
        return False
    
    return commands.check(predicate)

${generateCommandCode(selectedCommands)}

# Run the bot
if __name__ == "__main__":
    bot.run(config['token'])`;
}

// Generate specific command code based on selection
function generateCommandCode(selectedCommands) {
    const commandImplementations = {
        ban: `@bot.command()
@has_mod_permissions()
async def ban(ctx, member: discord.Member, *, reason="No reason provided"):
    try:
        await member.ban(reason=reason)
        embed = discord.Embed(title="User Banned", color=0xff0000)
        embed.add_field(name="User", value=f"{member.mention} ({member})", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed)
    except discord.Forbidden:
        await ctx.send("❌ I don't have permission to ban this user!")`,

        kick: `@bot.command()
@has_mod_permissions()
async def kick(ctx, member: discord.Member, *, reason="No reason provided"):
    try:
        await member.kick(reason=reason)
        embed = discord.Embed(title="User Kicked", color=0xff9900)
        embed.add_field(name="User", value=f"{member.mention} ({member})", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed)
    except discord.Forbidden:
        await ctx.send("❌ I don't have permission to kick this user!")`,

        mute: `@bot.command()
@has_mod_permissions()
async def mute(ctx, member: discord.Member, duration: int = 10, *, reason="No reason provided"):
    try:
        timeout_until = datetime.utcnow() + timedelta(minutes=duration)
        await member.timeout(timeout_until, reason=reason)
        embed = discord.Embed(title="User Muted", color=0x999999)
        embed.add_field(name="User", value=f"{member.mention} ({member})", inline=False)
        embed.add_field(name="Duration", value=f"{duration} minutes", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        await ctx.send(embed=embed)
    except discord.Forbidden:
        await ctx.send("❌ I don't have permission to mute this user!")`,

        clear: `@bot.command()
@has_mod_permissions()
async def clear(ctx, amount: int = 10):
    if amount > 100:
        await ctx.send("❌ Cannot delete more than 100 messages at once!")
        return
    
    try:
        deleted = await ctx.channel.purge(limit=amount + 1)
        embed = discord.Embed(title="Messages Cleared", color=0x00ff00)
        embed.add_field(name="Amount", value=f"{len(deleted)-1} messages", inline=False)
        embed.add_field(name="Channel", value=ctx.channel.mention, inline=False)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
        
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(5)
        await msg.delete()
    except discord.Forbidden:
        await ctx.send("❌ I don't have permission to delete messages!")`,

        warn: `# Warning system (requires database for persistence)
warnings = {}

@bot.command()
@has_mod_permissions()
async def warn(ctx, member: discord.Member, *, reason="No reason provided"):
    user_id = str(member.id)
    if user_id not in warnings:
        warnings[user_id] = []
    
    warning = {
        "reason": reason,
        "moderator": str(ctx.author.id),
        "timestamp": datetime.utcnow().isoformat()
    }
    warnings[user_id].append(warning)
    
    embed = discord.Embed(title="User Warned", color=0xffff00)
    embed.add_field(name="User", value=f"{member.mention} ({member})", inline=False)
    embed.add_field(name="Reason", value=reason, inline=False)
    embed.add_field(name="Warning Count", value=len(warnings[user_id]), inline=False)
    embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
    await ctx.send(embed=embed)`
    };

    return selectedCommands
        .filter(cmd => commandImplementations[cmd])
        .map(cmd => commandImplementations[cmd])
        .join('\n\n');
}

function updateProjectName() {
    const projectNameElement = document.getElementById('projectName');
    if (projectNameElement) {
        projectNameElement.textContent = currentProject.name;
    }
}

// Utility Functions
function formatCode(fileName) {
    const editor = document.getElementById(`editor-${fileName}`);
    if (!editor) return;

    const fileData = currentProject.files.get(fileName);
    if (!fileData) return;

    let formatted = editor.value;

    // Basic formatting based on language
    if (fileData.language === 'javascript') {
        // Simple JS formatting
        formatted = formatted.replace(/;(\s*\n)/g, ';\n');
        formatted = formatted.replace(/\{(\s*\n)/g, '{\n');
        formatted = formatted.replace(/\}(\s*\n)/g, '}\n');
    } else if (fileData.language === 'python') {
        // Simple Python formatting
        formatted = formatted.replace(/:\s*\n/g, ':\n');
    }

    editor.value = formatted;
    editor.dispatchEvent(new Event('input'));

    showNotification('Code formatted', 'success');
}

function copyFileContent(fileName) {
    const editor = document.getElementById(`editor-${fileName}`);
    if (!editor) return;

    navigator.clipboard.writeText(editor.value).then(() => {
        showNotification('Code copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function clearConsole() {
    const activeView = document.querySelector('.console-view.active');
    if (!activeView) return;

    const panel = activeView.dataset.panel;

    if (panel === 'output') {
        document.getElementById('outputContent').innerHTML = '';
    } else if (panel === 'console') {
        document.getElementById('terminalOutput').innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prefix">smartserve@ide:~$</span>
                <span class="terminal-cursor">|</span>
            </div>
        `;
    }
}

function toggleConsole() {
    const consolePanel = document.querySelector('.console-panel');
    if (!consolePanel) return;

    const isVisible = consolePanel.style.display !== 'none';
    consolePanel.style.display = isVisible ? 'none' : 'flex';

    const toggleIcon = document.querySelector('.console-actions .icon-btn i');
    if (toggleIcon) {
        toggleIcon.className = isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }

    // Clear form if it's the file modal
    if (modalId === 'fileModal') {
        document.getElementById('fileName').value = '';
        document.getElementById('fileType').value = 'python';
    }
}

function showNotification(message, type = 'info') {
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

    const colors = {
        info: 'var(--accent-secondary)',
        success: 'var(--accent-primary)',
        warning: 'var(--accent-warning)',
        error: 'var(--accent-danger)'
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification styles
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

// File Upload Functionality
function uploadFiles() {
    document.getElementById('fileUpload').click();
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const fileName = file.name;
            const fileType = getFileType(fileName);
            
            createFileWithContent(fileName, fileType, content);
            showNotification(`Uploaded: ${fileName}`, 'success');
        };
        
        if (file.type.startsWith('text/') || file.name.endsWith('.js') || file.name.endsWith('.py') || 
            file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            showNotification(`Unsupported file type: ${file.name}`, 'warning');
        }
    });
    
    // Clear input
    event.target.value = '';
}

function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        'py': 'python',
        'js': 'javascript',
        'json': 'javascript',
        'txt': 'text',
        'md': 'text',
        'env': 'env'
    };
    return typeMap[extension] || 'text';
}

// AI Assistant Functionality
function initializeAIAssistant() {
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
    
    // Simulate AI typing effect
    setTimeout(() => {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }, 3000);
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addAIMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator and respond
    showAITyping();
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage(response, 'assistant');
        hideAITyping();
    }, 1500);
}

function addAIMessage(message, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'ai-avatar';
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = message;
    
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showAITyping() {
    const typingMessage = document.createElement('div');
    typingMessage.className = 'ai-message assistant typing-message';
    typingMessage.innerHTML = `
        <div class="ai-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    document.getElementById('aiMessages').appendChild(typingMessage);
}

function hideAITyping() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

function quickAsk(question) {
    document.getElementById('aiInput').value = question;
    sendAIMessage();
}

function generateAIResponse(message) {
    const responses = {
        'moderation': `I'll help you create a moderation bot! Here's what I can generate for you:

<strong>🛡️ Moderation Features:</strong>
• Ban/Kick commands with reason logging
• Auto-moderation for spam and inappropriate content
• Mute system with timed unmutes
• Warning system with escalation
• Message deletion and bulk cleanup

Would you like me to generate the code for any specific moderation feature?`,

        'music': `Great! I can help you add music functionality to your bot:

<strong>🎵 Music Features I can create:</strong>
• Play music from YouTube/Spotify
• Queue management (add, remove, skip)
• Volume control and audio filters
• Playlist support
• Now playing display with progress

Which music feature would you like me to implement first?`,

        'debug': `I'm here to help debug your code! Here's how I can assist:

<strong>🔧 Debugging Tools:</strong>
• Code analysis for common errors
• Performance optimization suggestions
• Best practices recommendations
• Error explanation and fixes

Share your code or describe the issue you're facing, and I'll help you resolve it!`
    };
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('moderation') || lowerMessage.includes('moderate')) {
        return responses.moderation;
    } else if (lowerMessage.includes('music') || lowerMessage.includes('audio')) {
        return responses.music;
    } else if (lowerMessage.includes('debug') || lowerMessage.includes('fix') || lowerMessage.includes('error')) {
        return responses.debug;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return `Hello! 👋 I'm your AI coding assistant specialized in Discord bot development. I can help you with:
        
• Writing bot commands and features
• Debugging and fixing code issues
• Optimizing bot performance
• Explaining Discord.js/discord.py concepts
• Generating complete bot templates

What would you like to work on today?`;
    } else {
        return `I understand you want to work on: "${message}". Let me help you with that! 

I can generate code, explain concepts, debug issues, or provide step-by-step guidance. Could you be more specific about what you'd like me to help you with?

<strong>💡 Popular requests:</strong>
• "Create a welcome system"
• "Add reaction roles"
• "Build an economy bot"
• "Fix permission errors"`;
    }
}

function attachFiles() {
    showNotification('File attachment feature coming soon!', 'info');
}

function addPackage() {
    const packageName = prompt('Enter package name (e.g., axios, moment):');
    if (packageName && packageName.trim()) {
        addPackageToList(packageName.trim());
        showNotification(`Added package: ${packageName}`, 'success');
    }
}

function addPackageToList(packageName) {
    const packageList = document.getElementById('packageList');
    const packageItem = document.createElement('div');
    packageItem.className = 'package-item';
    packageItem.innerHTML = `
        <i class="fas fa-cube"></i>
        <span>${packageName}</span>
        <span class="package-version">latest</span>
    `;
    packageList.appendChild(packageItem);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Code copied to clipboard');
    });
}

// Additional functions for collaboration and deployment
function openCollaboration() {
    alert('Collaboration features coming soon! Share your bot projects with team members.');
}

function deployBot() {
    alert('Deployment wizard coming soon! Deploy your bot to cloud platforms with one click.');
}

function toggleVoiceInput() {
    alert('Voice input feature coming soon! Talk to your AI assistant naturally.');
}

// Initialize AI assistant (legacy function)
function initializeAIAssistant() {
    console.log('AI Assistant legacy function - now handled by initializeAISystem');
}

// Make functions globally available for HTML onclick handlers
window.toggleAIAssistant = toggleAIAssistant;
window.switchAIMode = switchAIMode;
window.sendAIMessage = sendAIMessage;
window.askAI = askAI;
window.generateAdvancedBot = generateAdvancedBot;
window.runDeepAnalysis = runDeepAnalysis;
window.predictErrors = predictErrors;
window.securityScan = securityScan;
window.performanceAnalysis = performanceAnalysis;
window.quickAction = quickAction;
window.openCollaboration = openCollaboration;
window.deployBot = deployBot;
window.toggleVoiceInput = toggleVoiceInput;

console.log('🎉 Smart Serve IDE with Ultra-Advanced AI loaded successfully!');