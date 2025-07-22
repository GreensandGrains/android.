/**
 * Enhanced Page Beautifier - Makes All 34 Pages Beautiful
 * Fixes visual mismatches, improves scrolling, and creates stunning UI
 */

class EnhancedPageBeautifier {
    constructor() {
        this.version = "2.0.0";
        this.initialized = false;
        this.animations = new Map();
        this.observers = new Map();
        this.beautificationRules = new Map();
        
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🎨 Initializing Enhanced Page Beautifier...');
        
        // Setup beautification rules for each page type
        this.setupBeautificationRules();
        
        // Initialize observers for dynamic content
        this.setupObservers();
        
        // Apply global enhancements
        await this.applyGlobalEnhancements();
        
        // Fix specific page issues
        await this.fixPageSpecificIssues();
        
        // Enhance scrolling
        this.enhanceScrolling();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
        
        this.initialized = true;
        console.log('✨ Page beautification complete!');
    }

    setupBeautificationRules() {
        // Home page rules
        this.beautificationRules.set('index.html', {
            hero: {
                minHeight: '100vh',
                paddingTop: '120px',
                background: 'enhanced-gradient',
                animation: 'fadeInUp'
            },
            sections: {
                padding: '80px 0',
                spacing: '40px',
                maxWidth: '1200px'
            },
            cards: {
                hoverEffect: 'lift',
                borderRadius: '16px',
                shadow: 'enhanced'
            }
        });

        // Bot builder rules
        this.beautificationRules.set('bot-builder.html', {
            layout: {
                sidebar: '320px',
                mainPadding: '32px',
                headerHeight: '80px'
            },
            forms: {
                spacing: '24px',
                inputHeight: '48px',
                borderRadius: '12px'
            },
            modals: {
                backdrop: 'enhanced-blur',
                animation: 'modalSlideIn'
            }
        });

        // Coding environment rules
        this.beautificationRules.set('coding-environment.html', {
            layout: {
                panels: 'optimized-flex',
                minHeight: 'calc(100vh - 70px)',
                spacing: '0'
            },
            editor: {
                fontSize: '14px',
                lineHeight: '1.6',
                padding: '20px'
            },
            ai: {
                panelWidth: '400px',
                animation: 'slideFromRight'
            }
        });

        // Add rules for all other pages
        this.setupAdditionalPageRules();
    }

    setupAdditionalPageRules() {
        const commonRules = {
            layout: {
                maxWidth: '1400px',
                padding: '32px',
                margin: '0 auto'
            },
            typography: {
                headingScale: 'enhanced',
                bodyLineHeight: '1.7',
                spacing: 'optimized'
            },
            interactions: {
                hoverEffects: 'smooth',
                clickFeedback: 'subtle',
                transitions: 'fluid'
            }
        };

        const pages = [
            'bots.html', 'template.html', 'profile.html', 'upgrade.html',
            'login.html', 'mobile-warning.html', 'coming-soon.html'
        ];

        pages.forEach(page => {
            this.beautificationRules.set(page, {
                ...commonRules,
                specific: this.getPageSpecificRules(page)
            });
        });
    }

    getPageSpecificRules(page) {
        const specificRules = {
            'bots.html': {
                grid: 'responsive-masonry',
                cardAnimation: 'staggered-fade',
                filterBar: 'floating-sticky'
            },
            'template.html': {
                showcase: 'immersive-grid',
                preview: 'enhanced-modal',
                categories: 'animated-tabs'
            },
            'profile.html': {
                layout: 'split-panel',
                avatar: 'enhanced-circle',
                sections: 'accordion-style'
            },
            'upgrade.html': {
                pricing: 'comparison-table',
                highlights: 'animated-features',
                cta: 'prominent-buttons'
            },
            'login.html': {
                form: 'centered-glass',
                background: 'animated-particles',
                social: 'button-grid'
            }
        };

        return specificRules[page] || {};
    }

    async applyGlobalEnhancements() {
        // Enhanced scrollbar styling
        this.enhanceScrollbars();
        
        // Improved loading states
        this.enhanceLoadingStates();
        
        // Better focus management
        this.enhanceFocusManagement();
        
        // Smooth page transitions
        this.enablePageTransitions();
        
        // Enhanced hover effects
        this.addGlobalHoverEffects();
        
        // Optimized animations
        this.optimizeAnimations();
    }

