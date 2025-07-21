// Check if device is mobile - allow all devices but show desktop optimization message
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showMobileOptimizationNotice() {
    if (isMobileDevice()) {
        const notice = document.createElement('div');
        notice.className = 'mobile-optimization-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <i class="fas fa-desktop"></i>
                <p>For the best experience, we recommend using a desktop browser</p>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notice);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notice.parentElement) notice.remove();
        }, 10000);
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Show mobile optimization notice if needed
        showMobileOptimizationNotice();
        
        // Load user data and update UI
        loadUserData();

        // Initialize other components
        initializeOrderForm();
        initializeUserDropdown();
        
        console.log('✅ Bot builder initialized successfully');
    } catch (error) {
        console.error('❌ Bot builder initialization failed:', error);
        showNotification('Failed to initialize bot builder. Please refresh the page.', 'error');
    }
});

// Initialize order form functionality
function initializeOrderForm() {
    const sendBtn = document.getElementById('send-btn');
    const aiCreateBtn = document.getElementById('ai-create-btn');
    const fileUpload = document.getElementById('file-upload');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');

    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }

    if (aiCreateBtn) {
        aiCreateBtn.addEventListener('click', function() {
            if (popupOverlay) popupOverlay.style.display = 'flex';
        });
    }

    if (popupClose) {
        popupClose.addEventListener('click', function() {
            if (popupOverlay) popupOverlay.style.display = 'none';
        });
    }

    // Close popup when clicking outside
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }
}

// Initialize user dropdown functionality
function initializeUserDropdown() {
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Prevent dropdown from closing when clicking inside
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', function(event) {
            // Allow clicks on dropdown items to work normally
            if (event.target.classList.contains('dropdown-item') || 
                event.target.closest('.dropdown-item')) {
                // Let the click proceed normally
                return;
            }
            event.stopPropagation();
        });
    }
}

// Discord login functionality
function loginWithDiscord() {
    // Redirect to server-side Discord OAuth endpoint
    window.location.href = '/auth/discord';
}

// Load user data on page load
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!userData.username) {
        // No user data found, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Update all user elements
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const profileAvatarLarge = document.getElementById('profile-avatar-large');
    const profileUsername = document.getElementById('profile-username');
    const userProfileSection = document.getElementById('user-profile-section');

    // Construct proper Discord avatar URL
    let avatarUrl;
    if (userData.avatar) {
        // User has a custom avatar
        avatarUrl = userData.avatar.startsWith('http') 
            ? userData.avatar 
            : `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`;
    } else {
        // Use default Discord avatar based on discriminator or user ID
        const discriminator = userData.discriminator || (parseInt(userData.id) % 5);
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
    }

    // Update dropdown profile
    if (userAvatar) userAvatar.src = avatarUrl;
    if (userName) userName.textContent = userData.username;

    // Update profile section
    if (profileAvatarLarge) profileAvatarLarge.src = avatarUrl;
    if (profileUsername) profileUsername.textContent = userData.username;
    if (userProfileSection) userProfileSection.style.display = 'flex';

    // Load user usage and orders
    loadUserUsage();
    loadUserOrders();
}

// Load and display user usage statistics
async function loadUserUsage() {
    try {
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) return;

        const response = await fetch('/api/user/usage', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUsageDisplay(data);
        }
    } catch (error) {
        console.error('Error loading user usage:', error);
    }
}

function updateUsageDisplay(data) {
    const { usage, limits, plan } = data;
    
    // Update usage section
    const usageSection = document.querySelector('.usage-section');
    if (usageSection) {
        const usageHeader = usageSection.querySelector('.usage-header span:first-child');
        const usageText = usageSection.querySelector('.usage-text');
        const usageFill = usageSection.querySelector('.usage-fill');
        
        if (usageHeader) usageHeader.textContent = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
        
        // Calculate bot usage percentage
        let percentage = 0;
        if (limits.bots !== -1) {
            percentage = Math.min((usage.bots / limits.bots) * 100, 100);
        } else {
            percentage = 0; // Unlimited
        }
        
        if (usageFill) usageFill.style.width = `${percentage}%`;
        
        if (usageText) {
            if (limits.bots === -1) {
                usageText.textContent = `${usage.bots} bots created (Unlimited)`;
            } else {
                usageText.textContent = `${usage.bots}/${limits.bots} bots used`;
            }
        }
        
        // Update color based on usage
        if (usageFill) {
            if (percentage > 90) {
                usageFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            } else if (percentage > 70) {
                usageFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                usageFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            }
        }
    }
}

