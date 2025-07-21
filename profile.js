// Check if device is mobile
// Check if device is mobile - allow all devices but optimize for desktop view
function isMobileDevice() {
    // Always return false to allow all devices
    return false;
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Allow all devices - no mobile redirect

    // Load profile data
    loadProfileData();
    
    // Initialize tab functionality
    initializeTabs();
    
    // Add animations
    initializeAnimations();
});

// Tab functionality
function showTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    event.target.closest('.tab-btn').classList.add('active');
    document.getElementById(tabName + '-panel').classList.add('active');
}

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.textContent.trim().toLowerCase().replace(/\s+/g, '').replace('my', '');
            showTab(tabName);
        });
    });
}

// Profile data management
function loadProfileData() {
    // Load from localStorage or use defaults
    const savedName = localStorage.getItem('profileName') || 'User';
    const savedBio = localStorage.getItem('profileBio') || 'Bot builder and AI enthusiast. Creating intelligent solutions for the future.';
    const savedAvatar = localStorage.getItem('profileAvatar') || 'https://via.placeholder.com/120x120/ffffff/000000?text=U';
    
    document.getElementById('profile-name').textContent = savedName;
    document.getElementById('profile-bio').textContent = savedBio;
    document.getElementById('profile-avatar-img').src = savedAvatar;
}

function saveProfileData(name, bio, avatar) {
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);
    if (avatar) localStorage.setItem('profileAvatar', avatar);
}

// Profile actions
function editProfile() {
    const currentName = document.getElementById('profile-name').textContent;
    const currentBio = document.getElementById('profile-bio').textContent;
    
    const newName = prompt('Enter your name:', currentName);
    if (newName !== null && newName.trim()) {
        document.getElementById('profile-name').textContent = newName.trim();
    }
    
    const newBio = prompt('Enter your bio:', currentBio);
    if (newBio !== null) {
        document.getElementById('profile-bio').textContent = newBio.trim();
    }
    
    // Save to localStorage
    saveProfileData(
        document.getElementById('profile-name').textContent,
        document.getElementById('profile-bio').textContent
    );
}

function editAvatar() {
    const newAvatar = prompt('Enter image URL for your avatar:');
    if (newAvatar && newAvatar.trim()) {
        const img = document.getElementById('profile-avatar-img');
        img.src = newAvatar.trim();
        localStorage.setItem('profileAvatar', newAvatar.trim());
    }
}

function goToSettings() {
    window.location.href = 'coming-soon.html';
}

// Initialize animations
function initializeAnimations() {
    // Animate bot cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.bot-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.bot-card, .template-item, .activity-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Utility functions for bot actions
function editBot(botName) {
    alert(`Editing ${botName}... This feature is coming soon!`);
}

function redirectToNewBot() {
    window.location.href = 'coding-environment.html';
}

function deployBot(botName) {
    alert(`Deploying ${botName}... This feature is coming soon!`);
}

// Add click handlers to bot action buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-secondary')) {
        const botCard = e.target.closest('.bot-card');
        const botName = botCard.querySelector('h3').textContent;
        editBot(botName);
    }
    
    if (e.target.classList.contains('btn-primary')) {
        const botCard = e.target.closest('.bot-card');
        const botName = botCard.querySelector('h3').textContent;
        deployBot(botName);
    }
    
    if (e.target.classList.contains('use-again-btn')) {
        const templateItem = e.target.closest('.template-item');
        const templateName = templateItem.querySelector('h4').textContent;
        window.location.href = `template.html?template=${encodeURIComponent(templateName)}`;
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+E to edit profile
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        editProfile();
    }
    
    // Number keys to switch tabs
    if (e.key >= '1' && e.key <= '4') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.tab-btn');
        if (tabs[tabIndex]) {
            tabs[tabIndex].click();
        }
    }
});

// Auto-save profile changes
let saveTimeout;
function autoSaveProfile() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveProfileData(
            document.getElementById('profile-name').textContent,
            document.getElementById('profile-bio').textContent
        );
    }, 1000);
}

// Add auto-save on content changes
document.getElementById('profile-name').addEventListener('input', autoSaveProfile);
document.getElementById('profile-bio').addEventListener('input', autoSaveProfile);