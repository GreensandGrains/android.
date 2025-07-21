
// Bots Management System
document.addEventListener('DOMContentLoaded', function() {
    loadUserBots();
    setupEventListeners();
});

function setupEventListeners() {
    // Bot card menu handling
    document.addEventListener('click', function(e) {
        // Close all menus when clicking outside
        if (!e.target.closest('.bot-menu')) {
            document.querySelectorAll('.bot-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
        
        // Handle menu toggle
        if (e.target.classList.contains('bot-menu-btn')) {
            e.stopPropagation();
            const menu = e.target.nextElementSibling;
            
            // Close other menus
            document.querySelectorAll('.bot-menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        }
        
        // Handle delete action
        if (e.target.classList.contains('delete-bot-btn')) {
            const botId = e.target.dataset.botId;
            showDeleteConfirmation(botId);
        }
        
        // Handle edit action
        if (e.target.classList.contains('edit-bot-btn')) {
            const botId = e.target.dataset.botId;
            editBot(botId);
        }
    });
}

async function loadUserBots() {
    try {
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) {
            showEmptyState('Please log in to view your bots.');
            return;
        }

        // Load from localStorage for now
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userBots = getUserBotsFromStorage(userData.id);
        
        if (userBots.length === 0) {
            showEmptyState();
            return;
        }

        displayBots(userBots);
        
    } catch (error) {
        console.error('Error loading bots:', error);
        showEmptyState('Error loading bots. Please try again.');
    }
}

function getUserBotsFromStorage(userId) {
    const bots = [];
    
    // Get all projects from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('project_')) {
            try {
                const project = JSON.parse(localStorage.getItem(key));
                if (project.type === 'bot') {
                    bots.push(project);
                }
            } catch (error) {
                console.error('Error parsing project:', error);
            }
        }
    }
    
    // Also get completed orders as bots
    try {
        const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        orders.forEach(order => {
            if (order.status.includes('✅')) {
                bots.push({
                    id: `order_${order.orderNumber}`,
                    name: `Bot ${order.orderNumber}`,
                    type: 'bot',
                    status: 'completed',
                    createdAt: order.createdAt || Date.now(),
                    orderNumber: order.orderNumber,
                    content: order.content
                });
            }
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
    
    return bots.sort((a, b) => (b.lastModified || b.createdAt) - (a.lastModified || a.createdAt));
}

function displayBots(bots) {
    const botsGrid = document.getElementById('bots-grid');
    const emptyState = document.getElementById('empty-state');
    
    emptyState.style.display = 'none';
    botsGrid.innerHTML = '';
    
    bots.forEach(bot => {
        const botCard = createBotCard(bot);
        botsGrid.appendChild(botCard);
    });
}

function createBotCard(bot) {
    const card = document.createElement('div');
    card.className = 'bot-card';
    card.innerHTML = `
        <div class="bot-card-header">
            <div class="bot-icon">
                <i class="fas fa-robot"></i>
            </div>
            <div class="bot-menu">
                <button class="bot-menu-btn" aria-label="Bot options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="bot-menu-dropdown">
                    <button class="menu-item edit-bot-btn" data-bot-id="${bot.id}">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="menu-item delete-bot-btn" data-bot-id="${bot.id}">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
        
        <div class="bot-info">
            <h3 class="bot-name">${bot.name}</h3>
            <p class="bot-description">${bot.content ? bot.content.substring(0, 100) + '...' : 'No description available'}</p>
            
            <div class="bot-meta">
                <span class="bot-language">
                    <i class="fab fa-${bot.language === 'python' ? 'python' : 'js-square'}"></i>
                    ${bot.language || 'JavaScript'}
                </span>
                <span class="bot-date">
                    ${new Date(bot.createdAt).toLocaleDateString()}
                </span>
            </div>
            
            <div class="bot-status ${bot.status || 'draft'}">
                ${getStatusText(bot.status)}
            </div>
        </div>
        
        <div class="bot-actions">
            <button class="btn-primary" onclick="openBot('${bot.id}')">
                <i class="fas fa-code"></i>
                Open
            </button>
        </div>
    `;
    
    return card;
}

function getStatusText(status) {
    switch (status) {
        case 'completed': return '✅ Ready';
        case 'draft': return '📝 Draft';
        case 'running': return '🟢 Running';
        default: return '📝 Draft';
    }
}

function showEmptyState(message = null) {
    const botsGrid = document.getElementById('bots-grid');
    const emptyState = document.getElementById('empty-state');
    
    botsGrid.innerHTML = '';
    emptyState.style.display = 'flex';
    
    if (message) {
        const emptyMessage = emptyState.querySelector('p');
        if (emptyMessage) emptyMessage.textContent = message;
    }
}

function showDeleteConfirmation(botId) {
    const bot = findBotById(botId);
    if (!bot) return;
    
    const modal = document.createElement('div');
    modal.className = 'delete-modal-overlay';
    modal.innerHTML = `
        <div class="delete-modal">
            <div class="modal-header">
                <h3>Delete Bot</h3>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-content">
                <div class="warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete <strong>"${bot.name}"</strong>?</p>
                <p class="warning-text">This action cannot be undone. All code and data will be permanently removed.</p>
            </div>
            
            <div class="modal-actions">
                <button class="btn-cancel" onclick="this.parentElement.parentElement.parentElement.remove()">
                    Cancel
                </button>
                <button class="btn-delete" onclick="confirmDeleteBot('${botId}')">
                    <i class="fas fa-trash"></i>
                    Delete Bot
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function confirmDeleteBot(botId) {
    try {
        // Remove from localStorage
        if (botId.startsWith('project_')) {
            localStorage.removeItem(botId);
        } else if (botId.startsWith('order_')) {
            // Handle order-based bots
            const orderNumber = botId.replace('order_', '');
            // You might want to mark as deleted instead of removing completely
        }
        
        // Close modal
        document.querySelector('.delete-modal-overlay').remove();
        
        // Reload bots
        loadUserBots();
        
        // Show success message
        showNotification('Bot deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting bot:', error);
        showNotification('Failed to delete bot', 'error');
    }
}

function findBotById(botId) {
    if (botId.startsWith('project_')) {
        try {
            return JSON.parse(localStorage.getItem(botId));
        } catch (error) {
            return null;
        }
    }
    
    // Handle order-based bots
    const orderNumber = botId.replace('order_', '');
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const order = orders.find(o => o.orderNumber.toString() === orderNumber);
    
    if (order) {
        return {
            id: botId,
            name: `Bot ${order.orderNumber}`,
            content: order.content,
            createdAt: order.createdAt
        };
    }
    
    return null;
}

function editBot(botId) {
    const bot = findBotById(botId);
    if (!bot) return;
    
    // Redirect to coding environment
    const params = new URLSearchParams({
        project: bot.id,
        name: bot.name,
        language: bot.language || 'javascript'
    });
    
    window.location.href = `coding-environment.html?${params.toString()}`;
}

function openBot(botId) {
    editBot(botId);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Check user plan and enforce limits
function checkBotLimit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userPlan = userData.plan || 'starter';
    const userBots = getUserBotsFromStorage(userData.id);
    
    const planLimits = {
        starter: 3,
        premium: 5,
        pro: -1 // unlimited
    };
    
    const limit = planLimits[userPlan];
    
    if (limit !== -1 && userBots.length >= limit) {
        showNotification(`You've reached the ${userPlan} plan limit of ${limit} bots. Upgrade to create more bots.`, 'warning');
        return false;
    }
    
    return true;
}
