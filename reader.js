// COMIC READER JAVASCRIPT
// Page navigation and reader functionality with story branching

document.addEventListener('DOMContentLoaded', function() {
    
    // === READER STATE ===
    let currentPage = 1;
    let storyPath = 'main'; // 'main', 'greet', 'hide', 'wrong-hand', 'right-hand', 'respect', 'refill'
    let totalPages = 2; // Will be updated based on path
    
    // === DOM ELEMENTS ===
    const pages = document.querySelectorAll('.comic-page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentPageSpan = document.querySelector('.current-page');
    const totalPagesSpan = document.querySelector('.total-pages');
    const dots = document.querySelectorAll('.dot');
    const progressFill = document.querySelector('.progress-fill');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    // === STORY PATHS ===
    const storyPaths = {
        main: [1, 2], // Initial choice point
        hide: [1, 2, '2a', '3b'], // Hide path ends at story end
        greet: [1, 2, '2b', '3a', 4], // Greet path to hand choice
        'wrong-hand': [1, 2, '2b', '3a', 4, '5a', '6a', 7, 8], // Wrong hand path
        'right-hand': [1, 2, '2b', '3a', 4, '5b', '6b', 7, 8], // Right hand path
        respect: [1, 2, '2b', '3a', 4, 8, '9a', '10a', 11], // Respect signal path
        refill: [1, 2, '2b', '3a', 4, 8, '9b', '10b', 11] // Refill path
    };
    
    // === INITIALIZATION ===
    function init() {
        updatePageDisplay();
        updateNavigation();
        updateProgress();
        setupChoiceButtons();
        
        console.log('EMIRATI HOSPITALITY STORY INITIALIZED');
    }
    
    // === CHOICE HANDLING ===
    function setupChoiceButtons() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const choice = this.dataset.choice;
                handleChoice(choice);
            });
        });
    }
    
    function handleChoice(choice) {
        switch(choice) {
            case 'greet':
                storyPath = 'greet';
                totalPages = storyPaths.greet.length;
                goToPage('2b');
                break;
            case 'hide':
                storyPath = 'hide';
                totalPages = storyPaths.hide.length;
                goToPage('2a');
                break;
            case 'wrong-hand':
                storyPath = 'wrong-hand';
                totalPages = storyPaths['wrong-hand'].length;
                goToPage('5a');
                break;
            case 'right-hand':
                storyPath = 'right-hand';
                totalPages = storyPaths['right-hand'].length;
                goToPage('5b');
                break;
            case 'respect':
                storyPath = 'respect';
                totalPages = storyPaths.respect.length;
                goToPage('9a');
                break;
            case 'refill':
                storyPath = 'refill';
                totalPages = storyPaths.refill.length;
                goToPage('9b');
                break;
        }
        updateTotalPagesDisplay();
    }
    
    // === PAGE NAVIGATION ===
    function goToPage(pageNum) {
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`[data-page="${pageNum}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update current page index
        const currentPath = storyPaths[storyPath];
        const pageIndex = currentPath.indexOf(pageNum);
        if (pageIndex !== -1) {
            currentPage = pageIndex + 1;
        }
        
        updatePageDisplay();
        updateNavigation();
        updateProgress();
        
        // Add page turn effect
        addPageTurnEffect();
    }
    
    function nextPage() {
        const currentPath = storyPaths[storyPath];
        const currentIndex = currentPage - 1;
        
        if (currentIndex < currentPath.length - 1) {
            let nextPageId = currentPath[currentIndex + 1];
            
            // Handle special transitions
            if (storyPath === 'greet' && nextPageId === 4) {
                // At scene 4, we need to show choice buttons but not advance automatically
                goToPage(nextPageId);
                return;
            }
            
            if ((storyPath === 'wrong-hand' || storyPath === 'right-hand') && nextPageId === 8) {
                // At scene 8, we need to show choice buttons
                goToPage(nextPageId);
                return;
            }
            
            goToPage(nextPageId);
        }
    }
    
    function prevPage() {
        const currentPath = storyPaths[storyPath];
        const currentIndex = currentPage - 1;
        
        if (currentIndex > 0) {
            const prevPageId = currentPath[currentIndex - 1];
            goToPage(prevPageId);
        }
    }
    
    // === UPDATE FUNCTIONS ===
    function updatePageDisplay() {
        if (currentPageSpan) {
            currentPageSpan.textContent = currentPage.toString().padStart(2, '0');
        }
    }
    
    function updateTotalPagesDisplay() {
        if (totalPagesSpan) {
            totalPagesSpan.textContent = totalPages.toString().padStart(2, '0');
        }
    }
    
    function updateNavigation() {
        const currentPath = storyPaths[storyPath];
        const currentIndex = currentPage - 1;
        
        // Update navigation buttons
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
            const activePage = document.querySelector('.comic-page.active');
            const hasChoiceButtons = activePage && activePage.querySelector('.choice-buttons');
            
            // Disable next button if we're at a choice point or at the end
            nextBtn.disabled = hasChoiceButtons || currentIndex >= currentPath.length - 1;
        }
        
        // Hide navigation dots for simplicity in branching story
        const dotsContainer = document.querySelector('.page-dots');
        if (dotsContainer) {
            dotsContainer.style.display = 'none';
        }
    }
    
    function updateProgress() {
        if (progressFill) {
            const progress = (currentPage / totalPages) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }
    
    function addPageTurnEffect() {
        const activePage = document.querySelector('.comic-page.active .page-image');
        if (activePage) {
            activePage.style.transform = 'scale(0.95)';
            activePage.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                activePage.style.transform = '';
                activePage.style.transition = '';
            }, 200);
        }
    }
    
    // === RESTART FUNCTION ===
    window.restartStory = function() {
        storyPath = 'main';
        currentPage = 1;
        totalPages = 2;
        
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show first page
        const firstPage = document.querySelector('[data-page="1"]');
        if (firstPage) {
            firstPage.classList.add('active');
        }
        
        updatePageDisplay();
        updateTotalPagesDisplay();
        updateNavigation();
        updateProgress();
        
        // Show navigation dots again
        const dotsContainer = document.querySelector('.page-dots');
        if (dotsContainer) {
            dotsContainer.style.display = 'flex';
        }
    };
    
    // === EVENT LISTENERS ===
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', prevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextPage);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevPage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                e.preventDefault();
                nextPage();
                break;
            case 'Home':
                e.preventDefault();
                if (storyPath !== 'main') {
                    restartStory();
                }
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    });
    
    // Touch/Swipe navigation
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only trigger if horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - previous page
                prevPage();
            } else {
                // Swipe left - next page
                nextPage();
            }
        }
    }, { passive: true });
    
    // Click on page to go to next page (except for choice pages)
    pages.forEach(page => {
        const pageImage = page.querySelector('.page-image');
        if (pageImage && !page.querySelector('.choice-buttons')) {
            pageImage.addEventListener('click', function(e) {
                // Determine which side was clicked
                const rect = this.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickPos = clickX / rect.width;
                
                if (clickPos < 0.3) {
                    // Left side - previous page
                    prevPage();
                } else if (clickPos > 0.7) {
                    // Right side - next page
                    nextPage();
                } else {
                    // Center - next page (default)
                    nextPage();
                }
            });
        }
    });
    
    // Fullscreen functionality
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    // Settings (placeholder functionality)
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            // Toggle some reader settings
            document.body.classList.toggle('high-contrast');
            
            // Visual feedback
            this.style.backgroundColor = '#DAA520';
            this.style.color = '#2C1810';
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 200);
        });
    }
    
    // Fullscreen change event
    document.addEventListener('fullscreenchange', function() {
        if (fullscreenBtn) {
            if (document.fullscreenElement) {
                fullscreenBtn.textContent = 'EXIT';
                document.body.classList.add('fullscreen-mode');
            } else {
                fullscreenBtn.textContent = 'FULL';
                document.body.classList.remove('fullscreen-mode');
            }
        }
    });
    
    // === INITIALIZATION ===
    init();
    
}); 