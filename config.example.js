// Supabase Configuration Example
// Copy this file to config.js and fill in your actual Supabase credentials
// Get them from: https://app.supabase.com → Your Project → Settings → API

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    // Format: https://xxxxxxxxxxxxx.supabase.co
    url: 'YOUR_SUPABASE_URL',
    
    // Your Supabase anonymous/public key (anon key)
    // This is safe to use in client-side code
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Optional: Service role key (only use in server-side code, never expose in client!)
    // serviceRoleKey: 'YOUR_SERVICE_ROLE_KEY',
    
    // Database table name for contact messages
    tableName: ''
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}

