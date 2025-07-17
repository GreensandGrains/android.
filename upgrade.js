
// Initialize upgrade modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle upgrade button clicks
    const upgradeBtn = document.querySelector('.plan-btn.upgrade');
    const contactSalesBtn = document.querySelector('.plan-btn:not(.current):not(.upgrade)');
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            handleUpgrade();
        });
    }
    
    if (contactSalesBtn) {
        contactSalesBtn.addEventListener('click', function() {
            handleContactSales();
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Close modal function
function closeModal() {
    window.history.back();
}

// Handle upgrade to Core
function handleUpgrade() {
    // Create upgrade popup
    const upgradePopup = document.createElement('div');
    upgradePopup.className = 'upgrade-popup-overlay';
    upgradePopup.innerHTML = `
        <div class="upgrade-popup">
            <div class="popup-header">
                <h3>Upgrade to Core</h3>
                <button class="popup-close" onclick="closeUpgradePopup()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="popup-content">
                <div class="upgrade-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <p>You're about to upgrade to Smart Serve Core!</p>
                <p>This will unlock all premium features and give you unlimited bot creation capabilities.</p>
                <div class="popup-actions">
                    <button class="btn-confirm" onclick="confirmUpgrade()">
                        <i class="fas fa-credit-card"></i>
                        Proceed to Payment
                    </button>
                    <button class="btn-cancel" onclick="closeUpgradePopup()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(upgradePopup);
    
    // Show with animation
    setTimeout(() => {
        upgradePopup.classList.add('active');
    }, 10);
}

// Handle contact sales
function handleContactSales() {
    alert('Enterprise sales contact form coming soon! Please email us at enterprise@smartserve.com for now.');
}

// Close upgrade popup
function closeUpgradePopup() {
    const popup = document.querySelector('.upgrade-popup-overlay');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// Confirm upgrade
function confirmUpgrade() {
    closeUpgradePopup();
    alert('Redirecting to secure payment portal... (Demo mode - no actual payment will be processed)');
}

// Add CSS for upgrade popup
const upgradePopupStyles = document.createElement('style');
upgradePopupStyles.textContent = `
    .upgrade-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .upgrade-popup-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    .upgrade-popup {
        background: var(--secondary-black);
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: scale(0.9);
        transition: all 0.3s ease;
    }
    
    .upgrade-popup-overlay.active .upgrade-popup {
        transform: scale(1);
    }
    
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .popup-header h3 {
        font-size: 1.5rem;
        color: var(--pure-white);
    }
    
    .popup-close {
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .popup-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .upgrade-icon {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .upgrade-icon i {
        font-size: 3rem;
        color: var(--gold);
    }
    
    .popup-content p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 15px;
        text-align: center;
    }
    
    .popup-actions {
        display: flex;
        gap: 15px;
        margin-top: 25px;
    }
    
    .btn-confirm,
    .btn-cancel {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .btn-confirm {
        background: var(--gold);
        color: var(--primary-black);
    }
    
    .btn-confirm:hover {
        background: var(--gold-dark);
        transform: translateY(-2px);
    }
    
    .btn-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: var(--pure-white);
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
`;

document.head.appendChild(upgradePopupStyles);
