const clearAuthData = () => {
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('Auth data cleared');
    window.location.reload();
};

// Add to window for easy access from console
window.clearAuthData = clearAuthData;

export default clearAuthData;
