// Application state management (using variables instead of localStorage due to sandbox restrictions)
let currentLanguage = 'es';
let currentTheme = 'light';

// DOM elements
const languageToggle = document.getElementById('languageToggle');
const themeToggle = document.getElementById('themeToggle');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const contactForm = document.getElementById('contactForm');


// Language data
const translations = {
    es: {
        'theme-light': '☀️',
        'theme-dark': '🌙',
        'language': 'EN',

        'nav-toggle-label': 'Alternar navegación'
    },
    en: {
        'theme-light': '☀️',
        'theme-dark': '🌙',
        'language': 'ES',

        'nav-toggle-label': 'Toggle navigation'
    }
};

// Initialize application
function initializeApp() {
    // Check system preference for theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme = 'dark';
    }

    // Apply initial theme and language
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);

    // Set up event listeners
    setupEventListeners();

    // Setup smooth scrolling for navigation
    setupSmoothScrolling();

    // Setup contact form
    setupContactForm();
}

// Theme management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    currentTheme = theme;
}

// Language management
function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    applyLanguage(currentLanguage);
}

function applyLanguage(language) {
    // Update language button text
    const languageText = document.querySelector('.language-text');
    if (languageText) {
        languageText.textContent = translations[language]['language'];
    }

    // Update HTML lang attribute
    document.documentElement.lang = language;

    // Update all elements with data-es and data-en attributes
    const elementsToTranslate = document.querySelectorAll('[data-es][data-en]');
    elementsToTranslate.forEach(element => {
        const text = element.getAttribute(`data-${language}`);
        if (text) {
            element.textContent = text;
        }
    });



    // Update aria labels
    updateAriaLabels(language);

    currentLanguage = language;
}

function updateAriaLabels(language) {
    // Update theme toggle aria-label
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', 
            language === 'es' ? 'Alternar tema' : 'Toggle theme'
        );
    }

    // Update nav toggle aria-label
    if (navToggle) {
        navToggle.setAttribute('aria-label', translations[language]['nav-toggle-label']);
    }
}

// Navigation management
function toggleNavigation() {
    if (mainNav) {
        mainNav.classList.toggle('show');
    }
}

function closeNavigation() {
    if (mainNav && mainNav.classList.contains('show')) {
        mainNav.classList.remove('show');
    }
}

