// Initialize Supabase client
let supabaseClient = null;

function initializeSupabase() {
    console.log('[DEBUG] Initializing Supabase client...');
    console.log('[DEBUG] supabase available:', typeof supabase !== 'undefined');
    console.log('[DEBUG] SUPABASE_CONFIG available:', typeof SUPABASE_CONFIG !== 'undefined');
    
    if (typeof SUPABASE_CONFIG !== 'undefined') {
        console.log('[DEBUG] SUPABASE_CONFIG.url:', SUPABASE_CONFIG.url);
        console.log('[DEBUG] SUPABASE_CONFIG.anonKey:', SUPABASE_CONFIG.anonKey ? 'Present' : 'Missing');
        console.log('[DEBUG] SUPABASE_CONFIG.openingHoursTable:', SUPABASE_CONFIG.openingHoursTable);
    }
    
    if (typeof supabase !== 'undefined' && SUPABASE_CONFIG && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('[DEBUG] Supabase client initialized successfully');
        } else {
            console.warn('[DEBUG] Supabase credentials not configured (using placeholder values)');
        }
    } else {
        console.error('[DEBUG] Failed to initialize Supabase client');
        console.error('[DEBUG] - supabase available:', typeof supabase !== 'undefined');
        console.error('[DEBUG] - SUPABASE_CONFIG available:', typeof SUPABASE_CONFIG !== 'undefined');
        if (typeof SUPABASE_CONFIG !== 'undefined') {
            console.error('[DEBUG] - url present:', !!SUPABASE_CONFIG.url);
            console.error('[DEBUG] - anonKey present:', !!SUPABASE_CONFIG.anonKey);
        }
    }
}

// Initialize on load
if (typeof supabase !== 'undefined' && typeof SUPABASE_CONFIG !== 'undefined') {
    initializeSupabase();
}

