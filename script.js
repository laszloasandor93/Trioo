// Initialize Supabase client
let supabaseClient = null;

function initializeSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_CONFIG && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        }
    }
}

// Initialize on load
if (typeof supabase !== 'undefined' && typeof SUPABASE_CONFIG !== 'undefined') {
    initializeSupabase();
}

// Convert time string (HH:MM) to minutes since midnight for comparison
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const time = formatTime(timeStr);
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Check if current time is between opening and closing time
function isCurrentlyOpen(openingTime, closingTime) {
    if (!openingTime || !closingTime) {
        return false;
    }
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openingMinutes = timeToMinutes(openingTime);
    const closingMinutes = timeToMinutes(closingTime);
    
    // If times couldn't be parsed, assume closed
    if (openingMinutes === 0 && closingMinutes === 0) {
        return false;
    }
    
    // Handle case where closing time is next day (e.g., 02:00)
    if (closingMinutes < openingMinutes) {
        // Closing time is next day, so we're open if current time is >= opening OR < closing
        return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
    } else {
        // Normal case: opening and closing on same day
        return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
    }
}

// Update opening hours dropdown in menubar
function updateOpeningHoursDropdown(allData) {
    const dropdownContent = document.getElementById('openingHoursDropdownContent');
    if (!dropdownContent || !allData || allData.length === 0) {
        if (dropdownContent) {
            dropdownContent.innerHTML = '<div class="no-hours">No hours available</div>';
        }
        return;
    }

    // Define day order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort data by day order
    const sortedData = dayOrder.map(day => 
        allData.find(record => record.day && record.day.toLowerCase() === day.toLowerCase())
    ).filter(Boolean);

    // If some days are missing, add the rest
    allData.forEach(record => {
        if (!sortedData.find(r => r.day && r.day.toLowerCase() === record.day.toLowerCase())) {
            sortedData.push(record);
        }
    });

    if (sortedData.length === 0) {
        dropdownContent.innerHTML = '<div class="no-hours">No hours available</div>';
        return;
    }
    
    let html = '<div class="hours-list">';
    sortedData.forEach(record => {
        const openingTime = formatTime(record.opening_time);
        const closingTime = formatTime(record.closing_time);
        html += `<div class="hours-item">
            <span class="hours-day">${record.day}</span>
            <span class="hours-time">${openingTime} - ${closingTime}</span>
        </div>`;
    });
    html += '</div>';
    
    dropdownContent.innerHTML = html;
}

// Display all opening hours in the popup
function displayAllOpeningHours(allData) {
    const popupHoursContainer = document.getElementById('closedPopupHours');
    if (!popupHoursContainer) {
        return;
    }
    
    // Always clear the loading message
    if (!allData || allData.length === 0) {
        popupHoursContainer.innerHTML = '<div class="no-hours">No hours available</div>';
        return;
    }

    // Define day order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort data by day order
    const sortedData = dayOrder.map(day => 
        allData.find(record => record.day && record.day.toLowerCase() === day.toLowerCase())
    ).filter(Boolean);

    // If some days are missing, add the rest
    allData.forEach(record => {
        if (!sortedData.find(r => r.day && r.day.toLowerCase() === record.day.toLowerCase())) {
            sortedData.push(record);
        }
    });

    let html = '<div class="hours-list">';
    sortedData.forEach(record => {
        const openingTime = formatTime(record.opening_time);
        const closingTime = formatTime(record.closing_time);
        html += `<div class="hours-item">
            <span class="hours-day">${record.day}</span>
            <span class="hours-time">${openingTime} - ${closingTime}</span>
        </div>`;
    });
    html += '</div>';
    
    popupHoursContainer.innerHTML = html;
}