// Load user orders
async function loadUserOrders() {
    try {
        const sessionToken = sessionStorage.getItem('serverSessionToken');
        if (!sessionToken) return;

        const response = await fetch('/api/user/orders', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            const orderCountElement = document.getElementById('order-count');
            if (orderCountElement) {
                orderCountElement.textContent = orders.length || 0;
            }
        }
    } catch (error) {
        console.error('Error loading user orders:', error);
    }
}

// User dropdown functionality
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Handle logout function
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = 'login.html';
    }
}

let attachedFiles = [];

// Handle send button click
function handleSendMessage() {
    const content = document.getElementById('bot-content').value.trim();
    
    if (!content && attachedFiles.length === 0) {
        showNotification('Please enter a description or attach files', 'warning');
        return;
    }

    // Create project with AI chat
    const projectData = {
        id: 'ai_project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: 'AI Bot Project',
        description: content,
        files: attachedFiles,
        type: 'ai-chat',
        createdAt: Date.now()
    };

    // Save project
    localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData));

    // Redirect to coding environment with AI chat
    const params = new URLSearchParams({
        project: projectData.id,
        type: 'ai-chat',
        description: encodeURIComponent(content),
        files: attachedFiles.length
    });

    window.location.href = `coding-environment.html?${params.toString()}`;
}

// Handle file upload
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const attachedFilesContainer = document.getElementById('attached-files');

    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification(`File "${file.name}" is too large (max 10MB)`, 'error');
            return;
        }

        const fileObj = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        };

        attachedFiles.push(fileObj);
        displayAttachedFile(fileObj);
    });

    if (attachedFiles.length > 0) {
        attachedFilesContainer.style.display = 'block';
    }

    // Clear input
    event.target.value = '';
}

