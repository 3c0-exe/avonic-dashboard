// Scroll Animation System using Intersection Observer
// Optimized for performance with minimal reflows

class ScrollAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px',
            ...options
        };
        
        this.observer = null;
        this.init();
    }

    init() {
        // Create Intersection Observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.options
        );

        // Observe all elements with animation classes
        this.observeElements();
    }

    observeElements() {
        // Define animation selectors
        const animatedElements = document.querySelectorAll(`
            .hero-section,
            .dedication,
            .worm-fact,
            .how-to-get-started,
            .tutorial-videos,
            .still-curious,
            .sdg-sec,
            .FAQ-section,
            .info-card-subcontainer,
            .tutorial-card,
            .sdg
        `);

        animatedElements.forEach((el) => {
            el.classList.add('animate-on-scroll');
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('animated');
                
                // Optional: Stop observing after animation (for performance)
                // this.observer.unobserve(entry.target);
            }
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Stagger animation for card grids
function initStaggerAnimations() {
    const cardContainers = document.querySelectorAll('.info-card-container, .tut-card-container, .sdg-container');
    
    cardContainers.forEach(container => {
        const cards = container.children;
        Array.from(cards).forEach((card, index) => {
            card.style.setProperty('--stagger-delay', `${index * 0.1}s`);
        });
    });
}

// Parallax effect for hero section - DISABLED FOR BIN CLIPART
function initParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroHeight = hero.offsetHeight;
                
                if (scrolled < heroHeight) {
                    // REMOVED: Bin clipart parallax movement
                    // The bin clipart will now stay fixed in position
                    
                    // You can add parallax to other hero elements here if needed
                    // For example, the hero title or background elements
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll animator
    const animator = new ScrollAnimator({
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });

    // Initialize stagger animations
    initStaggerAnimations();

    // Initialize parallax (now disabled for bin clipart)
    initParallax();

    // Add smooth reveal to FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        item.style.setProperty('--stagger-delay', `${index * 0.05}s`);
    });
});

// Export for cleanup if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimator;
}