// Fetch and display opening hours
async function loadOpeningHours() {
    console.log('[DEBUG] ===== loadOpeningHours() called =====');
    
    const openingHoursElement = document.getElementById('openingHoursTime');
    if (!openingHoursElement) {
        console.error('[DEBUG] Opening hours element not found!');
        return;
    }
    console.log('[DEBUG] Opening hours element found');

    // Get current day name (Monday, Tuesday, etc.)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];
    console.log('[DEBUG] Current day:', currentDay);
    console.log('[DEBUG] Today object:', today);
    console.log('[DEBUG] Day index:', today.getDay());

    try {
        // Re-initialize Supabase if needed
        if (!supabaseClient && typeof supabase !== 'undefined' && typeof SUPABASE_CONFIG !== 'undefined') {
            console.log('[DEBUG] Re-initializing Supabase client...');
            initializeSupabase();
        }

        if (!supabaseClient) {
            console.error('[DEBUG] Supabase client is null');
            openingHoursElement.textContent = 'Not configured';
            return;
        }
        console.log('[DEBUG] Supabase client is available');

        if (!SUPABASE_CONFIG) {
            console.error('[DEBUG] SUPABASE_CONFIG is not defined');
            openingHoursElement.textContent = 'Config missing';
            return;
        }
        
        const tableName = SUPABASE_CONFIG.openingHoursTable ? SUPABASE_CONFIG.openingHoursTable.trim() : '';
        
        if (!tableName) {
            console.error('[DEBUG] Opening hours table not configured');
            console.error('[DEBUG] Table value:', SUPABASE_CONFIG.openingHoursTable);
            console.error('[DEBUG] Table type:', typeof SUPABASE_CONFIG.openingHoursTable);
            openingHoursElement.textContent = 'Table not configured';
            return;
        }
        
        console.log('[DEBUG] Table name:', tableName);
        console.log('[DEBUG] Table name length:', tableName.length);

        // First, fetch all records to see what's in the database
        console.log('[DEBUG] Fetching all records from database to check available days...');
        const { data: allData, error: allError } = await supabaseClient
            .from(tableName)
            .select('*')
            .order('day');
        
        if (allError) {
            console.error('[DEBUG] Error fetching all records:', allError);
        } else {
            console.log('[DEBUG] All records in database:', allData);
            console.log('[DEBUG] Total records found:', allData ? allData.length : 0);
            if (allData && allData.length > 0) {
                console.log('[DEBUG] Available days in database:');
                allData.forEach(record => {
                    console.log('[DEBUG]   - Day:', record.day, '| Opening:', record.opening_time, '| Closing:', record.closing_time);
                });
            }
        }

        // Fetch opening hours for current day
        console.log('[DEBUG] Fetching opening hours for current day:', currentDay);
        console.log('[DEBUG] Query: from(' + tableName + ').select(opening_time, closing_time).eq(day, ' + currentDay + ').single()');
        
        const { data, error } = await supabaseClient
            .from(tableName)
            .select('opening_time, closing_time, day')
            .eq('day', currentDay)
            .single();

        console.log('[DEBUG] Query response received');
        console.log('[DEBUG] Data:', data);
        console.log('[DEBUG] Error:', error);

        if (error) {
            console.error('[DEBUG] Error fetching opening hours:', error);
            console.error('[DEBUG] Error code:', error.code);
            console.error('[DEBUG] Error message:', error.message);
            console.error('[DEBUG] Error details:', error.details);
            console.error('[DEBUG] Error hint:', error.hint);
            openingHoursElement.textContent = 'Error: ' + error.message;
            return;
        }

        if (data) {
            console.log('[DEBUG] Data received successfully for current day');
            console.log('[DEBUG] Full data object:', data);
            console.log('[DEBUG] Day in data:', data.day);
            console.log('[DEBUG] Opening time:', data.opening_time, 'Type:', typeof data.opening_time);
            console.log('[DEBUG] Closing time:', data.closing_time, 'Type:', typeof data.closing_time);
            
            // Format the time display
            const openingTime = formatTime(data.opening_time);
            const closingTime = formatTime(data.closing_time);
            console.log('[DEBUG] Formatted opening time:', openingTime);
            console.log('[DEBUG] Formatted closing time:', closingTime);
            
            const displayText = `${openingTime} - ${closingTime}`;
            console.log('[DEBUG] Display text:', displayText);
            openingHoursElement.textContent = displayText;
        } else {
            console.warn('[DEBUG] No data returned for current day:', currentDay);
            console.warn('[DEBUG] This means no record exists in the database for:', currentDay);
            
            // Try to find similar day names (case-insensitive)
            if (allData && allData.length > 0) {
                const similarDay = allData.find(record => 
                    record.day && record.day.toLowerCase() === currentDay.toLowerCase()
                );
                if (similarDay) {
                    console.log('[DEBUG] Found similar day with different case:', similarDay.day);
                    console.log('[DEBUG] Using that data instead');
                    const openingTime = formatTime(similarDay.opening_time);
                    const closingTime = formatTime(similarDay.closing_time);
                    openingHoursElement.textContent = `${openingTime} - ${closingTime}`;
                } else {
                    openingHoursElement.textContent = 'Closed';
                }
            } else {
                openingHoursElement.textContent = 'Closed';
            }
        }
    } catch (error) {
        console.error('[DEBUG] Exception caught:', error);
        console.error('[DEBUG] Error stack:', error.stack);
        openingHoursElement.textContent = 'Error: ' + error.message;
    }
    
    console.log('[DEBUG] ===== loadOpeningHours() completed =====');
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
    console.log('[DEBUG] Checking for config and Supabase...');
    console.log('[DEBUG] - supabase:', typeof supabase !== 'undefined');
    console.log('[DEBUG] - SUPABASE_CONFIG:', typeof SUPABASE_CONFIG !== 'undefined');
    
    if (typeof supabase === 'undefined') {
        console.log('[DEBUG] Supabase not loaded yet, waiting...');
        setTimeout(waitForConfigAndLoad, 100);
        return;
    }
    
    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.log('[DEBUG] SUPABASE_CONFIG not loaded yet, waiting...');
        setTimeout(waitForConfigAndLoad, 100);
        return;
    }
    
    console.log('[DEBUG] Both Supabase and config are available!');
    console.log('[DEBUG] SUPABASE_CONFIG:', SUPABASE_CONFIG);
    
    // Initialize Supabase client
    if (!supabaseClient) {
        initializeSupabase();
    }
    
    // Load opening hours
    loadOpeningHours();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOMContentLoaded event fired');
    waitForConfigAndLoad();
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
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
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

// Gallery Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('galleryModalImg');
    const closeBtn = document.querySelector('.gallery-modal-close');
    const prevBtn = document.querySelector('.gallery-modal-prev');
    const nextBtn = document.querySelector('.gallery-modal-next');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Store all gallery images
    const galleryImages = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img.src,
            alt: img.alt || 'Gallery Image'
        };
    });
    
    let currentImageIndex = 0;

    // Function to show image at specific index
    function showImage(index) {
        if (index < 0) {
            currentImageIndex = galleryImages.length - 1;
        } else if (index >= galleryImages.length) {
            currentImageIndex = 0;
        } else {
            currentImageIndex = index;
        }
        
        if (modalImg && galleryImages[currentImageIndex]) {
            modalImg.src = galleryImages[currentImageIndex].src;
            modalImg.alt = galleryImages[currentImageIndex].alt;
        }
    }

    // Open modal when clicking on gallery item
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (modal && modalImg && img) {
                currentImageIndex = index;
                modal.classList.add('active');
                showImage(currentImageIndex);
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    // Navigate to previous image
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentImageIndex - 1);
    });

    // Navigate to next image
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentImageIndex + 1);
    });

    // Close modal when clicking the close button
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        } else if (e.key === 'ArrowLeft') {
            showImage(currentImageIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showImage(currentImageIndex + 1);
        }
    });
});

// Reserve button popup functionality
document.addEventListener('DOMContentLoaded', () => {
    // Reserve button now uses smooth scroll to #reservation section (handled by the anchor link handler above)
});