// Display attached file
function displayAttachedFile(fileObj) {
    const attachedFilesContainer = document.getElementById('attached-files');
    
    const fileElement = document.createElement('div');
    fileElement.className = 'attached-file';
    fileElement.dataset.fileId = fileObj.id;
    
    const iconClass = getFileIcon(fileObj.type);
    const fileSize = formatFileSize(fileObj.size);
    
    fileElement.innerHTML = `
        <i class="${iconClass} file-icon"></i>
        <span class="file-name">${fileObj.name}</span>
        <span class="file-size">${fileSize}</span>
        <button class="remove-file" onclick="removeAttachedFile('${fileObj.id}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    attachedFilesContainer.appendChild(fileElement);
}

// Remove attached file
function removeAttachedFile(fileId) {
    attachedFiles = attachedFiles.filter(file => file.id !== fileId);
    
    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileElement) {
        fileElement.remove();
    }
    
    if (attachedFiles.length === 0) {
        document.getElementById('attached-files').style.display = 'none';
    }
}

// Get file icon based on type
function getFileIcon(type) {
    if (type.startsWith('image/')) return 'fas fa-image';
    if (type.startsWith('video/')) return 'fas fa-video';
    if (type.includes('python')) return 'fab fa-python';
    if (type.includes('javascript')) return 'fab fa-js-square';
    if (type.includes('json')) return 'fas fa-code';
    if (type.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Navigation functions for sidebar
function goToDeployments() { 
    window.location.href = 'coming-soon.html'; 
}

function goToTeams() { 
    window.location.href = 'coming-soon.html'; 
}

function goToLearn() { 
    window.location.href = 'coming-soon.html'; 
}

function goToQuests() { 
    window.location.href = 'coming-soon.html'; 
}

function goToMarketplace() { 
    window.location.href = 'coming-soon.html'; 
}

function openUpgradeModal() { 
    showPricing(); 
}

function showPricing() {
    const pricingOverlay = document.getElementById('pricing-overlay');
    if (pricingOverlay) {
        pricingOverlay.style.display = 'flex';
    }
}

// Moderation template functionality
function openModerationTemplate() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userPlan = userData.plan || 'starter';
    
    const commandLimits = {
        starter: 50,
        premium: 100,
        pro: -1 // unlimited
    };
    
    const maxCommands = commandLimits[userPlan];
    
    showModerationCommandSelection(maxCommands);
}

function showModerationCommandSelection(maxCommands) {
    const modal = document.createElement('div');
    modal.className = 'moderation-modal-overlay';
    modal.id = 'moderation-modal';
    
    const moderationCommands = [
        { name: 'ban', description: 'Ban a user from the server', category: 'Punishment' },
        { name: 'kick', description: 'Kick a user from the server', category: 'Punishment' },
        { name: 'mute', description: 'Mute a user in the server', category: 'Punishment' },
        { name: 'unmute', description: 'Unmute a previously muted user', category: 'Punishment' },
        { name: 'warn', description: 'Give a warning to a user', category: 'Punishment' },
        { name: 'timeout', description: 'Timeout a user for specified duration', category: 'Punishment' },
        { name: 'clear', description: 'Clear/delete multiple messages', category: 'Moderation' },
        { name: 'lock', description: 'Lock a channel', category: 'Channel Management' },
        { name: 'unlock', description: 'Unlock a channel', category: 'Channel Management' },
        { name: 'slowmode', description: 'Set slowmode for a channel', category: 'Channel Management' },
        { name: 'announce', description: 'Make announcements', category: 'Communication' },
        { name: 'say', description: 'Make the bot say something', category: 'Communication' },
        { name: 'embed', description: 'Send embedded messages', category: 'Communication' },
        { name: 'poll', description: 'Create polls', category: 'Communication' },
        { name: 'role', description: 'Manage user roles', category: 'Role Management' },
        { name: 'autorole', description: 'Auto-assign roles to new members', category: 'Role Management' },
        { name: 'reaction-role', description: 'Create reaction roles', category: 'Role Management' },
        { name: 'userinfo', description: 'Get information about a user', category: 'Information' },
        { name: 'serverinfo', description: 'Get server information', category: 'Information' },
        { name: 'warnings', description: 'View user warnings', category: 'Information' },
        { name: 'modlogs', description: 'View moderation logs', category: 'Information' },
        { name: 'automod', description: 'Auto-moderation settings', category: 'Automation' },
        { name: 'filter', description: 'Message filtering', category: 'Automation' },
        { name: 'antispam', description: 'Anti-spam protection', category: 'Automation' },
        { name: 'antiraid', description: 'Anti-raid protection', category: 'Automation' },
        { name: 'backup', description: 'Server backup functionality', category: 'Utility' },
        { name: 'ticket', description: 'Support ticket system', category: 'Utility' },
        { name: 'giveaway', description: 'Giveaway system', category: 'Utility' },
        { name: 'welcome', description: 'Welcome message system', category: 'Utility' },
        { name: 'leave', description: 'Leave message system', category: 'Utility' },
        { name: 'level', description: 'Leveling system', category: 'Utility' }
    ];
    
    const categories = [...new Set(moderationCommands.map(cmd => cmd.category))];
    
    modal.innerHTML = `
        <div class="moderation-modal">
            <div class="modal-header">
                <h2>🛡️ Moderation Bot Commands</h2>
                <p>Select up to ${maxCommands === -1 ? 'unlimited' : maxCommands} commands for your moderation bot</p>
                <button class="close-modal" onclick="closeModerationModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-content">
                <div class="command-stats">
                    <span id="selected-count">0</span> / ${maxCommands === -1 ? '∞' : maxCommands} commands selected
                    ${maxCommands !== -1 ? `<span class="upgrade-note">Upgrade for more commands</span>` : ''}
                </div>
                
                <div class="command-categories">
                    ${categories.map(category => `
                        <div class="command-category">
                            <h3>${category}</h3>
                            <div class="command-list">
                                ${moderationCommands.filter(cmd => cmd.category === category).map(cmd => `
                                    <label class="command-item">
                                        <input type="checkbox" name="commands" value="${cmd.name}" />
                                        <div class="command-info">
                                            <span class="command-name">/${cmd.name}</span>
                                            <span class="command-desc">${cmd.description}</span>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModerationModal()">Cancel</button>
                <button class="btn-generate" id="generate-bot-btn" disabled onclick="generateModerationBot()">
                    <i class="fas fa-code"></i>
                    Generate Bot
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add event listeners for command selection
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const selectedCountElement = document.getElementById('selected-count');
    const generateBtn = document.getElementById('generate-bot-btn');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedCount = modal.querySelectorAll('input[type="checkbox"]:checked').length;
            selectedCountElement.textContent = selectedCount;
            
            // Disable checkboxes if limit reached
            if (maxCommands !== -1 && selectedCount >= maxCommands) {
                checkboxes.forEach(cb => {
                    if (!cb.checked) cb.disabled = true;
                });
            } else {
                checkboxes.forEach(cb => cb.disabled = false);
            }
            
            // Enable/disable generate button
            generateBtn.disabled = selectedCount === 0;
        });
    });
}

function closeModerationModal() {
    const modal = document.getElementById('moderation-modal');
    if (modal) {
        modal.remove();
    }
}

