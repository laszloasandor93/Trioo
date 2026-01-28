// Internationalization (i18n) functionality
let currentLanguage = localStorage.getItem('language') || 'en';

// Language display names and flag images
const languageFlags = {
    en: 'pictures/en.png',
    ro: 'pictures/ro.png',
    hu: 'pictures/hu.png'
};

const languageCodes = {
    en: 'EN',
    ro: 'RO',
    hu: 'HU'
};

// Function to get nested translation value
function getTranslation(path, lang) {
    const keys = path.split('.');
    let value = translations[lang];
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return null;
        }
    }
    
    return value;
}

// Function to update all elements with translations
function updateTranslations(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    // Update language link text and flag image
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        const flagImg = langBtn.querySelector('.lang-flag');
        const codeSpan = langBtn.querySelector('.lang-code');
        if (flagImg && flagImg.tagName === 'IMG') {
            flagImg.src = languageFlags[lang] || 'pictures/en.png';
            flagImg.alt = languageCodes[lang] || lang.toUpperCase();
        }
        if (codeSpan) {
            codeSpan.textContent = languageCodes[lang] || lang.toUpperCase();
        }
    }
    
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key, lang);
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update opening hours label if needed
    const openingHoursLabel = document.querySelector('.opening-hours-label');
    if (openingHoursLabel && openingHoursLabel.getAttribute('data-i18n')) {
        const key = openingHoursLabel.getAttribute('data-i18n');
        const translation = getTranslation(key, lang);
        if (translation) {
            openingHoursLabel.textContent = translation;
        }
    }
    
    // Update closed message if the restaurant is closed
    const openingHoursContainer = document.getElementById('openingHours');
    if (openingHoursContainer && openingHoursContainer.classList.contains('closed')) {
        const openingHoursElement = document.getElementById('openingHoursTime');
        if (openingHoursElement) {
            const closedMessage = getTranslation('openingHours.closedMessage', lang) || 'Closed! Check our opening hours:';
            openingHoursElement.textContent = closedMessage;
        }
    }

    // Re-render opening hours lists with translated day names
    if (window.openingHoursCache) {
        if (typeof updateOpeningHoursDropdown === 'function') {
            updateOpeningHoursDropdown(window.openingHoursCache);
        }
        if (typeof displayAllOpeningHours === 'function') {
            displayAllOpeningHours(window.openingHoursCache);
        }
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    updateTranslations(currentLanguage);
    
    // Prevent language link from navigating
    const langLink = document.getElementById('langBtn');
    if (langLink) {
        langLink.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
    
    // Add click handlers to language options
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.getAttribute('data-lang');
            if (lang && translations[lang]) {
                updateTranslations(lang);
            }
        });
    });
});

