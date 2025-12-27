// Check opening hours using Facebook Graph API
// Requires Facebook App setup and access token

// IMPORTANT: Use the numeric Page ID, not the URL!
// To find Page ID: Go to https://developers.facebook.com/tools/explorer/
// Query: me/accounts (shows all pages you manage)
// Or visit the page → About → Page Info → Facebook Page ID
const FACEBOOK_PAGE_ID = '234948738485612'; // e.g., '123456789012345' (numeric ID, not URL)
const ACCESS_TOKEN = 'YOUR_FACEBOOK_ACCESS_TOKEN'; // Long-lived access token

/**
 * Get opening hours from Facebook
 */
async function getFacebookOpeningHours() {
    try {
        // Get page info including hours
        const url = `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}?fields=hours,name&access_token=${ACCESS_TOKEN}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('Facebook API Error:', data.error);
            return null;
        }
        
        return {
            name: data.name,
            hours: data.hours,
            hoursFormatted: formatFacebookHours(data.hours)
        };
    } catch (error) {
        console.error('Error fetching Facebook data:', error);
        return null;
    }
}

/**
 * Format Facebook hours into readable format
 */
function formatFacebookHours(hours) {
    if (!hours) return null;
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const formatted = {};
    
    days.forEach((day, index) => {
        const dayHours = hours[day];
        if (dayHours && dayHours.length > 0) {
            formatted[dayNames[index]] = dayHours.map(period => {
                const open = formatTime(period.open);
                const close = formatTime(period.close);
                return `${open} - ${close}`;
            }).join(', ');
        } else {
            formatted[dayNames[index]] = 'Closed';
        }
    });
    
    return formatted;
}

/**
 * Format time from "HHMM" to "HH:MM"
 */
function formatTime(timeString) {
    if (!timeString) return '';
    const hours = timeString.substring(0, 2);
    const minutes = timeString.substring(2);
    return `${hours}:${minutes}`;
}

/**
 * Check if currently open based on Facebook hours
 */
function checkIfOpen(hours) {
    if (!hours) return { isOpen: null, message: 'Hours not available' };
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    // Facebook uses: mon, tue, wed, thu, fri, sat, sun
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = dayMap[currentDay];
    
    const todayHours = hours[dayKey];
    if (!todayHours || todayHours.length === 0) {
        return { isOpen: false, message: 'Closed today' };
    }
    
    // Check each time period for today
    for (const period of todayHours) {
        const openTime = parseInt(period.open.substring(0, 2)) * 60 + parseInt(period.open.substring(2));
        const closeTime = parseInt(period.close.substring(0, 2)) * 60 + parseInt(period.close.substring(2));
        
        // Handle closing after midnight
        let adjustedCloseTime = closeTime;
        if (closeTime < openTime) {
            adjustedCloseTime += 24 * 60;
        }
        
        if (currentTime >= openTime && currentTime < adjustedCloseTime) {
            return { isOpen: true, message: 'Currently OPEN' };
        }
    }
    
    return { isOpen: false, message: 'Currently CLOSED' };
}

/**
 * Main function
 */
async function checkFacebookStatus() {
    const hoursData = await getFacebookOpeningHours();
    
    if (hoursData) {
        console.log(`Business: ${hoursData.name}`);
        console.log('Opening Hours:');
        Object.entries(hoursData.hoursFormatted).forEach(([day, hours]) => {
            console.log(`  ${day}: ${hours}`);
        });
        
        const status = checkIfOpen(hoursData.hours);
        console.log(`\nStatus: ${status.message}`);
        
        return status;
    }
    
    return null;
}

// Run every minute
async function startFacebookChecking() {
    console.log('Starting Facebook opening hours checker...');
    
    // Check immediately
    await checkFacebookStatus();
    
    // Check every minute
    setInterval(async () => {
        await checkFacebookStatus();
    }, 60000);
}

// Setup instructions:
// 1. Go to https://developers.facebook.com/
// 2. Create an app
// 3. Get a Page Access Token with 'pages_read_engagement' permission
// 4. Find your Facebook Page ID (in page settings or use Graph API Explorer)
// 5. Replace FACEBOOK_PAGE_ID and ACCESS_TOKEN above

if (typeof window !== 'undefined') {
    // Browser - you'll need to handle CORS or use a proxy
    console.log('Facebook API requires server-side proxy due to CORS restrictions');
} else {
    // Node.js
    startFacebookChecking();
}