async function generateModerationBot() {
    const modal = document.getElementById('moderation-modal');
    const selectedCommands = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    
    if (selectedCommands.length === 0) {
        alert('Please select at least one command');
        return;
    }
    
    try {
        // Close modal
        closeModerationModal();
        
        // Create project data
        const projectData = {
            id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: 'Moderation Bot',
            language: 'python',
            type: 'bot',
            createdAt: Date.now(),
            lastModified: Date.now(),
            selectedCommands: selectedCommands
        };
        
        // Save to localStorage
        localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData));
        
        // Generate the bot code
        const botCode = generateModerationBotCode(selectedCommands);
        
        // Redirect to coding environment with the generated code
        const params = new URLSearchParams({
            project: projectData.id,
            language: 'python',
            name: 'Moderation Bot',
            template: 'moderation',
            commands: selectedCommands.join(',')
        });
        
        window.location.href = `coding-environment.html?${params.toString()}`;
        
    } catch (error) {
        console.error('Error generating moderation bot:', error);
        alert('Failed to generate bot. Please try again.');
    }
}

// Close pricing modal
document.addEventListener('DOMContentLoaded', function() {
    const closePricing = document.getElementById('close-pricing');
    const pricingOverlay = document.getElementById('pricing-overlay');

    if (closePricing) {
        closePricing.addEventListener('click', function() {
            if (pricingOverlay) pricingOverlay.style.display = 'none';
        });
    }

    if (pricingOverlay) {
        pricingOverlay.addEventListener('click', function(e) {
            if (e.target === pricingOverlay) {
                pricingOverlay.style.display = 'none';
            }
        });
    }
});

// Handle successful login
function handleSuccessfulLogin(user) {
    // Store user data
    localStorage.setItem('userData', JSON.stringify(user));

    // Update UI
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userProfileSection = document.getElementById('user-profile-section');

    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) {
        userProfile.style.display = 'flex';
        document.getElementById('user-avatar').src = user.avatar || 'https://via.placeholder.com/40x40/ffffff/000000?text=U';
        document.getElementById('user-name').textContent = user.username;
    }

    // Update profile section
    const profileSection = document.getElementById('user-profile-section');
    const profileAvatar = document.getElementById('profile-avatar-large');
    const profileUsername = document.getElementById('profile-username');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    const userData = JSON.parse(localStorage.getItem('userData'));

    if (profileSection && userData) {
        profileSection.style.display = 'flex';

        // Construct proper Discord avatar URL
        let avatarUrl;
        if (userData.avatar) {
            // User has a custom avatar
            avatarUrl = userData.avatar.startsWith('http') 
                ? userData.avatar 
                : `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`;
        } else {
            // Use default Discord avatar based on discriminator or user ID
            const discriminator = userData.discriminator || (parseInt(userData.id) % 5);
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
        }

        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (profileUsername) profileUsername.textContent = userData.username || 'User';
        if (userAvatar) userAvatar.src = avatarUrl;
        if (userName) userName.textContent = userData.username || 'User';
    }
}

        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (profileUsername) profileUsername.textContent = userData.username || 'User';
        if (userAvatar) userAvatar.src = avatarUrl;
        if (userName) userName.textContent = userData.username || 'User';
    }
}

// Check for existing login
function checkExistingLogin() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        handleSuccessfulLogin(user);
    }
}

