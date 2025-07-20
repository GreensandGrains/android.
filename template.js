// Check if device is mobile - allow all devices but optimize for desktop view
function isMobileDevice() {
    // Always return false to allow all devices
    return false;
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Allow all devices - no mobile redirect

    // Add click handlers to template cards
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            const templateName = this.querySelector('h3').textContent;
            handleTemplateSelection(templateName);
        });
    });

    // Add click handlers to use template buttons
    const useTemplateButtons = document.querySelectorAll('.use-template-btn');
    useTemplateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const templateName = this.closest('.template-card').querySelector('h3').textContent;
            handleTemplateSelection(templateName);
        });
    });

    // Continue with normal page initialization...
});

// Handle template selection and save to database
async function handleTemplateSelection(templateName) {
    try {
        // Check if user is authenticated
        const sessionToken = sessionStorage.getItem('sessionToken');
        if (!sessionToken) {
            window.location.href = 'login.html';
            return;
        }

        // Save template to user's bot gallery
        const response = await fetch('/api/templates/use', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                templateName: templateName,
                templateType: 'template'
            })
        });

        if (response.ok) {
            const result = await response.json();
            // Redirect to coding environment with template parameter
            window.location.href = `coding-environment.html?template=${encodeURIComponent(templateName)}&order=${result.orderNumber}`;
        } else {
            console.error('Failed to save template');
            // Still redirect even if save fails
            window.location.href = `coding-environment.html?template=${encodeURIComponent(templateName)}`;
        }
    } catch (error) {
        console.error('Error handling template selection:', error);
        // Fallback redirect
        window.location.href = `coding-environment.html?template=${encodeURIComponent(templateName)}`;
    }
}

// User dropdown functionality
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('active');
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
    window.location.href = 'upgrade.html'; 
}