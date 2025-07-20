// Check if device is mobile - allow all devices but optimize for desktop view
function isMobileDevice() {
    // Always return false to allow all devices
    return false;
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Handle Discord login
function handleDiscordLogin() {
    const discordBtn = document.querySelector('.discord-btn');
    discordBtn.style.opacity = '0.7';
    discordBtn.style.pointerEvents = 'none';

    // Simulate Discord OAuth flow
    setTimeout(() => {
        alert('Discord login integration would be implemented here with Discord OAuth 2.0');
        discordBtn.style.opacity = '1';
        discordBtn.style.pointerEvents = 'auto';
    }, 1500);
}

// Handle Smars login
function handleSmarsLogin() {
    const smarsBtn = document.querySelector('.smars-btn');
    smarsBtn.style.opacity = '0.7';
    smarsBtn.style.pointerEvents = 'none';

    // Simulate Smars login
    setTimeout(() => {
        alert('Smars login integration would redirect to Smart Serve authentication');
        smarsBtn.style.opacity = '1';
        smarsBtn.style.pointerEvents = 'auto';
    }, 1500);
}

// Handle email/password login
function handleEmailLogin(e) {
    e.preventDefault();

    const form = document.getElementById('loginForm');
    const loginBtn = document.querySelector('.login-btn');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Add loading state
    form.classList.add('loading');
    loginBtn.innerHTML = '<span>Signing In...</span>';

    // Simulate login process
    setTimeout(() => {
        if (email === 'admin@smartserve.com' && password === 'admin123') {
            // Simulate successful login
            const mockUser = {
                id: 'admin_123',
                username: 'AdminUser',
                avatar: 'https://via.placeholder.com/80x80/000000/ffffff?text=A',
                email: 'admin@smartserve.com'
            };
            handleSuccessfulLogin(mockUser);
        } else {
            alert('Invalid credentials. Try admin@smartserve.com / admin123');
            form.classList.remove('loading');
            loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
        }
    }, 2000);
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add floating particles
function createFloatingParticles() {
    const galaxySection = document.querySelector('.galaxy-section');

    setInterval(() => {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: 100%;
            pointer-events: none;
            animation: floatUp 6s linear forwards;
            z-index: 1;
        `;

        galaxySection.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 6000);
    }, 500);
}

// Add CSS for floating particles
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) scale(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
            transform: scale(1);
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// Discord login function
function loginWithDiscord() {
    showLoadingState('Redirecting to Discord...');
    
    // Redirect to server-side Discord OAuth endpoint
    setTimeout(() => {
        window.location.href = '/auth/discord';
    }, 1000);
}

// Smars login function
function loginWithSmars() {
    showLoadingState('Connecting to Smars...');

    setTimeout(() => {
        const mockUser = {
            id: 'smars_123',
            username: 'SmarsUser',
            avatar: 'https://via.placeholder.com/80x80/000000/ffffff?text=S',
            email: 'user@smars.com'
        };

        handleSuccessfulLogin(mockUser);
    }, 2000);
}

// Show loading state
function showLoadingState(message) {
    const buttons = document.querySelectorAll('.login-with-discord, .login-with-smars, .login-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    document.body.appendChild(overlay);
}

// Show success state
function showSuccessState(message) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #4ade80; margin-bottom: 20px;"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Handle successful login
function handleSuccessfulLogin(user) {
    const rememberMe = document.getElementById('remember')?.checked || false;

    // Add role and permissions
    user.role = user.role || 'free';
    user.permissions = user.permissions || ['view_templates', 'create_basic_bot'];

    // Use auth system to handle login
    if (window.authSystem) {
        window.authSystem.handleLogin(user, rememberMe);
    } else {
        // Fallback if auth system not loaded
        localStorage.setItem('userData', JSON.stringify(user));
        window.location.href = 'bot-builder.html';
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Allow all devices - no mobile redirect

    // Add event listeners
    document.querySelector('.discord-btn').addEventListener('click', handleDiscordLogin);
    document.querySelector('.smars-btn').addEventListener('click', handleSmarsLogin);
    document.getElementById('loginForm').addEventListener('submit', handleEmailLogin);

    // Start floating particles
    setTimeout(createFloatingParticles, 1000);

    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', (e) => {
            e.target.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.social-btn, .login-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
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
`;
document.head.appendChild(rippleStyle);