// Bot Project Creation
function createBotProject(language) {
    const modal = document.createElement('div');
    modal.className = 'bot-project-modal';
    modal.id = 'bot-project-modal';
    
    const languageConfig = {
        python: {
            name: 'Python',
            icon: 'fab fa-python',
            iconStyle: 'background: linear-gradient(135deg, #3776ab, #ffd43b); color: white;'
        },
        javascript: {
            name: 'JavaScript',
            icon: 'fab fa-js-square',
            iconStyle: 'background: linear-gradient(135deg, #f7df1e, #323330); color: #323330;'
        }
    };
    
    const config = languageConfig[language];
    
    modal.innerHTML = `
        <div class="bot-project-content">
            <div class="bot-project-header">
                <div class="project-language-icon" style="${config.iconStyle}">
                    <i class="${config.icon}"></i>
                </div>
                <div>
                    <h3>Create ${config.name} Bot</h3>
                    <p>Start building your ${language} bot project</p>
                </div>
            </div>
            
            <div class="form-group">
                <label for="bot-project-name">Bot Name</label>
                <input type="text" id="bot-project-name" placeholder="My Awesome Bot" />
            </div>
            
            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeBotProjectModal()">Cancel</button>
                <button class="btn-create" onclick="startBotProject('${language}')">Start Coding</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus input
    document.getElementById('bot-project-name').focus();
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBotProjectModal();
        }
    });
    
    // Enter key to create
    document.getElementById('bot-project-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBotProject(language);
        }
    });
}

function closeBotProjectModal() {
    const modal = document.getElementById('bot-project-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

async function startBotProject(language) {
    const botName = document.getElementById('bot-project-name').value.trim();
    
    if (!botName) {
        alert('Please enter a bot name');
        return;
    }
    
    try {
        // Create project data
        const projectData = {
            id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: botName,
            language: language,
            type: 'bot',
            createdAt: Date.now(),
            lastModified: Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem(`project_${projectData.id}`, JSON.stringify(projectData));
        
        // Save to server if logged in
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (sessionToken) {
            try {
                await fetch('/api/projects/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    body: JSON.stringify(projectData)
                });
            } catch (error) {
                console.log('Could not save to server, saved locally');
            }
        }
        
        // Close modal
        closeBotProjectModal();
        
        // Redirect to coding environment
        window.location.href = `coding-environment.html?project=${projectData.id}&language=${language}&name=${encodeURIComponent(botName)}`;
        
    } catch (error) {
        console.error('Error creating bot project:', error);
        alert('Failed to create project. Please try again.');
    }
}

// Show pricing overlay
function showPricing() {
    const pricingOverlay = document.getElementById('pricing-overlay');
    if (pricingOverlay) {
        pricingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide pricing overlay
function hidePricing() {
    const pricingOverlay = document.getElementById('pricing-overlay');
    if (pricingOverlay) {
        pricingOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Update user profile display
function updateUserProfile() {
    const user = authSystem.getCurrentUser();
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (user && userProfile) {
        userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.avatar || 'https://via.placeholder.com/40x40/ffffff/000000?text=U';
        if (userName) userName.textContent = user.username || 'User';
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Show waiting message function
function showWaitingMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'waiting-overlay';
    overlay.innerHTML = `
        <div class="waiting-modal">
            <div class="waiting-animation">
                <div class="clock-container">
                    <i class="fas fa-clock"></i>
                    <div class="clock-hands">
                        <div class="hour-hand"></div>
                        <div class="minute-hand"></div>
                    </div>
                </div>
            </div>
            <h3>Order Submitted Successfully!</h3>
            <p>Please wait approximately <strong>2 hours</strong> for a reply in Discord.</p>
            <p>Our team will review your request and contact you soon.</p>
            <button class="close-waiting" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => overlay.classList.add('show'), 100);

    // Auto remove after 10 seconds
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }, 10000);
}

// Load user orders function
async function loadUserOrders() {
    try {
        const response = await fetch('/api/user/orders', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            displayUserOrders(orders);
        }
    } catch (error) {
        console.error('Failed to load user orders:', error);
    }
}

