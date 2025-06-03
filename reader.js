// COMIC READER JAVASCRIPT
// Page navigation and reader functionality with story branching

document.addEventListener('DOMContentLoaded', function() {
    
    // === READER BURGER MENU ===
    const readerBurger = document.querySelector('.reader-burger');
    const readerControls = document.querySelector('.reader-controls');
    
    // Toggle reader mobile menu
    if (readerBurger) {
        readerBurger.addEventListener('click', function() {
            readerBurger.classList.toggle('active');
            readerControls.classList.toggle('active');
        });
    }
    
    // Close reader menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            !readerBurger.contains(e.target) && 
            !readerControls.contains(e.target) && 
            readerControls.classList.contains('active')) {
            readerBurger.classList.remove('active');
            readerControls.classList.remove('active');
        }
    });
    
    // Close reader menu on window resize if window becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            readerBurger.classList.remove('active');
            readerControls.classList.remove('active');
        }
    });
    
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
    const backgroundAudio = document.getElementById('background-audio');
    
    // === AUDIO CONTROLS ===
    let audioEnabled = false;
    let currentVolume = 0.3; // Default volume
    let previousPageId = null;
    let currentFadeInterval = null; // Track current fade operation

    // Define scenes that should have audio playing (now includes all scenes)
    const audioScenes = new Set(['1', '2', '2a', '2b', '3a', '3b', '4', '5a', '5b', '6a', '6b', '7', '8', '9a', '9b', '10a', '10b', '11']);
    
    // Define specific volume levels for each scene
    const sceneVolumes = new Map([
        ['1', 0.2],    // Opening scene - Subtle introduction
        ['2', 0.25],   // Choice point - Building anticipation
        ['2a', 0.15],  // Ahmed hides - Subdued atmosphere
        ['2b', 0.3],   // Ahmed chooses to greet - Rising action
        ['3a', 0.4],   // Ahmed greets the guest - Welcoming moment
        ['3b', 0.2],   // Story end (hide path) - Somber ending
        ['4', 0.35],   // Guest enters - Traditional hospitality begins
        ['5a', 0.35],  // Wrong hand shown - Maintain atmosphere
        ['5b', 0.35],  // Correct hand shown - Maintain atmosphere
        ['6a', 0.35],  // Guest corrects Ahmed - Maintain atmosphere
        ['6b', 0.35],  // Guest approves - Maintain atmosphere
        ['7', 0.5],    // Pouring gahwa - Ceremonial moment (peak)
        ['8', 0.3],    // Guest signals - Crucial cultural moment
        ['9a', 0.4],   // Ahmed chooses respect - Good choice
        ['9b', 0.3],   // Ahmed chooses refill - Mistake
        ['10a', 0.45], // Takes cup & respects signal - Positive ending
        ['10b', 0.3],  // Refills cup - Learning moment
        ['11', 0.6]    // Final message - Reflective ending (emotional peak)
    ]);

    // Define scenes that should have cinematic effects
    const cinematicScenes = new Set(['2b', '3a', '7', '11']);

    function initAudio() {
        if (backgroundAudio) {
            backgroundAudio.volume = 0;
            backgroundAudio.currentTime = 0;
        }
    }

    function clearCurrentFade() {
        if (currentFadeInterval) {
            clearInterval(currentFadeInterval);
            currentFadeInterval = null;
        }
    }

    function fadeAudioVolume(startVolume, endVolume, duration) {
        if (!backgroundAudio) return;
        
        // Clear any existing fade operation
        clearCurrentFade();
        
        backgroundAudio.volume = startVolume;
        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = (endVolume - startVolume) / steps;
        
        let currentStep = 0;
        currentFadeInterval = setInterval(() => {
            currentStep++;
            backgroundAudio.volume = Math.max(0, Math.min(1, startVolume + (volumeStep * currentStep)));
            
            if (currentStep >= steps) {
                clearInterval(currentFadeInterval);
                currentFadeInterval = null;
                backgroundAudio.volume = endVolume;
                
                // If fading to 0, pause the audio
                if (endVolume === 0) {
                    backgroundAudio.pause();
                }
            }
        }, stepDuration);
    }

    function playAudioWithFadeIn(volume = currentVolume, duration = 2000) {
        if (!backgroundAudio || !audioEnabled) return;
        
        const playPromise = backgroundAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                fadeAudioVolume(0, volume, duration);
            }).catch(error => {
                console.log('Audio play prevented by browser:', error);
            });
        }
    }

    function pauseAudioWithFadeOut(duration = 1500) {
        if (!backgroundAudio || backgroundAudio.paused) return;
        
        fadeAudioVolume(backgroundAudio.volume, 0, duration);
    }

    function resumeAudioWithFadeIn(targetVolume, duration = 2000) {
        if (!backgroundAudio || !audioEnabled) return;
        
        if (backgroundAudio.paused) {
            const playPromise = backgroundAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    fadeAudioVolume(0, targetVolume, duration);
                }).catch(error => {
                    console.log('Audio play prevented by browser:', error);
                });
            }
        } else {
            // Already playing, just adjust volume
            fadeAudioVolume(backgroundAudio.volume, targetVolume, duration);
        }
    }

    function createCinematicEffect(pageElement) {
        // Add subtle screen flash effect for dramatic moments
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, transparent 40%, rgba(218, 165, 32, 0.1) 100%);
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(flash);
        
        // Flash effect
        setTimeout(() => flash.style.opacity = '1', 50);
        setTimeout(() => flash.style.opacity = '0', 800);
        setTimeout(() => document.body.removeChild(flash), 1300);
        
        // Add page glow effect
        if (pageElement) {
            const pageImage = pageElement.querySelector('.page-image');
            if (pageImage) {
                pageImage.style.boxShadow = '0 0 30px rgba(218, 165, 32, 0.5)';
                pageImage.style.transition = 'box-shadow 2s ease';
                setTimeout(() => {
                    pageImage.style.boxShadow = '';
                }, 3000);
            }
        }
    }

    function manageAudioTransition(currentPageId, pageElement) {
        if (!audioEnabled) {
            audioEnabled = true; // Enable on first interaction
        }

        // Since audio plays on all scenes now, we only need to manage volume transitions
        const targetVolume = sceneVolumes.get(currentPageId) || currentVolume;

        if (backgroundAudio && backgroundAudio.paused) {
            // Start playing if not already playing
            resumeAudioWithFadeIn(targetVolume, 2000);
        } else if (backgroundAudio && !backgroundAudio.paused) {
            // Already playing, just adjust volume smoothly
            fadeAudioVolume(backgroundAudio.volume, targetVolume, 1500);
        }

        // Add cinematic effects for special scenes
        if (cinematicScenes.has(currentPageId)) {
            createCinematicEffect(pageElement);
        }

        // Update previous page tracking
        previousPageId = currentPageId;
    }
    
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
        initAudio();
        updatePageDisplay();
        updateNavigation();
        updateProgress();
        setupChoiceButtons();
        setupDotNavigation();
        setupAudioControl();
        
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
        // Store current page for audio transition tracking
        const currentActivePage = document.querySelector('.comic-page.active');
        if (currentActivePage) {
            previousPageId = currentActivePage.getAttribute('data-page');
        }

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
    
    // === DOT NAVIGATION ===
    function setupDotNavigation() {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                const currentPath = storyPaths[storyPath];
                if (index < currentPath.length) {
                    const targetPageId = currentPath[index];
                    goToPage(targetPageId);
                }
            });
        });
    }
    
    // === AUDIO CONTROL ===
    function setupAudioControl() {
        // Add audio toggle button to controls
        const audioBtn = document.createElement('button');
        audioBtn.className = 'control-btn';
        audioBtn.id = 'audio-btn';
        audioBtn.textContent = '♪ MUSIC';
        audioBtn.title = 'Toggle background music';
        
        const readerControls = document.querySelector('.reader-controls');
        if (readerControls && fullscreenBtn) {
            readerControls.insertBefore(audioBtn, fullscreenBtn);
        }
        
        audioBtn.addEventListener('click', function() {
            if (!audioEnabled) {
                audioEnabled = true;
                audioBtn.textContent = '♪ ON';
                audioBtn.style.backgroundColor = '#DAA520';
                // Start audio immediately at the current scene's volume
                const activePage = document.querySelector('.comic-page.active');
                if (activePage) {
                    const pageId = activePage.getAttribute('data-page');
                    const targetVolume = sceneVolumes.get(pageId) || currentVolume;
                    resumeAudioWithFadeIn(targetVolume, 1000);
                }
            } else {
                audioEnabled = false;
                audioBtn.textContent = '♪ OFF';
                audioBtn.style.backgroundColor = '#5D4E37';
                pauseAudioWithFadeOut(500);
            }
        });
        
        // Enable audio on first user interaction
        document.addEventListener('click', function enableAudioOnFirstClick() {
            if (!audioEnabled) {
                audioEnabled = true;
                audioBtn.textContent = '♪ ON';
                audioBtn.style.backgroundColor = '#DAA520';
            }
            document.removeEventListener('click', enableAudioOnFirstClick);
        }, { once: true });
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
        
        // Trigger audio and cinematic effects for this scene
        manageAudioTransition(pageNum, targetPage);
        
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

        // Update navigation dots to show progress through current story path
        const dotsContainer = document.querySelector('.page-dots');
        if (dotsContainer) {
            dotsContainer.style.display = 'flex'; // Always show the dots
            
            // Update dots to reflect current story path progress
            dots.forEach((dot, index) => {
                dot.classList.remove('active');
                if (index < currentPath.length) {
                    dot.style.display = 'block';
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    }
                } else {
                    dot.style.display = 'none';
                }
            });
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
        // Reset audio tracking state
        previousPageId = null;
        
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
        
        // Start audio for scene 1 if audio is enabled
        if (audioEnabled) {
            const targetVolume = sceneVolumes.get('1') || 0.2;
            resumeAudioWithFadeIn(targetVolume, 2000);
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