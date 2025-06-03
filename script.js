// BRUTALIST COMIC WEBSITE JAVASCRIPT
// Parallax effects and interactions

document.addEventListener('DOMContentLoaded', function() {
    
    // === MOBILE BURGER MENU ===
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileNavLinks = document.querySelector('.nav-links');
    const mobileNavItems = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            mobileNavLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a nav link
    mobileNavItems.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                burgerMenu.classList.remove('active');
                mobileNavLinks.classList.remove('active');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            !burgerMenu.contains(e.target) && 
            !mobileNavLinks.contains(e.target) && 
            mobileNavLinks.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            mobileNavLinks.classList.remove('active');
        }
    });
    
    // Close mobile menu on window resize if window becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            burgerMenu.classList.remove('active');
            mobileNavLinks.classList.remove('active');
        }
    });
    
    // === PARALLAX EFFECTS ===
    const parallaxBg = document.querySelector('.parallax-bg');
    const comicPanels = document.querySelectorAll('.comic-panel[data-parallax-speed]');
    
    // Hero parallax background
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        if (parallaxBg) {
            const yPos = -(scrolled * parallaxSpeed);
            parallaxBg.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
        
        // Comic panels parallax
        comicPanels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            const speed = parseFloat(panel.dataset.parallaxSpeed);
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const yPos = (scrolled - panel.offsetTop) * speed;
                panel.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
    
    // Throttle scroll events for performance
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                updateNavigation();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // === NAVIGATION HIGHLIGHTING ===
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    function updateNavigation() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // === SMOOTH SCROLLING FOR NAVIGATION ===
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // === COMIC PANEL INTERACTIONS ===
    const comicPanelsAll = document.querySelectorAll('.comic-panel');
    
    comicPanelsAll.forEach(panel => {
        panel.addEventListener('click', function() {
            // Add click effect
            this.style.transform = 'translate(-8px, -8px)';
            this.style.boxShadow = '12px 12px 0px #FFFF00';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
            }, 200);
            
            // Here you could add navigation to comic reader
            console.log('Comic panel clicked:', this.querySelector('.panel-title').textContent);
        });
        
        // Add hover sound effect simulation
        panel.addEventListener('mouseenter', function() {
            // Add subtle vibration effect
            this.style.transition = 'all 0.1s ease';
        });
        
        panel.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.2s ease';
        });
    });
    
    // === HERO SECTION INTERACTIVE ELEMENTS ===
    const heroTitle = document.querySelector('.hero-title');
    const ctaButton = document.querySelector('.cta-button');
    
    // Add glitch effect to hero title
    if (heroTitle) {
        setInterval(() => {
            if (Math.random() < 0.05) { // 5% chance every interval
                heroTitle.style.textShadow = '4px 4px 0px #FF0000, -4px -4px 0px #FFFF00';
                setTimeout(() => {
                    heroTitle.style.textShadow = '4px 4px 0px #000000';
                }, 100);
            }
        }, 1000);
    }
    
    // CTA button interaction
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            // Don't prevent default - allow link to work
            
            // Add explosive effect but don't prevent navigation
            this.style.transform = 'scale(0.95)';
            this.style.backgroundColor = '#FFFF00';
            this.style.color = '#000000';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 150);
            
            // Let the link navigate naturally to reader.html
        });
    }
    
    // === PERFORMANCE OPTIMIZATIONS ===
    // Intersection Observer for comic panels
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };
    
    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    comicPanelsAll.forEach(panel => {
        panelObserver.observe(panel);
    });
    
    // === KEYBOARD NAVIGATION ===
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                window.scrollBy(0, -100);
                break;
            case 'ArrowDown':
                e.preventDefault();
                window.scrollBy(0, 100);
                break;
            case 'Home':
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'End':
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                break;
        }
    });
    
    // === INITIAL SETUP ===
    updateParallax();
    updateNavigation();
    
    // Add loaded class to body for any CSS transitions
    document.body.classList.add('loaded');
    
    console.log('UNDERGROUND COMICS INITIALIZED');
}); 