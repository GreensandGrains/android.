
// Multi-language support system
class LanguageSystem {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                welcome: 'Welcome to Smart Serve',
                login: 'Login',
                logout: 'Logout',
                dashboard: 'Dashboard'
            },
            es: {
                welcome: 'Bienvenido a Smart Serve',
                login: 'Iniciar Sesión',
                logout: 'Cerrar Sesión',
                dashboard: 'Panel de Control'
            }
        };
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updatePage();
    }

    translate(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    updatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.translate(key);
        });
    }
}

// Initialize language system
const languageSystem = new LanguageSystem();
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = {
            en: {
                // Navigation
                home: 'Home',
                bots: 'Bots',
                templates: 'Templates',
                learn: 'Learn',
                login: 'Login',
                logout: 'Logout',
                
                // Home Page
                heroTitle: 'Leading Technology Solutions',
                heroSubtitle: 'Pioneering the future of technology with innovative solutions that transcend boundaries',
                getStarted: 'Get Started',
                watchDemo: 'Watch Demo',
                
                // Bot Builder
                buildYourBot: 'Build Your Custom Bot',
                botBuilderDesc: 'Create intelligent bots that transcend digital boundaries',
                botContent: 'Bot Content',
                botContentPlaceholder: 'Say your content...',
                createByAI: 'Create by AI',
                makeOrder: 'Make an Order',
                
                // Templates
                botTemplates: 'Bot Templates',
                templatesDesc: 'Choose from our collection of pre-built bot templates',
                useTemplate: 'Use Template',
                
                // Sidebar
                deployments: 'Deployments',
                teams: 'Teams',
                template: 'Template',
                custom: 'Custom',
                quests: 'Quests',
                marketplace: 'Marketplace',
                usage: 'Usage',
                upgradeToCore: 'Upgrade to Core',
                
                // Coming Soon
                comingSoon: 'Coming Soon',
                comingSoonDesc: "We're working hard to bring you amazing new features that will revolutionize your bot building experience.",
                launchingSoon: 'Launching in the near future...',
                
                // Profile
                orders: 'Orders',
                botsCreated: 'Bots Created',
                viewPricing: 'View Pricing',
                
                // Common
                close: 'Close',
                back: 'Back',
                language: 'Language'
            },
            es: {
                // Navigation
                home: 'Inicio',
                bots: 'Bots',
                templates: 'Plantillas',
                learn: 'Aprender',
                login: 'Iniciar Sesión',
                logout: 'Cerrar Sesión',
                
                // Home Page
                heroTitle: 'Soluciones Tecnológicas Líderes',
                heroSubtitle: 'Pioneros del futuro de la tecnología con soluciones innovadoras que trascienden fronteras',
                getStarted: 'Comenzar',
                watchDemo: 'Ver Demo',
                
                // Bot Builder
                buildYourBot: 'Construye Tu Bot Personalizado',
                botBuilderDesc: 'Crea bots inteligentes que trascienden las fronteras digitales',
                botContent: 'Contenido del Bot',
                botContentPlaceholder: 'Dí tu contenido...',
                createByAI: 'Crear por IA',
                makeOrder: 'Hacer Pedido',
                
                // Templates
                botTemplates: 'Plantillas de Bot',
                templatesDesc: 'Elige de nuestra colección de plantillas de bot pre-construidas',
                useTemplate: 'Usar Plantilla',
                
                // Sidebar
                deployments: 'Despliegues',
                teams: 'Equipos',
                template: 'Plantilla',
                custom: 'Personalizado',
                quests: 'Misiones',
                marketplace: 'Mercado',
                usage: 'Uso',
                upgradeToCore: 'Actualizar a Core',
                
                // Coming Soon
                comingSoon: 'Próximamente',
                comingSoonDesc: 'Estamos trabajando duro para traerte características increíbles que revolucionarán tu experiencia de creación de bots.',
                launchingSoon: 'Lanzando en el futuro cercano...',
                
                // Profile
                orders: 'Pedidos',
                botsCreated: 'Bots Creados',
                viewPricing: 'Ver Precios',
                
                // Common
                close: 'Cerrar',
                back: 'Atrás',
                language: 'Idioma'
            },
            fr: {
                // Navigation
                home: 'Accueil',
                bots: 'Bots',
                templates: 'Modèles',
                learn: 'Apprendre',
                login: 'Connexion',
                logout: 'Déconnexion',
                
                // Home Page
                heroTitle: 'Solutions Technologiques de Pointe',
                heroSubtitle: 'Pionnier de l\'avenir de la technologie avec des solutions innovantes qui transcendent les frontières',
                getStarted: 'Commencer',
                watchDemo: 'Voir la Démo',
                
                // Bot Builder
                buildYourBot: 'Construisez Votre Bot Personnalisé',
                botBuilderDesc: 'Créez des bots intelligents qui transcendent les frontières numériques',
                botContent: 'Contenu du Bot',
                botContentPlaceholder: 'Dites votre contenu...',
                createByAI: 'Créer par IA',
                makeOrder: 'Passer Commande',
                
                // Templates
                botTemplates: 'Modèles de Bot',
                templatesDesc: 'Choisissez parmi notre collection de modèles de bot pré-construits',
                useTemplate: 'Utiliser le Modèle',
                
                // Sidebar
                deployments: 'Déploiements',
                teams: 'Équipes',
                template: 'Modèle',
                custom: 'Personnalisé',
                quests: 'Quêtes',
                marketplace: 'Marché',
                usage: 'Utilisation',
                upgradeToCore: 'Mettre à Niveau vers Core',
                
                // Coming Soon
                comingSoon: 'Bientôt Disponible',
                comingSoonDesc: 'Nous travaillons dur pour vous apporter des fonctionnalités incroyables qui révolutionneront votre expérience de création de bots.',
                launchingSoon: 'Lancement dans un futur proche...',
                
                // Profile
                orders: 'Commandes',
                botsCreated: 'Bots Créés',
                viewPricing: 'Voir les Prix',
                
                // Common
                close: 'Fermer',
                back: 'Retour',
                language: 'Langue'
            }
        };
        this.init();
    }

    init() {
        this.createLanguageSelector();
        this.translatePage();
    }

    createLanguageSelector() {
        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = `
            <button class="language-btn" id="language-btn">
                <i class="fas fa-globe"></i>
                <span class="lang-text">${this.getTranslation('language')}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="language-dropdown" id="language-dropdown">
                <div class="language-option" data-lang="en">
                    <span class="flag">🇺🇸</span>
                    <span>English</span>
                </div>
                <div class="language-option" data-lang="es">
                    <span class="flag">🇪🇸</span>
                    <span>Español</span>
                </div>
                <div class="language-option" data-lang="fr">
                    <span class="flag">🇫🇷</span>
                    <span>Français</span>
                </div>
            </div>
        `;

        // Add to navigation
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.insertBefore(languageSelector, navActions.firstChild);
        }

        // Add event listeners
        this.setupLanguageSelector();
    }

    setupLanguageSelector() {
        const languageBtn = document.getElementById('language-btn');
        const languageDropdown = document.getElementById('language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageBtn) {
            languageBtn.addEventListener('click', () => {
                languageDropdown.classList.toggle('active');
            });
        }

        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const newLang = option.dataset.lang;
                this.changeLanguage(newLang);
                languageDropdown.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                languageDropdown.classList.remove('active');
            }
        });
    }

    changeLanguage(newLang) {
        this.currentLanguage = newLang;
        localStorage.setItem('selectedLanguage', newLang);
        this.translatePage();
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || this.translations['en'][key] || key;
    }

    translatePage() {
        // Translate elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update language button text
        const langText = document.querySelector('.lang-text');
        if (langText) {
            langText.textContent = this.getTranslation('language');
        }
    }
}

// Initialize language manager
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});