// Fetch and display opening hours for current day
async function loadOpeningHours() {
    const openingHoursElement = document.getElementById('openingHoursTime');
    const openingHoursContainer = document.getElementById('openingHours');
    const closedPopup = document.getElementById('closedPopup');
    
    if (!openingHoursElement || !openingHoursContainer) return;

    // Get current day name (Monday, Tuesday, etc.)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];

    try {
        // Re-initialize Supabase if needed
        if (!supabaseClient && typeof supabase !== 'undefined' && typeof SUPABASE_CONFIG !== 'undefined') {
            initializeSupabase();
        }

        // Ensure popup is hidden initially (will be shown if needed after data fetch)
        if (closedPopup) {
            closedPopup.style.display = 'none';
        }
        
        if (!supabaseClient) {
            openingHoursContainer.style.display = 'none';
            // Show popup if Supabase is not available
            if (closedPopup) {
                closedPopup.style.display = 'flex';
            }
            return;
        }

        if (!SUPABASE_CONFIG) {
            openingHoursContainer.style.display = 'none';
            // Show popup if config is not available
            if (closedPopup) {
                closedPopup.style.display = 'flex';
            }
            return;
        }
        
        // Get table name with fallback
        let tableName = SUPABASE_CONFIG.openingHoursTable ? SUPABASE_CONFIG.openingHoursTable.trim() : '';
        
        // Fallback if undefined
        if (!tableName) {
            tableName = 'opening_hours'; // Default table name
        }
        
        if (!tableName) {
            openingHoursContainer.style.display = 'none';
            // Show popup if table name is not configured
            if (closedPopup) {
                closedPopup.style.display = 'flex';
            }
            return;
        }

        // Fetch all records to check for case-insensitive match if needed
        const { data: allData, error: allDataError } = await supabaseClient
            .from(tableName)
            .select('*')
            .order('day');
        
        // If there's an error fetching all data, log it but continue
        if (allDataError) {
            console.error('Error fetching all opening hours:', allDataError);
        }
        
        // Ensure we always have an array to pass to displayAllOpeningHours
        const hoursData = allData || [];

        // Fetch opening hours for current day - get the whole record
        const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .eq('day', currentDay)
            .single();

        let dayData = null;
        
        if (error) {
            // Try case-insensitive match if exact match fails
            if (allData && allData.length > 0) {
                const similarDay = allData.find(record => 
                    record.day && record.day.toLowerCase() === currentDay.toLowerCase()
                );
                if (similarDay) {
                    dayData = similarDay;
                }
            }
        } else if (data) {
            dayData = data;
        }

        // Display all opening hours in popup (always call this)
        // This ensures the loading message is replaced
        displayAllOpeningHours(hoursData);

        // Get popup element once (already defined earlier in function)
        if (!dayData) {
            openingHoursContainer.style.display = 'none';
            if (closedPopup) {
                closedPopup.style.display = 'flex';
            }
            return;
        }

        // Only show/hide after data is successfully fetched
        // Check if currently open
        const isOpen = isCurrentlyOpen(dayData.opening_time, dayData.closing_time);
        console.log('Opening time:', dayData.opening_time, 'Closing time:', dayData.closing_time, 'Is open:', isOpen);
        
        if (isOpen) {
            // Remove closed class if it exists
            openingHoursContainer.classList.remove('closed');
            
            const closingTime = formatTime(dayData.closing_time);
            openingHoursElement.textContent = `${closingTime} | `;
            
            // Update date display
            const openingHoursDateElement = document.getElementById('openingHoursDate');
            if (openingHoursDateElement) {
                const today = new Date();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const currentDayName = days[today.getDay()];
                const monthName = months[today.getMonth()];
                const day = today.getDate();
                openingHoursDateElement.textContent = `${currentDayName}, ${monthName} ${day}`;
            }
            
            // Show all elements
            const openingHoursLabel = openingHoursContainer.querySelector('.opening-hours-label');
            const openingHoursDate = document.getElementById('openingHoursDate');
            const openingHoursArrow = openingHoursContainer.querySelector('.opening-hours-arrow');
            if (openingHoursLabel) openingHoursLabel.style.display = '';
            if (openingHoursDate) openingHoursDate.style.display = '';
            if (openingHoursArrow) openingHoursArrow.style.display = '';
            
            // Update dropdown with all opening hours
            updateOpeningHoursDropdown(hoursData);
            
            // Only show after data is fetched
            openingHoursContainer.style.display = 'flex';
            if (closedPopup) {
                closedPopup.style.display = 'none';
            }
        } else {
            // Show red "Closed" box when closed
            // Remove any previous state classes
            openingHoursContainer.classList.remove('closed');
            // Force reflow to ensure class removal is processed
            void openingHoursContainer.offsetHeight;
            // Add closed class
            openingHoursContainer.classList.add('closed');
            
            // Hide normal elements and show "Closed" text
            const openingHoursLabel = openingHoursContainer.querySelector('.opening-hours-label');
            const openingHoursDate = document.getElementById('openingHoursDate');
            const openingHoursArrow = openingHoursContainer.querySelector('.opening-hours-arrow');
            if (openingHoursLabel) openingHoursLabel.style.display = 'none';
            if (openingHoursDate) openingHoursDate.style.display = 'none';
            // Show arrow when closed so user knows there's a dropdown
            if (openingHoursArrow) {
                openingHoursArrow.style.display = '';
                openingHoursArrow.style.color = 'white';
            }
            
            // Set "Closed" text using translation
            const currentLang = localStorage.getItem('language') || 'en';
            const closedMessage = typeof getTranslation !== 'undefined' 
                ? (getTranslation('openingHours.closedMessage', currentLang) || 'Closed! Check our opening hours:')
                : 'Closed! Check our opening hours:';
            openingHoursElement.textContent = closedMessage;
            
            // Ensure the time element is visible and styled correctly
            openingHoursElement.style.display = '';
            openingHoursElement.style.color = 'white';
            
            // Update dropdown with all opening hours (so it shows on hover)
            updateOpeningHoursDropdown(hoursData);
            
            // Show the box with red background
            openingHoursContainer.style.display = 'flex';
            openingHoursContainer.style.background = 'rgba(239, 68, 68, 0.9)';
            openingHoursContainer.style.color = 'white';
            
            // Also show the closed popup
            if (closedPopup) {
                closedPopup.style.display = 'flex';
            }
            
            console.log('Restaurant is closed - showing red box', {
                container: openingHoursContainer,
                hasClosedClass: openingHoursContainer.classList.contains('closed'),
                display: openingHoursContainer.style.display
            });
        }
    } catch (error) {
        // Hide box on error and show popup
        openingHoursContainer.style.display = 'none';
        if (closedPopup) {
            closedPopup.style.display = 'flex';
        }
    }
}

