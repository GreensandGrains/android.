// Typing animation
const texts = [
    "Smart Serve",
    "Innovation Beyond Boundaries",
    "Technology for the Future",
    "Your Digital Universe"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseTime = 2000;

function typeText() {
    const currentText = texts[textIndex];
    const typingElement = document.getElementById('typing-text');

    if (!isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(typeText, pauseTime);
            return;
        }
    } else {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }
    }

    setTimeout(typeText, isDeleting ? deletingSpeed : typingSpeed);
}

// Desktop only - no mobile menu functionality
function toggleMobileMenu() {
    // Disabled for desktop-only view
    return;
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            // Desktop only - no mobile menu to close
        });
    });
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.software-card, .pricing-card, .bio-content, .contact-content'
    );

    animatedElements.forEach(el => observer.observe(el));
}

// Navbar background on scroll
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    });
}

// Parallax effect for hero section
function setupParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const stars = document.querySelector('.stars');

        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        }

        if (stars) {
            stars.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
}

// Enhanced contact form handling with Discord integration
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Add focus animations to form inputs
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        const formGroup = input.parentElement;
        const formLine = formGroup.querySelector('.form-line');

        input.addEventListener('focus', () => {
            formGroup.classList.add('focused');
            if (formLine) {
                formLine.style.transform = 'scaleX(1)';
                formLine.style.background = 'var(--gradient-primary)';
            }
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                formGroup.classList.remove('focused');
                if (formLine) {
                    formLine.style.transform = 'scaleX(0)';
                }
            }
        });

        input.addEventListener('input', () => {
            if (input.value) {
                formGroup.classList.add('has-value');
            } else {
                formGroup.classList.remove('has-value');
            }
        });
    });

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('contactSubmit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Show loading animation
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;
        submitBtn.style.transform = 'scale(0.95)';

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Success animation
                submitBtn.style.background = '#22c55e';
                btnLoader.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    showNotification('Message sent successfully! 🎉', 'success');
                    contactForm.reset();
                    formInputs.forEach(input => {
                        input.parentElement.classList.remove('focused', 'has-value');
                        const formLine = input.parentElement.querySelector('.form-line');
                        if (formLine) formLine.style.transform = 'scaleX(0)';
                    });
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            submitBtn.style.background = '#ef4444';
            btnLoader.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            setTimeout(() => {
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.style.transform = 'scale(1)';
                submitBtn.style.background = '';
            }, 2000);
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add notification styles if not exist
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(26, 26, 26, 0.95);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                animation: notificationSlideIn 0.4s ease-out;
                transform: translateX(0);
            }
            
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-success { border-color: #22c55e; }
            .notification-error { border-color: #ef4444; }
            .notification-info { border-color: #60a5fa; }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                font-size: 14px;
                padding: 4px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .form-group {
                position: relative;
            }
            
            .form-line {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: var(--gradient-primary);
                transform: scaleX(0);
                transition: transform 0.3s ease;
                transform-origin: left;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'notificationSlideIn 0.4s ease-out reverse';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
}
function setupContactForm() {
    const form = document.querySelector('.contact-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simple form validation
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ff4444';
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });

        if (isValid) {
            alert('Thank you for your message! We\'ll get back to you soon.');
            form.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// Pricing card hover effects
function setupPricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = card.classList.contains('featured') 
                ? 'scale(1.05) translateY(-10px)' 
                : 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = card.classList.contains('featured') 
                ? 'scale(1.05) translateY(0)' 
                : 'translateY(0)';
        });
    });
}

// Create atom particles
function createAtomParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'atom-particles';
    document.body.appendChild(particleContainer);

    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'atom-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particleContainer.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }, 300);
}

// Enhanced image loading with fade-in effect
function setupImageAnimations() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        img.onload = () => {
            img.style.opacity = img.classList.contains('space-bg') ? '0.3' : 
                               img.classList.contains('universe-bg') ? '0.15' :
                               img.classList.contains('black-hole-img') ? '0.8' :
                               img.classList.contains('coding-img') ? '0.7' : '0.2';
        };

        // Trigger load if already cached
        if (img.complete) {
            img.onload();
        }
    });
}

// Check if device is mobile - allow all devices but optimize for desktop view
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function checkMobileOptimization() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
        
        // Show mobile optimization notice
        const notice = document.createElement('div');
        notice.className = 'mobile-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <i class="fas fa-mobile-alt"></i>
                <p>For the best experience, we recommend using a desktop or laptop computer.</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notice);
    }
}

// Initialize mobile check
document.addEventListener('DOMContentLoaded', checkMobileOptimization);
function isMobileDevice() {
    // Always return false to allow all devices
    return false;
}

// Update navigation based on login status
function updateNavigation() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userData = localStorage.getItem('userData');

    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (loginBtn) loginBtn.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                const userAvatar = document.getElementById('user-avatar');
                const userName = document.getElementById('user-name');
                
                // Construct proper Discord avatar URL
                let avatarUrl;
                if (user.avatar) {
                    avatarUrl = user.avatar.startsWith('http') 
                        ? user.avatar 
                        : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
                } else {
                    const discriminator = user.discriminator || (parseInt(user.id) % 5);
                    avatarUrl = `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
                }
                
                if (userAvatar) userAvatar.src = avatarUrl;
                if (userName) userName.textContent = user.username || 'User';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Allow all devices - no mobile redirect

    // Setup hamburger menu click event
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Start typing animation
    setTimeout(typeText, 1000);

    // Setup all functionality
    setupSmoothScrolling();
    setupScrollAnimations();
    setupNavbarScroll();
    setupParallax();
    setupContactForm();
    setupPricingCards();
    setupImageAnimations();

    // Start atom particles after a delay
    setTimeout(createAtomParticles, 2000);
});

// Add click events for CTA buttons
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.btn-secondary');

    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Add ripple effect
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
`;
document.head.appendChild(style);