// Modern Gallery Slider - Auto-loads images from pictures/gallery folder
(function() {
    'use strict';
    
    const galleryFolder = 'pictures/gallery/';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const autoSlideInterval = 4000; // 4 seconds
    
    let currentSlideIndex = 0;
    let slides = [];
    let autoSlideTimer = null;
    
    // Function to detect and load all available gallery images
    function detectAndLoadGalleryImages() {
        return new Promise((resolve) => {
            const detectedImages = [];
            const maxImages = 50; // Maximum number to check
            let checked = 0;
            let foundCount = 0;
            let loadedCount = 0;
            
            // First, detect which images exist
            function checkImage(index) {
                if (index > maxImages) {
                    // All images checked, now load all detected images
                    if (detectedImages.length === 0) {
                        resolve([]);
                        return;
                    }
                    loadAllImages(detectedImages.sort((a, b) => a.index - b.index));
                    return;
                }
                
                const img = new Image();
                
                img.onload = function() {
                    // Image exists - add to detected list
                    detectedImages.push({
                        src: `${galleryFolder}${index}.jpg`,
                        alt: `TRIOOO hookah Gallery ${index}`,
                        index: index,
                        img: img // Store the loaded image
                    });
                    foundCount++;
                    checked++;
                    
                    // Continue checking next image
                    checkImage(index + 1);
                };
                
                img.onerror = function() {
                    // Image doesn't exist
                    checked++;
                    
                    // If we've found some images and then hit a gap, we might be done
                    // But continue checking a few more just in case
                    if (foundCount > 0 && checked > foundCount + 5) {
                        // We've checked 5 more than we found, likely done
                        if (detectedImages.length === 0) {
                            resolve([]);
                            return;
                        }
                        loadAllImages(detectedImages.sort((a, b) => a.index - b.index));
                        return;
                    }
                    
                    // Continue checking next image
                    checkImage(index + 1);
                };
                
                // Start loading the image
                img.src = `${galleryFolder}${index}.jpg`;
            }
            
            // Load all detected images to ensure they're fully loaded
            function loadAllImages(images) {
                if (images.length === 0) {
                    resolve([]);
                    return;
                }
                
                const loadedImages = [];
                let imagesToLoad = images.length;
                let imagesLoaded = 0;
                
                images.forEach((imageData) => {
                    const img = new Image();
                    
                    img.onload = function() {
                        loadedImages.push({
                            src: imageData.src,
                            alt: imageData.alt,
                            index: imageData.index,
                            loaded: true
                        });
                        imagesLoaded++;
                        
                        // When all images are loaded, resolve
                        if (imagesLoaded === imagesToLoad) {
                            resolve(loadedImages.sort((a, b) => a.index - b.index));
                        }
                    };
                    
                    img.onerror = function() {
                        // Even if detection passed, loading might fail - skip this image
                        imagesLoaded++;
                        if (imagesLoaded === imagesToLoad) {
                            resolve(loadedImages.sort((a, b) => a.index - b.index));
                        }
                    };
                    
                    // Load the image
                    img.src = imageData.src;
                });
            }
            
            // Start checking from image 1
            checkImage(1);
        });
    }
    
    // Function to get gallery images (wrapper for compatibility)
    async function getGalleryImages() {
        const loadedImages = await detectAndLoadGalleryImages();
        // Remove extra properties before returning
        return loadedImages.map(img => ({
            src: img.src,
            alt: img.alt
        }));
    }
    
    // Initialize slider
    async function initSlider() {
        try {
            const track = document.getElementById('sliderTrack');
            const indicators = document.getElementById('sliderIndicators');
            
            if (!track || !indicators) {
                console.error('Slider elements not found');
                return;
            }
            
            // Get gallery images (now async)
            const images = await getGalleryImages();
            
            if (images.length === 0) {
                console.warn('No gallery images found');
                track.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">No images found</div>';
                return;
            }
            
            console.log(`Found ${images.length} gallery images`);
        
        // Preload all images before showing slider
        const allImagesToLoad = [
            images[images.length - 1], // Last image (for clone)
            ...images, // All original images
            images[0] // First image (for clone)
        ];
        
            // Wait for all images to load
            await Promise.all(allImagesToLoad.map(image => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if one fails
                    img.src = image.src;
                });
            }));
            
            // Clear loading message
            track.innerHTML = '';
            
            // Create slides - duplicate first and last for infinite loop
            // Add clone of last image at the beginning
            const lastImage = images[images.length - 1];
            const lastSlide = document.createElement('div');
            lastSlide.className = 'slider-slide clone';
            lastSlide.innerHTML = `<img src="${lastImage.src}" alt="${lastImage.alt}">`;
            track.appendChild(lastSlide);
            
            // Create original slides
            images.forEach((image, index) => {
                const slide = document.createElement('div');
                slide.className = 'slider-slide' + (index === 0 ? ' active' : '');
                slide.setAttribute('data-index', index);
                slide.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
                track.appendChild(slide);
                
                // Create indicator
                const indicator = document.createElement('div');
                indicator.className = 'slider-indicator' + (index === 0 ? ' active' : '');
                indicator.setAttribute('data-index', index);
                indicator.addEventListener('click', () => goToSlide(index));
                indicators.appendChild(indicator);
            });
            
            // Add clone of first image at the end
            const firstImage = images[0];
            const firstSlide = document.createElement('div');
            firstSlide.className = 'slider-slide clone';
            firstSlide.innerHTML = `<img src="${firstImage.src}" alt="${firstImage.alt}">`;
            track.appendChild(firstSlide);
            
            slides = Array.from(track.querySelectorAll('.slider-slide'));
            
            // Start at position 1 (first real slide, after the last clone)
            currentSlideIndex = 0;
            updateSlider(true); // No animation on initial load
            
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
            
            // Pause on hover
            const container = document.querySelector('.slider-container');
            if (container) {
                container.addEventListener('mouseenter', clearAutoSlide);
                container.addEventListener('mouseleave', startAutoSlide);
            }
            
            // Start auto-slide
            startAutoSlide();
        } catch (error) {
            console.error('Error loading gallery images:', error);
            const track = document.getElementById('sliderTrack');
            if (track) {
                track.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">Error loading images</div>';
            }
        }
    }
    
    function updateSlider(instant = false) {
        const totalRealSlides = slides.length - 2; // Exclude clones
        if (totalRealSlides === 0) return;
        
        // Ensure currentSlideIndex is within bounds
        if (currentSlideIndex < 0) {
            currentSlideIndex = totalRealSlides - 1;
        } else if (currentSlideIndex >= totalRealSlides) {
            currentSlideIndex = 0;
        }
        
        // Calculate previous and next indices (for real slides only)
        const prevIndex = (currentSlideIndex - 1 + totalRealSlides) % totalRealSlides;
        const nextIndex = (currentSlideIndex + 1) % totalRealSlides;
        
        // Update all slides (including clones)
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            slide.style.display = 'flex';
            
            // Skip clones for class assignment
            if (slide.classList.contains('clone')) {
                return;
            }
            
            const realIndex = parseInt(slide.getAttribute('data-index'));
            if (realIndex === prevIndex) {
                slide.classList.add('prev');
            } else if (realIndex === currentSlideIndex) {
                slide.classList.add('active');
            } else if (realIndex === nextIndex) {
                slide.classList.add('next');
            }
        });
        
        // Calculate scroll position - center the active slide
        // Position in track: 0 = last clone, 1 to totalRealSlides = real slides, totalRealSlides + 1 = first clone
        const track = document.getElementById('sliderTrack');
        if (track) {
            const slideWidthPercent = 33.333;
            const gapPercent = 2;
            const totalSlideWidth = slideWidthPercent + gapPercent;
            
            // Track position includes clones, so we add 1 (position 0 is last clone, position 1 is first real slide)
            const trackPosition = currentSlideIndex + 1;
            
            const centerPosition = 50 - (slideWidthPercent / 2);
            const currentPosition = trackPosition * totalSlideWidth;
            const translateX = centerPosition - currentPosition;
            
            if (instant) {
                track.style.transition = 'none';
            } else {
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            
            track.style.transform = `translateX(${translateX}%)`;
        }
        
        // Update indicators
        const indicatorElements = document.querySelectorAll('.slider-indicator');
        indicatorElements.forEach((indicator, index) => {
            if (index === currentSlideIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    function nextSlide() {
        const totalRealSlides = slides.length - 2; // Exclude clones
        
        // If we're at the last slide, we'll animate to the first clone, then jump
        if (currentSlideIndex === totalRealSlides - 1) {
            // Animate to the clone at the end
            const track = document.getElementById('sliderTrack');
            if (track) {
                const slideWidthPercent = 33.333;
                const gapPercent = 2;
                const totalSlideWidth = slideWidthPercent + gapPercent;
                const centerPosition = 50 - (slideWidthPercent / 2);
                const trackPosition = totalRealSlides + 1; // Position of first clone
                const currentPosition = trackPosition * totalSlideWidth;
                const translateX = centerPosition - currentPosition;
                
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform = `translateX(${translateX}%)`;
                
                // After animation, jump to first slide
                setTimeout(() => {
                    currentSlideIndex = 0;
                    updateSlider(true);
                }, 800);
            }
        } else {
            currentSlideIndex = (currentSlideIndex + 1) % totalRealSlides;
            updateSlider();
        }
    }
    
    function prevSlide() {
        const totalRealSlides = slides.length - 2; // Exclude clones
        
        // If we're at the first slide, we'll animate to the last clone, then jump
        if (currentSlideIndex === 0) {
            // Animate to the clone at the beginning
            const track = document.getElementById('sliderTrack');
            if (track) {
                const slideWidthPercent = 33.333;
                const gapPercent = 2;
                const totalSlideWidth = slideWidthPercent + gapPercent;
                const centerPosition = 50 - (slideWidthPercent / 2);
                const trackPosition = 0; // Position of last clone
                const currentPosition = trackPosition * totalSlideWidth;
                const translateX = centerPosition - currentPosition;
                
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform = `translateX(${translateX}%)`;
                
                // After animation, jump to last slide
                setTimeout(() => {
                    currentSlideIndex = totalRealSlides - 1;
                    updateSlider(true);
                }, 800);
            }
        } else {
            currentSlideIndex = (currentSlideIndex - 1 + totalRealSlides) % totalRealSlides;
            updateSlider();
        }
    }
    
    function goToSlide(index) {
        const totalRealSlides = slides.length - 2; // Exclude clones
        if (index >= 0 && index < totalRealSlides) {
            clearAutoSlide();
            currentSlideIndex = index;
            updateSlider();
            startAutoSlide();
        }
    }
    
    function startAutoSlide() {
        clearAutoSlide();
        autoSlideTimer = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);
    }
    
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