// Smooth scrolling setup
function setupSmoothScrolling() {
    // Handle navigation link clicks
    const navLinks = document.querySelectorAll('.main-nav__link, .hero__actions a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile navigation if open
                closeNavigation();
                
                // Smooth scroll to target
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form setup and validation
function setupContactForm() {
    if (!contactForm) return;

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    // Form validation
    function validateField(field, errorId, validator) {
        const errorElement = document.getElementById(errorId);
        const isValid = validator(field.value);
        
        if (isValid) {
            errorElement.textContent = '';
            field.classList.remove('error');
        } else {
            field.classList.add('error');
        }
        
        return isValid;
    }

    function validateName(value) {
        return value.trim().length >= 2;
    }

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value.trim());
    }

    function validateMessage(value) {
        return value.trim().length >= 10;
    }

    function showFieldError(fieldId, errorId, message) {
        const errorElement = document.getElementById(errorId);
        const field = document.getElementById(fieldId);
        errorElement.textContent = message;
        field.classList.add('error');
    }

    function clearAllErrors() {
        ['nameError', 'emailError', 'messageError'].forEach(errorId => {
            document.getElementById(errorId).textContent = '';
        });
        [nameField, emailField, messageField].forEach(field => {
            field.classList.remove('error');
        });
    }

    // Real-time validation
    nameField?.addEventListener('blur', function() {
        if (!validateName(this.value)) {
            showFieldError('name', 'nameError', 
                currentLanguage === 'es' ? 'El nombre debe tener al menos 2 caracteres' : 'Name must be at least 2 characters');
        }
    });

    emailField?.addEventListener('blur', function() {
        if (!validateEmail(this.value)) {
            showFieldError('email', 'emailError', 
                currentLanguage === 'es' ? 'Por favor ingresa un email válido' : 'Please enter a valid email address');
        }
    });

    messageField?.addEventListener('blur', function() {
        if (!validateMessage(this.value)) {
            showFieldError('message', 'messageError', 
                currentLanguage === 'es' ? 'El mensaje debe tener al menos 10 caracteres' : 'Message must be at least 10 characters');
        }
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        clearAllErrors();
        formSuccess?.classList.add('hidden');

        // Validate all fields
        const isNameValid = validateField(nameField, 'nameError', validateName);
        const isEmailValid = validateField(emailField, 'emailError', validateEmail);
        const isMessageValid = validateField(messageField, 'messageError', validateMessage);

        // Show specific error messages
        if (!isNameValid) {
            showFieldError('name', 'nameError', 
                currentLanguage === 'es' ? 'El nombre debe tener al menos 2 caracteres' : 'Name must be at least 2 characters');
        }
        if (!isEmailValid) {
            showFieldError('email', 'emailError', 
                currentLanguage === 'es' ? 'Por favor ingresa un email válido' : 'Please enter a valid email address');
        }
        if (!isMessageValid) {
            showFieldError('message', 'messageError', 
                currentLanguage === 'es' ? 'El mensaje debe tener al menos 10 caracteres' : 'Message must be at least 10 characters');
        }

        if (isNameValid && isEmailValid && isMessageValid) {
            // Simulate form submission
            submitBtn.disabled = true;
            document.querySelector('.submit-text').classList.add('hidden');
            document.querySelector('.submit-loading').classList.remove('hidden');

            // Simulate API call delay
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                
                // Show success message
                formSuccess?.classList.remove('hidden');
                
                // Reset button state
                submitBtn.disabled = false;
                document.querySelector('.submit-text').classList.remove('hidden');
                document.querySelector('.submit-loading').classList.add('hidden');
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formSuccess?.classList.add('hidden');
                }, 5000);
            }, 1500);
        }
    });
}



// Event listeners setup
function setupEventListeners() {
    // Theme toggle
    themeToggle?.addEventListener('click', toggleTheme);
    
    // Language toggle
    languageToggle?.addEventListener('click', toggleLanguage);
    
    // Navigation toggle (mobile)
    navToggle?.addEventListener('click', toggleNavigation);
    
    // Close mobile navigation when clicking outside
    document.addEventListener('click', function(e) {
        if (mainNav && mainNav.classList.contains('show')) {
            if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                closeNavigation();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeNavigation();
        }
    });
    
    // System theme change detection
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually changed theme
            if (!document.documentElement.hasAttribute('data-theme-manual')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    // Mark theme as manually changed when user toggles
    themeToggle?.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme-manual', 'true');
    });
}

// Keyboard navigation enhancement
function setupKeyboardNavigation() {
    // Add keyboard support for theme and language toggles
    [themeToggle, languageToggle, navToggle].forEach(button => {
        if (button) {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        }
    });
}

// Progress bar animation on scroll
function setupProgressBarAnimation() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const animateProgressBars = () => {
        progressBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (isVisible && !bar.classList.contains('animated')) {
                bar.classList.add('animated');
                // Trigger animation by temporarily setting width to 0 then back to original
                const originalWidth = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = originalWidth;
                }, 100);
            }
        });
    };
    
    // Initial check
    setTimeout(animateProgressBars, 100);
    
    // Check on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(animateProgressBars, 50);
    });
}

// Add focus management for accessibility
function setupFocusManagement() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = currentLanguage === 'es' ? 'Saltar al contenido principal' : 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: var(--color-btn-primary-text);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.2s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add id to main content for skip link
    const main = document.querySelector('.main');
    if (main) {
        main.id = 'main';
        main.setAttribute('tabindex', '-1');
    }
}

// Error handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    

}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initializeApp();
            setupKeyboardNavigation();
            setupProgressBarAnimation();
            setupFocusManagement();
        } catch (error) {
            handleError(error, 'initialization');
        }
    });
} else {
    // DOM already loaded
    try {
        initializeApp();
        setupKeyboardNavigation();
        setupProgressBarAnimation();
        setupFocusManagement();
    } catch (error) {
        handleError(error, 'initialization');
    }
}