    enhanceScrollbars() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Custom Scrollbars */
            ::-webkit-scrollbar {
                width: 12px;
                height: 12px;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                margin: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6));
                border-radius: 6px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            ::-webkit-scrollbar-corner {
                background: transparent;
            }
            
            /* Firefox scrollbar */
            * {
                scrollbar-width: thin;
                scrollbar-color: rgba(59, 130, 246, 0.6) rgba(255, 255, 255, 0.05);
            }
        `;
        document.head.appendChild(style);
    }

    enhanceLoadingStates() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Loading Animations */
            .loading-skeleton {
                background: linear-gradient(90deg, 
                    rgba(255, 255, 255, 0.05) 25%, 
                    rgba(255, 255, 255, 0.15) 50%, 
                    rgba(255, 255, 255, 0.05) 75%);
                background-size: 200% 100%;
                animation: loading-shimmer 2s infinite;
                border-radius: 8px;
            }
            
            @keyframes loading-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            .loading-pulse {
                animation: loading-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes loading-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .loading-spinner {
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top: 3px solid rgba(59, 130, 246, 0.8);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                animation: loading-spin 1s linear infinite;
                margin: 20px auto;
            }
            
            @keyframes loading-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    enhanceFocusManagement() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Focus Styles */
            *:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
                border-radius: 8px;
                transition: box-shadow 0.2s ease;
            }
            
            button:focus, .btn:focus {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 
                           0 4px 12px rgba(59, 130, 246, 0.2);
                transform: translateY(-1px);
            }
            
            input:focus, textarea:focus, select:focus {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
                           0 2px 8px rgba(0, 0, 0, 0.1);
                border-color: rgba(59, 130, 246, 0.8);
            }
            
            .focus-visible {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    enablePageTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            /* Smooth Page Transitions */
            .page-transition-enter {
                opacity: 0;
                transform: translateY(20px);
            }
            
            .page-transition-enter-active {
                opacity: 1;
                transform: translateY(0);
                transition: opacity 0.4s ease, transform 0.4s ease;
            }
            
            .page-transition-exit {
                opacity: 1;
                transform: translateY(0);
            }
            
            .page-transition-exit-active {
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            /* Fade transition for sections */
            .fade-in {
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .fade-in-delay-1 { animation-delay: 0.1s; }
            .fade-in-delay-2 { animation-delay: 0.2s; }
            .fade-in-delay-3 { animation-delay: 0.3s; }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    addGlobalHoverEffects() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Hover Effects */
            .hover-lift {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .hover-lift:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
            
            .hover-scale {
                transition: transform 0.2s ease;
            }
            
            .hover-scale:hover {
                transform: scale(1.02);
            }
            
            .hover-glow {
                transition: box-shadow 0.3s ease;
            }
            
            .hover-glow:hover {
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
            }
            
            .hover-shimmer {
                position: relative;
                overflow: hidden;
            }
            
            .hover-shimmer::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 255, 255, 0.2), 
                    transparent);
                transition: left 0.5s ease;
            }
            
            .hover-shimmer:hover::before {
                left: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Optimized Animations */
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .stagger-animation > * {
                opacity: 0;
                transform: translateY(20px);
                animation: staggerFadeIn 0.6s ease forwards;
            }
            
            .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
            .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
            .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
            .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
            .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes staggerFadeIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    async fixPageSpecificIssues() {
        const currentPage = this.getCurrentPage();
        const rules = this.beautificationRules.get(currentPage);
        
        if (!rules) return;
        
        // Apply page-specific fixes
        await this.applyLayoutFixes(rules);
        await this.fixScrollingIssues(rules);
        await this.enhanceVisualElements(rules);
        await this.optimizeResponsiveness(rules);
    }

    async applyLayoutFixes(rules) {
        // Fix common layout issues
        if (rules.layout) {
            const mainContent = document.querySelector('.main-content, .content, main');
            if (mainContent && rules.layout.maxWidth) {
                mainContent.style.maxWidth = rules.layout.maxWidth;
                mainContent.style.margin = rules.layout.margin || '0 auto';
                mainContent.style.padding = rules.layout.padding || '32px';
            }
            
            // Fix sidebar width issues
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && rules.layout.sidebar) {
                sidebar.style.width = rules.layout.sidebar;
                sidebar.style.flexShrink = '0';
            }
        }
    }

    async fixScrollingIssues(rules) {
        // Ensure proper scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Fix viewport height issues
        const fixViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        fixViewportHeight();
        window.addEventListener('resize', fixViewportHeight);
        
        // Fix scroll container heights
        const scrollContainers = document.querySelectorAll('.scroll-container, .scrollable');
        scrollContainers.forEach(container => {
            container.style.maxHeight = 'calc(100vh - 140px)';
            container.style.overflowY = 'auto';
        });
    }

    async enhanceVisualElements(rules) {
        // Enhance cards
        const cards = document.querySelectorAll('.card, .glass-card, .bot-card');
        cards.forEach(card => {
            card.classList.add('hover-lift');
            if (!card.style.borderRadius) {
                card.style.borderRadius = '16px';
            }
        });
        
        // Enhance buttons
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            if (!button.classList.contains('btn-primary') && !button.classList.contains('btn-secondary')) {
                button.classList.add('hover-scale');
            }
        });
        
        // Enhance forms
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.style.borderRadius) {
                input.style.borderRadius = '12px';
            }
        });
    }

    async optimizeResponsiveness(rules) {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Responsive Design */
            @media (max-width: 1024px) {
                .main-content {
                    margin-left: 0 !important;
                    padding: 24px 16px !important;
                }
                
                .sidebar {
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                }
                
                .sidebar.open {
                    transform: translateX(0);
                }
                
                .grid-4 {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
                }
                
                .grid-3 {
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                }
            }
            
            @media (max-width: 768px) {
                .grid-2, .grid-3, .grid-4 {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
                
                .content-title {
                    font-size: 24px !important;
                }
                
                .card {
                    padding: 16px !important;
                }
                
                .btn {
                    padding: 12px 20px !important;
                    font-size: 14px !important;
                }
            }
            
            @media (max-width: 480px) {
                .main-content {
                    padding: 16px 12px !important;
                }
                
                .content-title {
                    font-size: 20px !important;
                }
                
                .header-content {
                    padding: 0 12px !important;
                }
                
                .modal {
                    margin: 10px !important;
                    width: calc(100% - 20px) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    enhanceScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Infinite scroll for content areas
        this.setupInfiniteScroll();
        
        // Scroll-based animations
        this.setupScrollAnimations();
    }

    setupInfiniteScroll() {
        const scrollContainers = document.querySelectorAll('.infinite-scroll');
        
        scrollContainers.forEach(container => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Trigger load more content
                        this.loadMoreContent(container);
                    }
                });
            }, {
                rootMargin: '100px'
            });
            
            const sentinel = container.querySelector('.scroll-sentinel');
            if (sentinel) {
                observer.observe(sentinel);
            }
        });
    }

    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    setupResponsiveBehavior() {
        // Mobile menu toggle
        const mobileMenuTrigger = document.querySelector('.mobile-menu-trigger');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileMenuTrigger && sidebar) {
            mobileMenuTrigger.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
        
        // Responsive breakpoint handling
        const handleResize = () => {
            const width = window.innerWidth;
            
            if (width < 1024) {
                document.body.classList.add('mobile-layout');
            } else {
                document.body.classList.remove('mobile-layout');
            }
            
            if (width < 768) {
                document.body.classList.add('compact-layout');
            } else {
                document.body.classList.remove('compact-layout');
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
    }

    setupObservers() {
        // Mutation observer for dynamic content
        this.observers.set('mutation', new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Apply beautification to new elements
                    this.beautifyNewElements(mutation.addedNodes);
                }
            });
        }));
        
        // Start observing
        this.observers.get('mutation').observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    beautifyNewElements(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Apply hover effects
                if (node.classList.contains('card')) {
                    node.classList.add('hover-lift');
                }
                
                if (node.tagName === 'BUTTON' || node.classList.contains('btn')) {
                    node.classList.add('hover-scale');
                }
                
                // Apply animations
                if (node.classList.contains('animate-on-scroll')) {
                    this.observers.get('intersection')?.observe(node);
                }
            }
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    // Utility methods
    loadMoreContent(container) {
        // Implement content loading logic based on container
        console.log('Loading more content for:', container);
    }

    // Add beautiful animations to specific elements
    addElementAnimation(element, animationType) {
        const animations = {
            'fadeInUp': 'animate-fadeInUp',
            'slideInLeft': 'animate-slideInLeft',
            'bounce': 'animate-bounce',
            'pulse': 'animate-pulse'
        };
        
        const className = animations[animationType];
        if (className) {
            element.classList.add(className);
        }
    }

    // Apply theme variations
    applyThemeVariation(variation) {
        const root = document.documentElement;
        
        const themes = {
            'cosmic': {
                '--primary-hue': '240',
                '--accent-hue': '280',
                '--bg-pattern': 'cosmic'
            },
            'aurora': {
                '--primary-hue': '180',
                '--accent-hue': '220',
                '--bg-pattern': 'aurora'
            },
            'neon': {
                '--primary-hue': '300',
                '--accent-hue': '320',
                '--bg-pattern': 'neon'
            }
        };
        
        const theme = themes[variation];
        if (theme) {
            Object.entries(theme).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }
    }
}

// Initialize the beautifier when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pageBeautifier = new EnhancedPageBeautifier();
    });
} else {
    window.pageBeautifier = new EnhancedPageBeautifier();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPageBeautifier;
}

console.log('🎨 Enhanced Page Beautifier loaded - Making all pages stunning!');