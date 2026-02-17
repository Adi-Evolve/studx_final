// Authentication cleanup and reset script
// console.log('🧹 Cleaning up corrupted authentication state...');

async function cleanupAuth() {
    // console.log('\n=== Step 1: Clearing Browser Storage ===');
    
    try {
        // Clear all localStorage
        const localStorageKeys = Object.keys(localStorage);
        // console.log('Clearing localStorage keys:', localStorageKeys.filter(k => k.includes('supabase')));
        localStorageKeys.forEach(key => {
            if (key.includes('supabase')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear all sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        // console.log('Clearing sessionStorage keys:', sessionStorageKeys.filter(k => k.includes('supabase')));
        sessionStorageKeys.forEach(key => {
            if (key.includes('supabase')) {
                sessionStorage.removeItem(key);
            }
        });
        
        // console.log('✅ Browser storage cleared');
        
    } catch (error) {
        // console.error('❌ Error clearing storage:', error);
    }
    
    // console.log('\n=== Step 2: Testing Auth Status ===');
    
    try {
        const response = await fetch('http://localhost:1501/api/sync-user', {
            method: 'GET'
        });
        
        const result = await response.json();
        // console.log('Auth status after cleanup:', result.authStatus);
        
    } catch (error) {
        // console.error('❌ Error checking auth:', error);
    }
    
    // console.log('\n=== Step 3: Manual Cleanup Instructions ===');
    // console.log('🔧 Please do the following manually:');
    // console.log('1. Open browser DevTools (F12)');
    // console.log('2. Go to Application → Storage');
    // console.log('3. Clear All Site Data for localhost:1501');
    // console.log('4. Close all browser tabs for localhost:1501');
    // console.log('5. Open new tab and go to: http://localhost:1501');
    // console.log('6. Click Login and sign in with Google again');
    // console.log('7. After successful login, test the notes form');
    
    // console.log('\n=== Step 4: Alternative - Use Incognito Mode ===');
    // console.log('Or try this in a new incognito/private browser window:');
    // console.log('1. Open incognito window');
    // console.log('2. Go to: http://localhost:1501');
    // console.log('3. Login with Google');
    // console.log('4. Test the notes form');
}

cleanupAuth().catch(console.error);
