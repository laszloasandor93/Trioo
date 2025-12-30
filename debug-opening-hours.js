// Debug script to test opening hours fetching
// Run this in the browser console to test the database connection

async function debugOpeningHours() {
    console.log('=== OPENING HOURS DEBUG SCRIPT ===\n');
    
    // Check if Supabase is available
    console.log('1. Checking Supabase availability...');
    console.log('   - supabase available:', typeof supabase !== 'undefined');
    console.log('   - SUPABASE_CONFIG available:', typeof SUPABASE_CONFIG !== 'undefined');
    
    if (typeof supabase === 'undefined') {
        console.error('   ❌ Supabase library not loaded!');
        console.error('   Make sure the Supabase script is loaded before running this debug function.');
        return;
    }
    
    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.error('   ❌ SUPABASE_CONFIG not found!');
        console.error('   Make sure config.js is loaded before running this debug function.');
        console.error('   Try refreshing the page or check the script loading order in HTML.');
        return;
    }
    
    // Log full config for debugging
    console.log('   - Full SUPABASE_CONFIG object:', SUPABASE_CONFIG);
    console.log('   - Config keys:', Object.keys(SUPABASE_CONFIG));
    
    console.log('   ✅ Both Supabase and config are available\n');
    
    // Check configuration
    console.log('2. Checking configuration...');
    console.log('   - URL:', SUPABASE_CONFIG.url);
    console.log('   - Anon Key:', SUPABASE_CONFIG.anonKey ? 'Present (' + SUPABASE_CONFIG.anonKey.substring(0, 20) + '...)' : 'Missing');
    console.log('   - Table:', SUPABASE_CONFIG.openingHoursTable);
    console.log('   - Table type:', typeof SUPABASE_CONFIG.openingHoursTable);
    console.log('   - Table length:', SUPABASE_CONFIG.openingHoursTable ? SUPABASE_CONFIG.openingHoursTable.length : 'N/A');
    
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.error('   ❌ Supabase URL not configured!');
        return;
    }
    
    if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.error('   ❌ Supabase anon key not configured!');
        return;
    }
    
    // Validate table name
    if (!SUPABASE_CONFIG.openingHoursTable) {
        console.error('   ❌ Opening hours table name is missing or empty!');
        console.error('   - Value:', SUPABASE_CONFIG.openingHoursTable);
        console.error('   - Type:', typeof SUPABASE_CONFIG.openingHoursTable);
        return;
    }
    
    if (typeof SUPABASE_CONFIG.openingHoursTable !== 'string' || SUPABASE_CONFIG.openingHoursTable.trim() === '') {
        console.error('   ❌ Opening hours table name is invalid!');
        console.error('   - Value:', SUPABASE_CONFIG.openingHoursTable);
        console.error('   - Type:', typeof SUPABASE_CONFIG.openingHoursTable);
        console.error('   - Trimmed length:', SUPABASE_CONFIG.openingHoursTable ? SUPABASE_CONFIG.openingHoursTable.trim().length : 0);
        return;
    }
    
    const tableName = SUPABASE_CONFIG.openingHoursTable.trim();
    console.log('   - Validated table name:', tableName);
    console.log('   ✅ Configuration looks good\n');
    
    // Initialize client
    console.log('3. Initializing Supabase client...');
    const client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('   ✅ Client initialized\n');
    
    // Get current day FIRST
    console.log('4. Determining current day...');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];
    console.log('   - Today:', today.toLocaleDateString());
    console.log('   - Day index:', today.getDay());
    console.log('   - Day name:', currentDay);
    console.log('   ✅ Current day determined\n');
    
    // Test query - get all records AFTER getting current day
    console.log('5. Fetching ALL records from database to check what exists...');
    const tableName = SUPABASE_CONFIG.openingHoursTable ? SUPABASE_CONFIG.openingHoursTable.trim() : '';
    
    if (!tableName) {
        console.error('   ❌ Table name is empty! Cannot proceed.');
        return;
    }
    
    console.log('   - Using table name:', tableName);
    console.log('   - Current day we are looking for:', currentDay);
    try {
        const { data: allData, error: allError } = await client
            .from(tableName)
            .select('*')
            .order('day');
        
        if (allError) {
            console.error('   ❌ Error fetching all records:', allError);
            console.error('   - Code:', allError.code);
            console.error('   - Message:', allError.message);
            console.error('   - Details:', allError.details);
            console.error('   - Hint:', allError.hint);
            return;
        }
        
        console.log('   ✅ Successfully fetched all records');
        console.log('   - Total records:', allData ? allData.length : 0);
        console.log('');
        
        if (!allData || allData.length === 0) {
            console.warn('   ⚠️  No records found in the database!');
            console.warn('   The table exists but is empty.');
            return;
        }
        
        console.log('   📋 All records in database:');
        allData.forEach((record, index) => {
            console.log(`   ${index + 1}. Day: "${record.day}" | Opening: ${record.opening_time} | Closing: ${record.closing_time}`);
            console.log(`      - Day type: ${typeof record.day}, length: ${record.day ? record.day.length : 0}`);
        });
        console.log('');
        
        // Check if current day exists (exact match)
        console.log(`6. Checking for current day "${currentDay}" in database...`);
        const exactMatch = allData.find(record => record.day === currentDay);
        
        if (exactMatch) {
            console.log('   ✅ Found EXACT match for current day!');
            console.log('   - Day:', exactMatch.day);
            console.log('   - Opening time:', exactMatch.opening_time, '(type:', typeof exactMatch.opening_time + ')');
            console.log('   - Closing time:', exactMatch.closing_time, '(type:', typeof exactMatch.closing_time + ')');
        } else {
            console.warn('   ⚠️  No EXACT match found for:', currentDay);
            
            // Try case-insensitive match
            const caseInsensitiveMatch = allData.find(record => 
                record.day && record.day.toLowerCase() === currentDay.toLowerCase()
            );
            
            if (caseInsensitiveMatch) {
                console.log('   ✅ Found case-insensitive match!');
                console.log('   - Database has:', caseInsensitiveMatch.day);
                console.log('   - We are looking for:', currentDay);
                console.log('   - Opening time:', caseInsensitiveMatch.opening_time);
                console.log('   - Closing time:', caseInsensitiveMatch.closing_time);
                console.log('   ⚠️  Day name case mismatch - database uses different capitalization!');
            } else {
                console.error('   ❌ No match found (even case-insensitive)');
                console.log('   Available day names in database:');
                allData.forEach(record => {
                    console.log(`     - "${record.day}"`);
                });
            }
        }
        
    } catch (error) {
        console.error('   ❌ Exception:', error);
        return;
    }
    
    // Test query - get specific day
    console.log('\n6. Testing query for current day using .eq()...');
    try {
        const { data, error } = await client
            .from(tableName)
            .select('opening_time, closing_time, day')
            .eq('day', currentDay)
            .single();
        
        if (error) {
            console.error('   ❌ Error:', error);
            console.error('   - Code:', error.code);
            console.error('   - Message:', error.message);
            
            // Try case-insensitive search
            console.log('\n   Trying case-insensitive search...');
            const { data: data2, error: error2 } = await client
                .from(tableName)
                .select('opening_time, closing_time, day')
                .ilike('day', currentDay)
                .single();
            
            if (error2) {
                console.error('   ❌ Case-insensitive search also failed:', error2);
            } else {
                console.log('   ✅ Case-insensitive search succeeded!');
                console.log('   - Data:', data2);
            }
        } else {
            console.log('   ✅ Query succeeded!');
            console.log('   - Data:', data);
            if (data) {
                console.log('   - Opening time:', data.opening_time);
                console.log('   - Closing time:', data.closing_time);
            }
        }
    } catch (error) {
        console.error('   ❌ Exception:', error);
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    console.log('Check the output above for any errors or issues.');
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('Debug script loaded. Run debugOpeningHours() in the console to test.');
}