// Format time from database (handles various formats)
function formatTime(time) {
    if (!time) return '';
    
    // If time is already in HH:MM format, return as is
    if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
        return time;
    }
    
    // If it's a time object or timestamp, extract hours and minutes
    if (time instanceof Date) {
        return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    // Try to parse as string
    const timeStr = String(time);
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        return `${hours}:${minutes}`;
    }
    
    return timeStr;
}

// Load opening hours when page loads
function waitForConfigAndLoad() {
    if (typeof supabase === 'undefined') {
        setTimeout(waitForConfigAndLoad, 100);
        return;
    }
    
    if (typeof SUPABASE_CONFIG === 'undefined') {
        setTimeout(waitForConfigAndLoad, 100);
        return;
    }
    
    // Initialize Supabase client
    if (!supabaseClient) {
        initializeSupabase();
    }
    
    // Load opening hours
    loadOpeningHours();
}

// Close popup function
function closeClosedPopup() {
    const closedPopup = document.getElementById('closedPopup');
    if (closedPopup) {
        closedPopup.style.display = 'none';
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    waitForConfigAndLoad();
    
    // Add close button functionality
    const closeButton = document.getElementById('closedPopupClose');
    if (closeButton) {
        closeButton.addEventListener('click', closeClosedPopup);
    }
    
    // Close popup when clicking outside the content
    const closedPopup = document.getElementById('closedPopup');
    if (closedPopup) {
        closedPopup.addEventListener('click', (e) => {
            // Only close if clicking the backdrop, not the content
            if (e.target === closedPopup) {
                closeClosedPopup();
            }
        });
    }
    
    // Close popup with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const closedPopup = document.getElementById('closedPopup');
            if (closedPopup && closedPopup.style.display === 'flex') {
                closeClosedPopup();
            }
        }
    });
});

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            // Special handling for About section - position title at top
            if (href === '#about') {
                const sectionTitle = target.querySelector('.section-title');
                if (sectionTitle) {
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 70;
                    // Calculate position of the title relative to document
                    const titleRect = sectionTitle.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const offsetTop = window.pageYOffset + titleRect.top - navbarHeight;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 70;
                    window.scrollTo({
                        top: target.offsetTop - navbarHeight,
                        behavior: 'smooth'
                    });
                }
            } else {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 26, 0.3)';
    } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.3)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .product-card, .gallery-item, .about-text, .about-image');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Lazy loading images enhancement
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Modern Gallery Slider - Circular pattern with automatic display
(function() {
    'use strict';
    
    const galleryFolder = 'pictures/gallery/';
    const imageCount = 12;
    const autoSlideInterval = 4000; // 4 seconds
    
    let currentSlideIndex = 0;
    let slides = [];
    let autoSlideTimer = null;
    let isUserInteracting = false;
    
    // Initialize slider
    function initSlider() {
        console.log('initSlider called');
        const track = document.getElementById('gallerySliderTrack');
        const indicators = document.getElementById('galleryIndicators');
        
        console.log('Track element:', track);
        console.log('Indicators element:', indicators);
        
        if (!track || !indicators) {
            console.error('Slider elements not found');
            return;
        }
        
        console.log('Slider elements found, initializing...');
        
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
            img.loading = 'lazy';
            
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
        const prevBtn = document.getElementById('galleryPrevBtn');
        const nextBtn = document.getElementById('galleryNextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                isUserInteracting = true;
                clearAutoSlide();
                prevSlide();
                resetAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                isUserInteracting = true;
                clearAutoSlide();
                nextSlide();
                resetAutoSlide();
            });
        }
        
        // Pause auto-slide on hover
        const container = track.closest('.slider-container');
        if (container) {
            container.addEventListener('mouseenter', () => {
                clearAutoSlide();
            });
            container.addEventListener('mouseleave', () => {
                if (!isUserInteracting) {
                    startAutoSlide();
                }
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
        const indicatorElements = document.querySelectorAll('#galleryIndicators .slider-indicator');
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
        isUserInteracting = true;
        clearAutoSlide();
        currentSlideIndex = index;
        updateSlider();
        resetAutoSlide();
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
            if (!isUserInteracting) {
                nextSlide();
            }
        }, autoSlideInterval);
    }
    
    // Clear auto-slide
    function clearAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // Reset auto-slide after user interaction
    function resetAutoSlide() {
        setTimeout(() => {
            isUserInteracting = false;
            startAutoSlide();
        }, autoSlideInterval);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        // DOM is already ready, but wait a bit to ensure all elements are rendered
        setTimeout(initSlider, 0);
    }
})();

// Reserve button popup functionality
document.addEventListener('DOMContentLoaded', () => {
    // Reserve button now uses smooth scroll to #reservation section (handled by the anchor link handler above)
});