// Display user orders function
function displayUserOrders(orders) {
    let ordersContainer = document.getElementById('user-orders');

    if (!ordersContainer) {
        // Create orders container
        ordersContainer = document.createElement('div');
        ordersContainer.id = 'user-orders';
        ordersContainer.className = 'user-orders-section';

        const orderHeader = document.createElement('div');
        orderHeader.className = 'orders-header';
        orderHeader.innerHTML = `
            <h2><i class="fas fa-history"></i> Your Bot Orders</h2>
            <span class="order-count">${orders.length} order(s)</span>
        `;

        ordersContainer.appendChild(orderHeader);

        // Insert after the form
        const form = document.querySelector('.bot-builder-form');
        form.parentNode.insertBefore(ordersContainer, form.nextSibling);
    }

    // Clear existing orders (except header)
    const existingCards = ordersContainer.querySelectorAll('.order-card');
    existingCards.forEach(card => card.remove());

    // Update order count
    const orderCount = ordersContainer.querySelector('.order-count');
    if (orderCount) {
        orderCount.textContent = `${orders.length} order(s)`;
    }

    // Add order cards
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.orderNumber}</h3>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase().replace(/[^a-z]/g, '')}">${order.status}</div>
            </div>
            <div class="order-content">
                <p>${order.content}</p>
            </div>
            <div class="order-actions">
                <button class="btn-view" onclick="viewOrderDetails('${order.orderId}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${order.status === '⏳ Pending Admin Response' ? 
                    `<button class="btn-cancel" onclick="cancelOrder(${order.orderNumber})">
                        <i class="fas fa-times"></i> Cancel
                    </button>` : ''}
            </div>
        `;

        ordersContainer.appendChild(orderCard);
    });
}

// View order details function
function viewOrderDetails(orderId) {
    // Implementation for viewing order details
    showNotification('Order details feature coming soon!', 'info');
}

// Cancel order function
async function cancelOrder(orderNumber) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const response = await fetch('/api/order/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
            },
            body: JSON.stringify({ orderNumber })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Order cancelled successfully!', 'success');
            await loadUserOrders(); // Refresh the display
        } else {
            showNotification(result.error || 'Failed to cancel order.', 'error');
        }
    } catch (error) {
        showNotification('Failed to cancel order. Please try again.', 'error');
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check for mobile device and redirect
    if (isMobileDevice()) {
        window.location.href = 'mobile-warning.html';
        return;
    }

    // Security check - ensure user is authenticated
    if (window.authSystem && !window.authSystem.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Get elements
    const aiCreateBtn = document.getElementById('ai-create-btn');
    const makeOrderBtn = document.getElementById('make-order-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');
    const navItems = document.querySelectorAll('.nav-item');
    const botContentTextarea = document.getElementById('bot-content');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileDropdown = document.querySelector('.profile-dropdown');

    // AI Create button click handler
    aiCreateBtn.addEventListener('click', function() {
        if (!this.classList.contains('disabled')) {
            showPopup();
        }
    });

    // Make Order button click handler
    makeOrderBtn.addEventListener('click', async function() {
        // Add ripple effect
        createRippleEffect(this);

        // Get bot content
        const botContent = document.getElementById('bot-content').value.trim();

        if (!botContent) {
            showNotification('Please enter bot content before placing an order.', 'error');
            return;
        }

        // Show animated loading state
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
        this.classList.add('processing');

        // Add pulsing animation to the entire form
        const form = document.querySelector('.bot-builder-form');
        form.classList.add('submitting');

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('sessionToken')}`
                },
                body: JSON.stringify({ content: botContent })
            });

            const result = await response.json();

            if (result.success) {
                // Show success animation
                this.innerHTML = '<i class="fas fa-check"></i> Order Submitted!';
                this.classList.remove('processing');
                this.classList.add('success');

                // Show waiting message with animation
                showWaitingMessage();

                // Clear the form
                document.getElementById('bot-content').value = '';

                // Refresh user orders display
                await loadUserOrders();

                // Reset button after animation
                setTimeout(() => {
                    this.classList.remove('success');
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Make an Order';
                    this.disabled = false;
                }, 3000);

            } else {
                showNotification(result.error || 'Failed to submit order. Please try again.', 'error');
                this.classList.remove('processing');
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> Make an Order';
                this.disabled = false;
            }
        } catch (error) {
            showNotification('Failed to submit order. Please ensure you are logged in and try again.', 'error');
            this.classList.remove('processing');
            this.innerHTML = '<i class="fas fa-shopping-cart"></i> Make an Order';
            this.disabled = false;
        } finally {
            form.classList.remove('submitting');
        }
    });

    // Popup close handlers
    popupClose.addEventListener('click', hidePopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            hidePopup();
        }
    });

    // Navigation item click handlers
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Handle navigation based on the clicked item
            const itemText = this.querySelector('span').textContent;
            handleNavigation(itemText);
        });
    });

    // Auto-resize textarea
    botContentTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Profile dropdown functionality
    profileAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    // Close profile dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to close popup or profile menu
        if (e.key === 'Escape') {
            if (popupOverlay.classList.contains('active')) {
                hidePopup();
            }
            if (profileDropdown.classList.contains('active')) {
                profileDropdown.classList.remove('active');
            }
        }

        // Ctrl+Enter to trigger make order
        if (e.ctrlKey && e.key === 'Enter') {
            makeOrderBtn.click();
        }
    });

    // Initialize animations
    initializeAnimations();

    // Check for existing login
    checkExistingLogin();

    // Update user profile display
    updateUserProfile();

    // Load user orders
    loadUserOrders();

    // Pricing overlay events
    const closePricing = document.getElementById('close-pricing');
    const pricingOverlay = document.getElementById('pricing-overlay');

    if (closePricing) {
        closePricing.addEventListener('click', hidePricing);
    }

    if (pricingOverlay) {
        pricingOverlay.addEventListener('click', function(e) {
            if (e.target === pricingOverlay) {
                hidePricing();
            }
        });
    }

    // Ensure sidebar is always visible on desktop
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
    sidebar.style.transform = 'translateX(0)';

    // Ensure usage section is always visible
    const usageSection = document.querySelector('.usage-section');
    if (usageSection) {
        usageSection.style.display = 'block';
        usageSection.style.visibility = 'visible';
        usageSection.style.opacity = '1';
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to close pricing
        if (e.key === 'Escape') {
            hidePricing();
        }
    });
});

