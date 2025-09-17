// Matrix Terminal Landing Page Interactions
class LandingPageManager {
    constructor() {
        this.isHighContrast = false;
        this.isReducedMotion = false;
        this.init();
    }

    init() {
        this.setupAccessibilityControls();
        this.setupScrollEffects();
        this.setupTerminalDemos();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.initializeAnimations();
        this.setupIntersectionObserver();
    }

    setupAccessibilityControls() {
        const highContrastToggle = document.getElementById('high-contrast-toggle');
        const reduceMotionToggle = document.getElementById('reduce-motion-toggle');

        if (highContrastToggle) {
            highContrastToggle.addEventListener('click', () => {
                this.toggleHighContrast();
            });
        }

        if (reduceMotionToggle) {
            reduceMotionToggle.addEventListener('click', () => {
                this.toggleReducedMotion();
            });
        }

        // Check for user preferences
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.enableHighContrast();
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.enableReducedMotion();
        }
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);

        // Update button state
        const button = document.getElementById('high-contrast-toggle');
        button.setAttribute('aria-pressed', this.isHighContrast);

        // Save preference
        localStorage.setItem('matrix-high-contrast', this.isHighContrast);
    }

    enableHighContrast() {
        this.isHighContrast = true;
        document.body.classList.add('high-contrast');
        const button = document.getElementById('high-contrast-toggle');
        if (button) button.setAttribute('aria-pressed', 'true');
    }

    toggleReducedMotion() {
        this.isReducedMotion = !this.isReducedMotion;
        document.body.classList.toggle('reduce-motion', this.isReducedMotion);

        // Update button state
        const button = document.getElementById('reduce-motion-toggle');
        button.setAttribute('aria-pressed', this.isReducedMotion);

        // Save preference
        localStorage.setItem('matrix-reduced-motion', this.isReducedMotion);

        // Restart animations with new settings
        this.initializeAnimations();
    }

    enableReducedMotion() {
        this.isReducedMotion = true;
        document.body.classList.add('reduce-motion');
        const button = document.getElementById('reduce-motion-toggle');
        if (button) button.setAttribute('aria-pressed', 'true');
    }

    setupScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrollY = window.scrollY;
            const navbar = document.querySelector('.navbar');

            if (navbar) {
                if (scrollY > 100) {
                    navbar.style.background = 'rgba(0, 8, 20, 0.98)';
                    navbar.style.backdropFilter = 'blur(15px)';
                } else {
                    navbar.style.background = 'rgba(0, 8, 20, 0.95)';
                    navbar.style.backdropFilter = 'blur(10px)';
                }
            }

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    }

    setupTerminalDemos() {
        // Animate typing demo in hero section
        const typingDemo = document.querySelector('.typing-demo');
        if (typingDemo && !this.isReducedMotion) {
            this.typeWriter(typingDemo);
        }

        // Setup feature card terminal animations
        this.setupFeatureTerminals();
    }

    typeWriter(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #4cc9f0';

        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                // Keep cursor blinking
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        }, 50);
    }

    setupFeatureTerminals() {
        const terminals = document.querySelectorAll('.feature-terminal');

        terminals.forEach((terminal, index) => {
            const miniRain = terminal.querySelector('.matrix-mini-rain');
            if (miniRain && !this.isReducedMotion) {
                this.createMiniMatrixRain(miniRain, index);
            }

            const loadingBar = terminal.querySelector('.loading-progress');
            if (loadingBar && !this.isReducedMotion) {
                this.animateLoadingBar(loadingBar, index);
            }
        });
    }

    createMiniMatrixRain(container, delay = 0) {
        const chars = 'アカサタナハマヤラワガザダバパ0123456789';
        const columns = 8;

        for (let i = 0; i < columns; i++) {
            const drop = document.createElement('div');
            drop.style.cssText = `
                position: absolute;
                left: ${i * 12}px;
                top: -20px;
                color: #4cc9f0;
                font-size: 10px;
                font-family: 'Source Code Pro', monospace;
                text-shadow: 0 0 3px #4cc9f0;
                animation: mini-rain-drop 2s linear infinite;
                animation-delay: ${delay * 0.5 + i * 0.2}s;
            `;

            const animateChar = () => {
                drop.textContent = chars[Math.floor(Math.random() * chars.length)];
            };

            animateChar();
            setInterval(animateChar, 100);
            container.appendChild(drop);
        }
    }

    animateLoadingBar(bar, delay = 0) {
        setTimeout(() => {
            bar.style.animation = 'loading 2s ease-in-out infinite';
        }, delay * 500);
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
                mobileToggle.setAttribute('aria-expanded', !isOpen);
                navLinks.classList.toggle('mobile-open');

                // Animate hamburger
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach((span, index) => {
                    span.style.transform = !isOpen ?
                        (index === 0 ? 'rotate(45deg) translateY(6px)' :
                         index === 1 ? 'opacity(0)' :
                         'rotate(-45deg) translateY(-6px)') : '';
                });
            });
        }
    }

    setupSmoothScrolling() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initializeAnimations() {
        if (!this.isReducedMotion) {
            this.addScrollAnimations();
            this.addHoverEffects();
            this.addMatrixEffects();
        }
    }

    addScrollAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes mini-rain-drop {
                0% { transform: translateY(-20px); opacity: 1; }
                100% { transform: translateY(80px); opacity: 0; }
            }

            @keyframes glitch-effect {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-1px, 1px); }
                40% { transform: translate(-1px, -1px); }
                60% { transform: translate(1px, 1px); }
                80% { transform: translate(1px, -1px); }
            }

            .nav-links.mobile-open {
                display: flex;
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: rgba(0, 8, 20, 0.98);
                flex-direction: column;
                padding: 2rem;
                border-top: 1px solid var(--matrix-border);
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    addHoverEffects() {
        // Add interactive hover effects for feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    const terminal = card.querySelector('.terminal-window');
                    if (terminal) {
                        terminal.style.animation = 'glitch-effect 0.3s ease';
                        setTimeout(() => {
                            terminal.style.animation = '';
                        }, 300);
                    }
                }
            });
        });
    }

    addMatrixEffects() {
        // Random glitch effects on pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            const addRandomGlitch = () => {
                if (Math.random() < 0.02 && !this.isReducedMotion) { // 2% chance
                    card.style.animation = 'glitch-effect 0.2s ease';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 200);
                }
            };

            setInterval(addRandomGlitch, 1000);
        });
    }

    setupIntersectionObserver() {
        // Animate elements on scroll into view
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.feature-card, .pricing-card, .section-header, .demo-content'
        );

        animateElements.forEach(el => {
            observer.observe(el);
        });

        // Add animation styles
        if (!this.isReducedMotion) {
            const animationStyle = document.createElement('style');
            animationStyle.textContent = `
                .feature-card,
                .pricing-card,
                .section-header,
                .demo-content {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .animate-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }

                .feature-card.animate-in {
                    transition-delay: 0.1s;
                }

                .pricing-card.animate-in {
                    transition-delay: 0.2s;
                }
            `;
            document.head.appendChild(animationStyle);
        }
    }

    // Analytics and tracking methods
    trackInteraction(action, element) {
        // Placeholder for analytics tracking
        console.log(`Matrix Landing: ${action} on ${element}`);

        // Example: gtag('event', action, { custom_parameter: element });
    }

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                console.log(`Matrix Landing loaded in ${loadTime}ms`);
            });
        }
    }
}

