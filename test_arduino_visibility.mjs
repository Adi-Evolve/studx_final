// Simple test to check Arduino kits visibility
import { fetchListings } from './app/actions.js';

async function testArduinoVisibility() {
    console.log('Testing Arduino kit visibility in fetchListings...');
    
    try {
        const result = await fetchListings({ page: 1, limit: 20 });
        
        console.log('Total listings found:', result.listings?.length || 0);
        
        const arduinoKits = result.listings?.filter(item => item.type === 'arduino_kit') || [];
        console.log('Arduino kits found:', arduinoKits.length);
        
        if (arduinoKits.length > 0) {
            console.log('Arduino kits:');
            arduinoKits.forEach((kit, index) => {
                console.log(`${index + 1}. ${kit.title} - ₹${kit.price} (ID: ${kit.id})`);
            });
        } else {
            console.log('No Arduino kits found in listings');
            
            // Show breakdown of types
            const typeCounts = {};
            result.listings?.forEach(item => {
                typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
            });
            
            console.log('Breakdown by type:', typeCounts);
        }
        
    } catch (error) {
        console.error('Error testing Arduino visibility:', error);
    }
}

testArduinoVisibility();