// Show popup function
function showPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide popup function
function hidePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    popupOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle navigation
function handleNavigation(itemText) {
    switch(itemText) {
        case 'Home':
            // Navigate to home page
            window.location.href = 'index.html';
            break;
        case 'Template':
            // Current page - do nothing or refresh content
            console.log('Template section selected');
            break;
        case 'Custom':
            // Custom bot functionality
            showCustomOptions();
            break;
        case 'Advanced':
            // Advanced features
            showAdvancedFeatures();
            break;
        default:
            console.log('Navigation item:', itemText);
    }
}

// Show custom options
function showCustomOptions() {
    const contentHeader = document.querySelector('.content-header');
    contentHeader.innerHTML = `
        <h1>Custom Bot Builder</h1>
        <p>Design your bot from scratch with advanced customization options</p>
    `;

    // Add custom form elements
    const form = document.querySelector('.bot-builder-form');
    form.innerHTML = `
        <div class="form-group">
            <label for="bot-name">Bot Name</label>
            <input type="text" id="bot-name" placeholder="Enter bot name..." />
        </div>
        <div class="form-group">
            <label for="bot-type">Bot Type</label>
            <select id="bot-type">
                <option value="chatbot">Chatbot</option>
                <option value="assistant">Virtual Assistant</option>
                <option value="support">Support Bot</option>
                <option value="sales">Sales Bot</option>
            </select>
        </div>
        <div class="form-group">
            <label for="bot-content">Bot Content</label>
            <textarea id="bot-content" placeholder="Say your content..." rows="8"></textarea>
        </div>
        <div class="button-group">
            <button class="btn-ai-create disabled" id="ai-create-btn">
                <i class="fas fa-magic"></i>
                <span class="strikethrough">Create by AI</span>
            </button>
            <button class="btn-make-order" id="make-order-btn">
                <i class="fas fa-shopping-cart"></i>
                Make an Order
            </button>
        </div>
    `;

    // Re-initialize event listeners
    reinitializeEventListeners();
}

// Show advanced features
function showAdvancedFeatures() {
    const contentHeader = document.querySelector('.content-header');
    contentHeader.innerHTML = `
        <h1>Advanced Bot Features</h1>
        <p>Unlock the full potential of AI-powered automation</p>
    `;

    // Add advanced form elements
    const form = document.querySelector('.bot-builder-form');
    form.innerHTML = `
        <div class="form-group">
            <label for="integration-apis">API Integrations</label>
            <input type="text" id="integration-apis" placeholder="Slack, Discord, Teams..." />
        </div>
        <div class="form-group">
            <label for="ai-model">AI Model</label>
            <select id="ai-model">
                <option value="gpt-4">GPT-4</option>
                <option value="claude">Claude</option>
                <option value="custom">Custom Model</option>
            </select>
        </div>
        <div class="form-group">
            <label for="bot-content">Advanced Configuration</label>
            <textarea id="bot-content" placeholder="Enter advanced bot configuration..." rows="10"></textarea>
        </div>
        <div class="button-group">
            <button class="btn-ai-create disabled" id="ai-create-btn">
                <i class="fas fa-magic"></i>
                <span class="strikethrough">Create by AI</span>
            </button>
            <button class="btn-make-order" id="make-order-btn">
                <i class="fas fa-shopping-cart"></i>
                Make an Order
            </button>
        </div>
    `;

    // Re-initialize event listeners
    reinitializeEventListeners();
}

// Re-initialize event listeners after content change
function reinitializeEventListeners() {
    const aiCreateBtn = document.getElementById('ai-create-btn');
    const makeOrderBtn = document.getElementById('make-order-btn');

    if (aiCreateBtn) {
        aiCreateBtn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                showPopup();
            }
        });
    }

    if (makeOrderBtn) {
        makeOrderBtn.addEventListener('click', function() {
            createRippleEffect(this);
            setTimeout(() => {
                alert('Order request submitted! Our team will contact you soon.');
            }, 300);
        });
    }
}

// Navigation functions
function goToDeployments() {
    window.location.href = 'coming-soon.html';
}

function goToTeams() {
    window.location.href = 'coming-soon.html';
}

function goToLearn() {
    window.location.href = 'coming-soon.html';
}

function goToQuests() {
    window.location.href = 'coming-soon.html';
}

function goToMarketplace() {
    window.location.href = 'coming-soon.html';
}

function openUpgradeModal() {
    window.open('upgrade.html', '_blank', 'width=1200,height=800');
}

// Create ripple effect
function createRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        width: ${size}px;
        height: ${size}px;
        left: ${rect.width / 2 - size / 2}px;
        top: ${rect.height / 2 - size / 2}px;
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Initialize animationfunction initializeAnimations() {
    // Animate sidebar items on hover
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Animate form elements on focus
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });

        element.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Profile menu functions