// Matrix-specific utility functions
class MatrixUtils {
    static generateMatrixText(length = 10) {
        const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static createGlitchEffect(element, duration = 300) {
        const originalText = element.textContent;
        const glitchInterval = setInterval(() => {
            element.textContent = this.generateMatrixText(originalText.length);
        }, 50);

        setTimeout(() => {
            clearInterval(glitchInterval);
            element.textContent = originalText;
        }, duration);
    }

    static addMatrixTrail(element) {
        element.addEventListener('mouseenter', () => {
            const trail = document.createElement('div');
            trail.style.cssText = `
                position: absolute;
                pointer-events: none;
                color: #4cc9f0;
                font-family: 'Source Code Pro', monospace;
                font-size: 10px;
                z-index: 1000;
                animation: trail-fade 1s ease-out forwards;
            `;
            trail.textContent = this.generateMatrixText(5);

            document.body.appendChild(trail);

            const moveTrail = (e) => {
                trail.style.left = (e.clientX + 10) + 'px';
                trail.style.top = (e.clientY - 10) + 'px';
            };

            element.addEventListener('mousemove', moveTrail);

            setTimeout(() => {
                element.removeEventListener('mousemove', moveTrail);
                trail.remove();
            }, 1000);
        });
    }
}

// Custom event system for component communication
class MatrixEventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main landing page manager
    window.landingPageManager = new LandingPageManager();
    window.matrixUtils = MatrixUtils;
    window.matrixEvents = new MatrixEventEmitter();

    // Measure performance
    window.landingPageManager.measurePerformance();

    // Add keyboard navigation enhancements
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            if (mobileToggle && navLinks && navLinks.classList.contains('mobile-open')) {
                mobileToggle.click();
            }
        }

        // Space bar or Enter on buttons should trigger click
        if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName === 'BUTTON') {
            e.preventDefault();
            e.target.click();
        }
    });

    // Add focus management for better keyboard navigation
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = document.querySelectorAll(focusableElements);

    // Ensure proper focus order
    focusableContent.forEach((element, index) => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    });

    // Add visual focus indicators
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        *:focus {
            outline: 2px solid #4cc9f0 !important;
            outline-offset: 2px !important;
        }

        *:focus:not(:focus-visible) {
            outline: none !important;
        }

        *:focus-visible {
            outline: 2px solid #4cc9f0 !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(focusStyle);

    console.log('Matrix Terminal Landing Page initialized successfully');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LandingPageManager, MatrixUtils, MatrixEventEmitter };
}