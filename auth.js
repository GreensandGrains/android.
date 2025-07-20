

// Authentication Security System
class AuthSystem {
    constructor() {
        this.protectedPages = [
            'bot-builder.html',
            'template.html'
        ];
        this.loginPage = 'login.html';
        this.publicPages = [
            'index.html',
            'coming-soon.html',
            'mobile-warning.html'
        ];
        this.init();
    }

    init() {
        // Don't run auth checks if we're in an iframe
        if (window.self !== window.top) {
            return;
        }
        // Don't run auth checks during OAuth callback
        if (sessionStorage.getItem('authComplete') === 'true') {
            sessionStorage.removeItem('authComplete');
            return;
        }
        
        
        this.checkPageAccess();
        this.setupSessionTimeout();
        this.addSecurityHeaders();
    }

    // Check if current page requires authentication
    checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Don't redirect if we're already on the login page
        if (currentPage === this.loginPage) {
            return;
        }
        
        if (this.protectedPages.includes(currentPage)) {
            if (!this.isAuthenticated()) {
                console.log('User not authenticated, redirecting to login');
                this.redirectToLogin();
                return;
            }
            
            // Additional security checks for authenticated users
            if (!this.validateSession()) {
                this.logout('Session expired');
                return;
            }
        }
        
        // If user is logged in and tries to access login page, redirect to dashboard
        if (currentPage === this.loginPage && this.isAuthenticated()) {
            try {
                window.location.replace('bot-builder.html');
            } catch (error) {
                window.location.href = 'bot-builder.html';
            }
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
                try {
            const userData = localStorage.getItem('userData');
            const sessionToken = sessionStorage.getItem('sessionToken');
            const loginTimestamp = localStorage.getItem('loginTimestamp');
            
            console.log('Auth check:', { 
                hasUserData: !!userData, 
                hasSessionToken: !!sessionToken, 
                hasLoginTimestamp: !!loginTimestamp 
            });
            
            if (!userData || !sessionToken || !loginTimestamp) {
                console.log('Missing auth data');
                return false;
            }

            // Parse and validate user data
            const user = JSON.parse(userData);
            if (!user.id || !user.username) {
                console.log('Invalid user data structure');
                return false;
            }

            // Check if session is still valid (24 hours)
            const sessionAge = Date.now() - parseInt(loginTimestamp);
            const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge > sessionTimeout) {
                console.log('Session expired');
                this.logout('Session expired');
                return false;
            }

            console.log('User authenticated successfully');
            return true;
        } catch (error) {
            console.error('Authentication check error:', error);
            // Clear corrupted data
            localStorage.removeItem('userData');
            sessionStorage.clear();
            return false;
        }
    }

    // Validate session integrity
    validateSession() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const sessionToken = sessionStorage.getItem('sessionToken');
            
            // Basic validation - in production, this would be server-side
            if (!userData.id || !userData.username || !sessionToken) {
                return false;
            }

            // For Discord OAuth users, we trust the server-provided session
            if (sessionStorage.getItem('serverSessionToken')) {
                return true;
            }

            // Check for session tampering for other login methods
            const expectedToken = this.generateSessionToken(userData.id);
            if (sessionToken !== expectedToken) {
                console.warn('Session token mismatch detected');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }

    // Generate session token (simplified for demo)
    generateSessionToken(userId) {
        const secret = 'smart-serve-secret-key'; // In production, use secure server-side generation
        const timestamp = localStorage.getItem('loginTimestamp');
        return btoa(userId + secret + timestamp).slice(0, 32);
    }

    // Handle successful login
    handleLogin(userData, rememberMe = false) {
        const loginTimestamp = Date.now().toString();
        const sessionToken = this.generateSessionToken(userData.id);
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('loginTimestamp', loginTimestamp);
        sessionStorage.setItem('sessionToken', sessionToken);
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Log security event
        this.logSecurityEvent('login', userData.id);
        
        // Redirect to dashboard
        window.location.href = 'bot-builder.html';
    }

    // Handle logout
    logout(reason = 'User logout') {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.logSecurityEvent('logout', user.id, reason);
                
                // Call server logout if we have a server session
                const serverSessionToken = sessionStorage.getItem('serverSessionToken');
                if (serverSessionToken) {
                    fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serverSessionToken}`
                        }
                    }).catch(error => console.error('Server logout error:', error));
                }
            } catch (error) {
                console.error('Error logging logout event:', error);
            }
        }

        // Clear all authentication data
        localStorage.removeItem('userData');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('rememberMe');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = 'index.html';
    }

    // Redirect to login page
    redirectToLogin() {
        const currentPage = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPage);
        
        // Use replace instead of href to avoid security issues
        try {
            window.location.replace(this.loginPage);
        } catch (error) {
            // Fallback for iframe or security restrictions
            window.top.location.href = this.loginPage;
        }
    }

    // Setup automatic session timeout
    setupSessionTimeout() {
        let timeoutId;
        let warningShown = false;
        
        const resetTimeout = () => {
            clearTimeout(timeoutId);
            warningShown = false;
            
            // Show warning 5 minutes before timeout
            timeoutId = setTimeout(() => {
                if (this.isAuthenticated() && !warningShown) {
                    warningShown = true;
                    this.showSessionWarning();
                }
            }, 23 * 60 * 1000); // 23 minutes
        };

        // Reset timeout on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetTimeout, { passive: true });
        });

        resetTimeout();
    }

    // Show session timeout warning
    showSessionWarning() {
        if (!this.isAuthenticated()) return;

        const modal = document.createElement('div');
        modal.className = 'session-warning-modal';
        modal.innerHTML = `
            <div class="session-warning-content">
                <div class="warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Session Expiring Soon</h3>
                <p>Your session will expire in 5 minutes due to inactivity.</p>
                <div class="warning-buttons">
                    <button class="extend-session-btn" onclick="authSystem.extendSession()">
                        <i class="fas fa-clock"></i>
                        Extend Session
                    </button>
                    <button class="logout-btn" onclick="authSystem.logout('User chose to logout')">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Auto-logout after 5 minutes if no action taken
        setTimeout(() => {
            if (document.body.contains(modal)) {
                this.logout('Session timeout');
            }
        }, 5 * 60 * 1000);
    }

    // Extend user session
    extendSession() {
        const modal = document.querySelector('.session-warning-modal');
        if (modal) {
            modal.remove();
        }
        
        // Update login timestamp
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        // Show success message
        this.showNotification('Session extended successfully', 'success');
    }

    // Add security headers and protections
    addSecurityHeaders() {
        // Prevent page from being embedded in iframes
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }

        // Disable right-click context menu on protected pages
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (this.protectedPages.includes(currentPage)) {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showNotification('Right-click disabled for security', 'warning');
            });

            // Disable common developer tools shortcuts
            document.addEventListener('keydown', (e) => {
                if (
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                    (e.ctrlKey && e.key === 'U') ||
                    e.key === 'F12'
                ) {
                    e.preventDefault();
                    this.showNotification('Developer tools access restricted', 'warning');
                }
            });
        }
    }

    // Log security events
    logSecurityEvent(event, userId, details = '') {
        const securityLog = {
            event: event,
            userId: userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: 'client-side', // In production, get from server
            details: details
        };

        // Store in localStorage for demo (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(securityLog);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('securityLogs', JSON.stringify(logs));
        console.log('Security Event:', securityLog);
    }

    // Show notification to user
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `security-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }

    // Get current user data
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        
        try {
            return JSON.parse(localStorage.getItem('userData'));
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.logout('Data corruption detected');
            return null;
        }
    }

    // Check if user has specific permission
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Basic role-based permissions
        const permissions = {
            'free': ['view_templates', 'create_basic_bot'],
            'pro': ['view_templates', 'create_basic_bot', 'create_advanced_bot', 'export_bot'],
            'enterprise': ['view_templates', 'create_basic_bot', 'create_advanced_bot', 'export_bot', 'team_management', 'analytics']
        };
        
        const userRole = user.role || 'free';
        return permissions[userRole]?.includes(permission) || false;
    }
}

// Initialize authentication system after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        const authSystem = new AuthSystem();
        window.authSystem = authSystem;
    }, 100);
});

// AuthSystem will be exported in the DOMContentLoaded handler above

