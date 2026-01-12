// Modern Gallery Slider - Circular pattern with automatic display
(function() {
    'use strict';
    
    const galleryFolder = 'pictures/gallery/';
    const imageCount = 12;
    const autoSlideInterval = 4000; // 4 seconds
    
    let currentSlideIndex = 0;
    let slides = [];
    let autoSlideTimer = null;
    
    // Initialize slider
    function initSlider() {
        const track = document.getElementById('sliderTrack');
        const indicators = document.getElementById('sliderIndicators');
        
        if (!track || !indicators) {
            console.error('Slider elements not found');
            return;
        }
        
        // Clear existing content
        track.innerHTML = '';
        indicators.innerHTML = '';
        slides = [];
        
        // Create slides for images 1-12
        for (let i = 1; i <= imageCount; i++) {
            const slide = document.createElement('div');
            slide.className = 'slider-slide' + (i === 1 ? ' active' : '');
            slide.setAttribute('data-index', i - 1);
            
            const img = document.createElement('img');
            img.src = `${galleryFolder}${i}.jpg`;
            img.alt = `TRIOOO hookah Gallery ${i}`;
            
            slide.appendChild(img);
            track.appendChild(slide);
            
            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = 'slider-indicator' + (i === 1 ? ' active' : '');
            indicator.setAttribute('data-index', i - 1);
            indicator.addEventListener('click', () => goToSlide(i - 1));
            indicators.appendChild(indicator);
            
            slides.push(slide);
        }
        
        // Setup navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }
        
        // Pause auto-slide on hover
        const container = track.closest('.slider-container');
        if (container) {
            container.addEventListener('mouseenter', () => {
                clearAutoSlide();
            });
            container.addEventListener('mouseleave', () => {
                startAutoSlide();
            });
        }
        
        // Start auto-slide
        startAutoSlide();
    }
    
    // Update slider display
    function updateSlider() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlideIndex) {
                slide.classList.add('active');
            }
        });
        
        // Update indicators
        const indicatorElements = document.querySelectorAll('#sliderIndicators .slider-indicator');
        indicatorElements.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if (index === currentSlideIndex) {
                indicator.classList.add('active');
            }
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;
        currentSlideIndex = index;
        updateSlider();
        clearAutoSlide();
        startAutoSlide();
    }
    
    // Next slide (circular)
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSlider();
    }
    
    // Previous slide (circular)
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    // Start auto-slide
    function startAutoSlide() {
        clearAutoSlide();
        autoSlideTimer = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);
    }
    
    // Clear auto-slide
    function clearAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();
