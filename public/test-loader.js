// Quick Google Maps Loader Test
console.log("🔍 Testing Google Maps Loader Fix...");

// Test the import in browser environment
if (typeof window !== 'undefined') {
    // Test our global loader
    import('./lib/googleMapsLoader.js')
        .then(({ loadGoogleMaps, getGoogleMapsLoader }) => {
            console.log("✅ Global loader imported successfully");
            
            // Try to get the loader instance
            try {
                const loader = getGoogleMapsLoader();
                console.log("✅ Loader instance created:", loader ? "YES" : "NO");
                
                // Try to load Google Maps
                loadGoogleMaps()
                    .then((google) => {
                        console.log("✅ Google Maps loaded successfully");
                        console.log("✅ Google Maps object:", !!google);
                        console.log("✅ Google Maps API:", !!google.maps);
                        console.log("✅ Places library:", !!google.maps.places);
                        console.log("✅ Geometry library:", !!google.maps.geometry);
                    })
                    .catch((error) => {
                        console.log("❌ Error loading Google Maps:", error.message);
                    });
            } catch (error) {
                console.log("❌ Error creating loader:", error.message);
            }
        })
        .catch((error) => {
            console.log("❌ Error importing loader:", error.message);
        });
} else {
    console.log("⚠️ Not in browser environment");
}

// Export for console testing
if (typeof window !== 'undefined') {
    window.testGoogleMapsLoader = () => {
        console.log("🧪 Manual Google Maps test initiated...");
        import('./lib/googleMapsLoader.js')
            .then(({ loadGoogleMaps }) => loadGoogleMaps())
            .then((google) => {
                console.log("✅ Test passed! Google Maps loaded:", !!google);
                return google;
            })
            .catch((error) => {
                console.log("❌ Test failed:", error.message);
            });
    };
    
    console.log("🔧 Use window.testGoogleMapsLoader() to test manually");
}