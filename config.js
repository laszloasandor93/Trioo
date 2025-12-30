// Supabase Configuration
// Add your Supabase project details below
// Get these from: https://app.supabase.com → Your Project → Settings → API

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    // Format: https://xxxxxxxxxxxxx.supabase.co
    url: 'https://kgwmsedewpqdipwwgevc.supabase.co',
    
    // Your Supabase anonymous/public key (anon key)
    // This is safe to use in client-side code
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21zZWRld3BxZGlwd3dnZXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTY0NTksImV4cCI6MjA4MjQzMjQ1OX0.Zb46slKZ2RnmlDfeenI2ojtUZAxp3hInHo90ex32Zyc',
    
    // Optional: Service role key (only use in server-side code, never expose in client!)
    // serviceRoleKey: 'YOUR_SERVICE_ROLE_KEY',
    
    // Database table name for opening hours
    openingHoursTable: 'opening_hours'
};

// Ensure the property exists (fallback)
if (typeof SUPABASE_CONFIG !== 'undefined' && !SUPABASE_CONFIG.openingHoursTable) {
    SUPABASE_CONFIG.openingHoursTable = 'opening_hours';
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}

