// Clear corrupted authentication cookies
console.log('🧹 Clearing authentication cookies...');

// Clear all Supabase-related cookies
document.cookie.split(";").forEach(function(c) { 
    if (c.trim().startsWith('sb-') || c.trim().includes('supabase')) {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        console.log('Clearing cookie:', name);
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
});

// Clear localStorage
Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
        console.log('Clearing localStorage:', key);
        localStorage.removeItem(key);
    }
});

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
        console.log('Clearing sessionStorage:', key);
        sessionStorage.removeItem(key);
    }
});

console.log('✅ Authentication cookies cleared. Please refresh the page and log in again.');
console.log('💡 After clearing, go to /login and sign in with Google again.');
