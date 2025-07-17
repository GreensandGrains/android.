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
            // Redirect to coding environment with template parameter
            window.location.href = `coding-environment.html?template=${encodeURIComponent(templateName)}`;
        });
    });
    
    // Add click handlers to use template buttons
    const useTemplateButtons = document.querySelectorAll('.use-template-btn');
    useTemplateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const templateName = this.closest('.template-card').querySelector('h3').textContent;
            // Redirect to coding environment with template parameter
            window.location.href = `coding-environment.html?template=${encodeURIComponent(templateName)}`;
        });
    });
    
    // Continue with normal page initialization...
});
```