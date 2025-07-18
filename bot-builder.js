// Check if device is mobile - allow all devices but optimize for desktop view
function isMobileDevice() {
    // Always return false to allow all devices
    return false;
}

// Discord login functionality
function loginWithDiscord() {
    // Simulate Discord OAuth flow
    const clientId = 'your_discord_client_id';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/discord');
    const scope = 'identify email';

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    // For demo purposes, simulate successful login
    setTimeout(() => {
        const mockUser = {
            id: '123456789',
            username: 'DiscordUser',
            avatar: 'https://cdn.discordapp.com/avatars/123456789/example.png'
        };
        handleSuccessfulLogin(mockUser);
    }, 2000);

    alert('Discord login initiated... (Demo mode)');
}

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

        // Use Discord avatar or fallback
        const avatarUrl = userData.avatar || `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;

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