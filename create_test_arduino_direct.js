// Direct SQL insert to create test Arduino kit
const { Pool } = require('pg');

// Database connection string - you might need to adjust this
const connectionString = 'postgresql://postgres.uexcagsflhgvmhopxbmg:p4gBvQI$jWDC%bw@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createTestArduinoKit() {
    const client = new Pool({ connectionString });
    
    try {
        console.log('Connecting to database...');
        
        // First check if Arduino table exists and has any data
        const checkResult = await client.query('SELECT COUNT(*) FROM arduino');
        console.log('Current Arduino kits in database:', checkResult.rows[0].count);
        
        // Create a test Arduino kit
        const arduinoData = {
            breadboard: true,
            motor: true,
            led: true,
            resistor: false,
            other_components: JSON.stringify({
                title: "Arduino Uno Complete Starter Kit",
                description: "Complete Arduino starter kit with breadboard, motors, LEDs, resistors, jumper wires, and various sensors. Perfect for beginners learning electronics and programming. Includes detailed tutorial guide.",
                price: 2500,
                category: "Project Equipment",
                college: "Test University",
                images: ["https://via.placeholder.com/400x300?text=Arduino+Starter+Kit"],
                location: "Campus Electronics Lab",
                is_sold: false,
                seller_id: "test-seller-arduino-123",
                component_count: 25
            })
        };

        const insertQuery = `
            INSERT INTO arduino (breadboard, motor, led, resistor, other_components)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, created_at;
        `;
        
        const result = await client.query(insertQuery, [
            arduinoData.breadboard,
            arduinoData.motor,
            arduinoData.led,
            arduinoData.resistor,
            arduinoData.other_components
        ]);
        
        console.log('✅ Test Arduino kit created successfully!');
        console.log('ID:', result.rows[0].id);
        console.log('Created at:', result.rows[0].created_at);
        
        // Verify it was created
        const verifyResult = await client.query('SELECT COUNT(*) FROM arduino');
        console.log('Total Arduino kits now in database:', verifyResult.rows[0].count);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

createTestArduinoKit();