function goToUsage() {
    window.location.href = 'coming-soon.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function goToHelp() {
    window.location.href = 'coming-soon.html';
}
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        if (window.authSystem) {
            window.authSystem.logout('User initiated logout');
        } else {
            // Fallback
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    }
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }

    input, select {
        width: 100%;
        padding: 15px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(42, 42, 42, 0.8);
color: var(--text-primary);
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    input:focus, select:focus {
        outline: none;
        border-color: var(--pure-white);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
    }

    select {
        cursor: pointer;
    }

    option {
        background: var(--secondary-black);
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

// Display user orders function
function displayUserOrders(orders) {
    let ordersContainer = document.getElementById('user-orders');

    if (!ordersContainer) {
        // Create orders container
        ordersContainer = document.createElement('div');
        ordersContainer.id = 'user-orders';
        ordersContainer.className = 'user-orders-section';

        const orderHeader = document.createElement('div');
        orderHeader.className = 'orders-header';
        orderHeader.innerHTML = `
            <h2><i class="fas fa-history"></i> Your Bot Orders</h2>
            <span class="order-count">${orders.length} order(s)</span>
        `;

        ordersContainer.appendChild(orderHeader);

        // Insert after the form
        const form = document.querySelector('.bot-builder-form');
        form.parentNode.insertBefore(ordersContainer, form.nextSibling);
    }

    // Clear existing orders (except header)
    const existingCards = ordersContainer.querySelectorAll('.order-card');
    existingCards.forEach(card => card.remove());

    // Update order count
    const orderCount = ordersContainer.querySelector('.order-count');
    if (orderCount) {
        orderCount.textContent = `${orders.length} order(s)`;
    }

    // Add order cards
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.orderNumber}</h3>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase().replace(/[^a-z]/g, '')}">${order.status}</div>
            </div>
            <div class="order-content">
                <p>${order.content}</p>
            </div>
            <div class="order-actions">
                <button class="btn-view" onclick="viewOrderDetails('${order.orderId}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${order.status === '⏳ Pending Admin Response' ? 
                    `<button class="btn-cancel" onclick="cancelOrder(${order.orderNumber})">
                        <i class="fas fa-times"></i> Cancel
                    </button>` : ''}
            </div>
        `;

        ordersContainer.appendChild(orderCard);
    });
}

// Display user orders function
function displayUserOrders(orders) {
    let ordersContainer = document.getElementById('user-orders');

    if (!ordersContainer) {
        // Create orders container
        ordersContainer = document.createElement('div');
        ordersContainer.id = 'user-orders';
        ordersContainer.className = 'user-orders-section';

        const orderHeader = document.createElement('div');
        orderHeader.className = 'orders-header';
        orderHeader.innerHTML = `
            <h2><i class="fas fa-history"></i> Your Bot Orders</h2>
            <span class="order-count">${orders.length} order(s)</span>
        `;

        ordersContainer.appendChild(orderHeader);

        // Insert after the form
        const form = document.querySelector('.bot-builder-form');
        form.parentNode.insertBefore(ordersContainer, form.nextSibling);
    }

    // Clear existing orders (except header)
    const existingCards = ordersContainer.querySelectorAll('.order-card');
    existingCards.forEach(card => card.remove());

    // Update order count
    const orderCount = ordersContainer.querySelector('.order-count');
    if (orderCount) {
        orderCount.textContent = `${orders.length} order(s)`;
    }

    // Add order cards
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <div class="order-number">Order #${order.orderNumber}</div>
                    <div class="order-status ${order.status.includes('✅') ? 'status-completed' : order.status.includes('❌') ? 'status-cancelled' : 'status-pending'}">${order.status}</div>
                </div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="order-content">
                <p>${order.content}</p>
            </div>
            <div class="order-actions">
                <button class="view-code-btn" data-order="${order.orderNumber}">
                    <i class="fas fa-code"></i> View Code
                </button>
                ${order.status === '⏳ Pending Admin Response' ? 
                    `<button class="cancel-order-btn" data-order="${order.orderNumber}">
                        <i class="fas fa-times"></i> Cancel Order
                    </button>` : ''
                }
            </div>
        `;

        ordersContainer.appendChild(orderCard);
    });

    // Add event listeners to cancel buttons
    const cancelButtons = ordersContainer.querySelectorAll('.cancel-order-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const orderNumber = this.dataset.order;
            await cancelOrder(orderNumber);
        });
    });

    // Add event listeners to view code buttons
    const viewCodeButtons = ordersContainer.querySelectorAll('.view-code-btn');
    viewCodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderNumber = this.dataset.order;
            window.location.href = `coding-environment.html?order=${orderNumber}`;
        });
    });
}