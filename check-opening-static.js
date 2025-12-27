// Static opening hours checker (no API needed)
// This uses a manually maintained JSON file

const OPENING_HOURS = {
    "monday": { open: "12:00", close: "02:00" },
    "tuesday": { open: "12:00", close: "02:00" },
    "wednesday": { open: "12:00", close: "02:00" },
    "thursday": { open: "12:00", close: "02:00" },
    "friday": { open: "12:00", close: "03:00" },
    "saturday": { open: "12:00", close: "03:00" },
    "sunday": { open: "12:00", close: "02:00" }
};

// Special dates (holidays, events, etc.)
const SPECIAL_HOURS = {
    "2025-01-01": { open: null, close: null, note: "New Year - Closed" },
    "2025-12-25": { open: null, close: null, note: "Christmas - Closed" },
    // Add more special dates as needed
};

/**
 * Check if business is currently open
 */
function checkOpeningStatus() {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check for special hours first
    if (SPECIAL_HOURS[dateString]) {
        const special = SPECIAL_HOURS[dateString];
        if (special.open === null) {
            return {
                isOpen: false,
                message: special.note || "Closed today",
                nextOpen: getNextOpenTime(now)
            };
        }
        // Use special hours if provided
        return checkTimeAgainstHours(now, special.open, special.close);
    }
    
    // Check regular hours
    const todayHours = OPENING_HOURS[dayName];
    if (!todayHours) {
        return { isOpen: false, message: "Hours not available" };
    }
    
    return checkTimeAgainstHours(now, todayHours.open, todayHours.close);
}

/**
 * Check if current time is within opening hours
 */
function checkTimeAgainstHours(now, openTime, closeTime) {
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    const [openHour, openMin] = openTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    let closeMinutes = closeHour * 60 + closeMin;
    
    // Handle closing time after midnight (e.g., 02:00 = 26:00)
    if (closeMinutes < openMinutes) {
        closeMinutes += 24 * 60; // Add 24 hours
    }
    
    const isOpen = currentTime >= openMinutes && currentTime < closeMinutes;
    
    return {
        isOpen,
        message: isOpen ? "Currently OPEN" : "Currently CLOSED",
        openTime,
        closeTime,
        nextOpen: isOpen ? null : getNextOpenTime(now)
    };
}

/**
 * Get next opening time
 */
function getNextOpenTime(now) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        const dayName = days[checkDay];
        const hours = OPENING_HOURS[dayName];
        
        if (hours && hours.open) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() + i);
            checkDate.setHours(0, 0, 0, 0);
            
            if (i === 0) {
                // Today - check if it's before opening time
                const [openHour, openMin] = hours.open.split(':').map(Number);
                const openTime = new Date(checkDate);
                openTime.setHours(openHour, openMin);
                
                if (now < openTime) {
                    return `Opens today at ${hours.open}`;
                }
            } else if (i === 1) {
                return `Opens tomorrow at ${hours.open}`;
            } else {
                return `Opens ${dayName} at ${hours.open}`;
            }
        }
    }
    
    return "Opening hours not available";
}

// Run check every minute
function startChecking() {
    console.log('Starting static opening hours checker...');
    
    // Check immediately
    const status = checkOpeningStatus();
    console.log(`[${new Date().toLocaleTimeString()}] Hookah Trio: ${status.message}`);
    if (status.nextOpen) {
        console.log(`  ${status.nextOpen}`);
    }
    
    // Check every minute
    setInterval(() => {
        const status = checkOpeningStatus();
        console.log(`[${new Date().toLocaleTimeString()}] Hookah Trio: ${status.message}`);
        if (status.nextOpen) {
            console.log(`  ${status.nextOpen}`);
        }
    }, 60000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkOpeningStatus, OPENING_HOURS, SPECIAL_HOURS };
} else {
    // Browser environment
    startChecking();
}




