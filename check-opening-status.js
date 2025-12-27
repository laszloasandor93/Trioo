// Script to check if Hookah Trio is open on Google Maps
// Runs every minute

// Configuration
const PLACE_NAME = "Hookah Trio";
const PLACE_ID = null; // Will be set after finding the place
const CHECK_INTERVAL = 60000; // 1 minute in milliseconds

// Google Places API configuration
// Note: You'll need to get an API key from Google Cloud Console
// Enable "Places API" and "Maps JavaScript API" in your project
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // Replace with your actual API key

let placeId = null;
let isOpen = null;

/**
 * Initialize the Google Places API and find the place
 */
async function initializePlaces() {
    // Load Google Maps JavaScript API
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
            script.onload = resolve;
        });
    }

    // Find the place using PlacesService
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    return new Promise((resolve, reject) => {
        const request = {
            query: `${PLACE_NAME}, Târgu Mureș, Romania`,
            fields: ['place_id', 'name', 'opening_hours', 'business_status']
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                placeId = results[0].place_id;
                console.log(`Found place: ${results[0].name} (ID: ${placeId})`);
                resolve(placeId);
            } else {
                console.error('Place not found:', status);
                reject(new Error(`Place not found: ${status}`));
            }
        });
    });
}

/**
 * Check if the place is currently open
 */
async function checkOpeningStatus() {
    if (!placeId) {
        console.error('Place ID not found. Please initialize first.');
        return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    return new Promise((resolve, reject) => {
        const request = {
            placeId: placeId,
            fields: ['opening_hours', 'business_status', 'name']
        };

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const openingHours = place.opening_hours;
                
                if (!openingHours) {
                    console.log('Opening hours not available');
                    resolve({ isOpen: null, message: 'Opening hours not available' });
                    return;
                }

                // Check if place is open now
                const isCurrentlyOpen = openingHours.isOpen();
                const businessStatus = place.business_status;
                
                let statusMessage = '';
                if (businessStatus === 'CLOSED_PERMANENTLY') {
                    statusMessage = 'Permanently closed';
                    isOpen = false;
                } else if (isCurrentlyOpen) {
                    statusMessage = 'Currently OPEN';
                    isOpen = true;
                } else {
                    statusMessage = 'Currently CLOSED';
                    isOpen = false;
                }

                // Get next opening time if closed
                if (!isCurrentlyOpen && openingHours.weekday_text) {
                    const now = new Date();
                    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const currentTime = now.getHours() * 100 + now.getMinutes();
                    
                    // Find next opening time
                    for (let i = 0; i < 7; i++) {
                        const checkDay = (currentDay + i) % 7;
                        const dayText = openingHours.weekday_text[checkDay];
                        if (dayText && dayText.includes(':')) {
                            const times = dayText.split(': ')[1];
                            if (times && times !== 'Closed') {
                                const [openTime] = times.split(' – ');
                                if (openTime) {
                                    const [hours, minutes] = openTime.split(':').map(Number);
                                    const openTimeValue = hours * 100 + minutes;
                                    
                                    if (i === 0 && openTimeValue > currentTime) {
                                        statusMessage += ` (Opens at ${openTime})`;
                                        break;
                                    } else if (i > 0) {
                                        statusMessage += ` (Opens ${i === 1 ? 'tomorrow' : `in ${i} days`} at ${openTime})`;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                console.log(`[${new Date().toLocaleTimeString()}] ${place.name}: ${statusMessage}`);
                resolve({ isOpen, message: statusMessage, place: place.name });
            } else {
                console.error('Error getting place details:', status);
                reject(new Error(`Error: ${status}`));
            }
        });
    });
}

/**
 * Main function to start checking
 */
async function startChecking() {
    try {
        console.log('Initializing Google Places API...');
        await initializePlaces();
        
        console.log('Starting periodic checks...');
        // Check immediately
        await checkOpeningStatus();
        
        // Then check every minute
        setInterval(async () => {
            try {
                await checkOpeningStatus();
            } catch (error) {
                console.error('Error during periodic check:', error);
            }
        }, CHECK_INTERVAL);
        
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

// Alternative: Use Google Places API (REST) if you prefer server-side or Node.js
// This version uses the JavaScript API which requires a browser environment

/**
 * Node.js version using Google Places API REST
 * Uncomment and use this if running in Node.js environment
 */
/*
const axios = require('axios');

async function checkOpeningStatusREST() {
    try {
        // First, find the place
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(PLACE_NAME + ', Târgu Mureș, Romania')}&key=${GOOGLE_API_KEY}`;
        const searchResponse = await axios.get(searchUrl);
        
        if (searchResponse.data.results && searchResponse.data.results.length > 0) {
            const placeId = searchResponse.data.results[0].place_id;
            
            // Get place details including opening hours
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,business_status,name&key=${GOOGLE_API_KEY}`;
            const detailsResponse = await axios.get(detailsUrl);
            
            const place = detailsResponse.data.result;
            const openingHours = place.opening_hours;
            
            if (openingHours && openingHours.periods) {
                const now = new Date();
                const currentDay = now.getDay();
                const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
                
                // Check if open now
                const todayPeriods = openingHours.periods.filter(period => period.open.day === currentDay);
                let isOpen = false;
                
                for (const period of todayPeriods) {
                    const openTime = period.open.time; // Format: "0900" (HHMM)
                    const closeTime = period.close ? period.close.time : null;
                    
                    const openMinutes = parseInt(openTime.substring(0, 2)) * 60 + parseInt(openTime.substring(2));
                    const closeMinutes = closeTime ? (parseInt(closeTime.substring(0, 2)) * 60 + parseInt(closeTime.substring(2))) : null;
                    
                    if (currentTime >= openMinutes) {
                        if (!closeTime || currentTime < closeMinutes) {
                            isOpen = true;
                            break;
                        }
                    }
                }
                
                console.log(`[${new Date().toLocaleTimeString()}] ${place.name}: ${isOpen ? 'OPEN' : 'CLOSED'}`);
                return { isOpen, place: place.name };
            }
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

// Run every minute
setInterval(checkOpeningStatusREST, CHECK_INTERVAL);
checkOpeningStatusREST(); // Run immediately
*/

// Start the checking process
if (typeof window !== 'undefined') {
    // Browser environment
    startChecking();
} else {
    // Node.js environment - use the REST API version above
    console.log('Please use the Node.js version (commented code) for server-side execution');
}




