import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Arduino component mapping with serial numbers
const ARDUINO_COMPONENT_MAP = {
  arduino_uno_r3: 'Arduino Uno R3 (A000066)',
  usb_connector: 'USB Type-A to Type-B Cable (USB-001)',
  breadboard: 'Half-Size Breadboard 400 Tie-Points (BB-001)',
  ultrasonic_sensor: 'HC-SR04 Ultrasonic Distance Sensor (SEN-001)',
  tilt_sensor: 'SW-520D Tilt Sensor (SEN-002)', 
  piezoelectric_sensor: 'Piezo Vibration Sensor (SEN-003)',
  temperature_sensor: 'DS18B20 Digital Temperature Sensor (SEN-004)',
  photoresistor_ldr: 'GL5528 Light Dependent Resistor (SEN-005)',
  resistor_220_ohm: '220Ω Carbon Film Resistor (RES-001)',
  resistor_1k_ohm: '1kΩ Carbon Film Resistor (RES-002)',
  resistor_10k_ohm: '10kΩ Carbon Film Resistor (RES-003)',
  buzzer: '5V Active Buzzer (BUZZ-001)',
  ceramic_capacitor: '100nF Ceramic Capacitor (CAP-001)',
  electrolytic_capacitor: '100μF Electrolytic Capacitor (CAP-002)',
  i2c_module_for_lcd: 'PCF8574 I2C LCD Backpack (MOD-001)',
  lcd_16x2_display: 'HD44780 16x2 LCD Display (LCD-001)',
  seven_segment_display: 'Common Cathode 7-Segment Display (LED-001)',
  motor_driver_ic_l293d: 'L293D Motor Driver IC (IC-001)',
  servo_motor_sg90: 'SG90 9g Micro Servo Motor (MOT-001)',
  dc_motor_3v: '3V DC Geared Motor (MOT-002)',
  relay_module: '5V Single Channel Relay Module (REL-001)',
  rgb_led: '5mm RGB LED Common Cathode (LED-002)',
  led_red: '5mm Red LED (LED-003)',
  led_yellow: '5mm Yellow LED (LED-004)',
  led_green: '5mm Green LED (LED-005)',
  laser_diode: '5mW 650nm Red Laser Diode (LAS-001)',
  male_to_male_jumper_wires: 'Male-to-Male Jumper Wires 20cm (WIRE-001)',
  male_to_female_jumper_wires: 'Male-to-Female Jumper Wires 20cm (WIRE-002)',
  header_pins: '40-Pin 2.54mm Header Strip (PIN-001)',
  potentiometer_10k_ohm: '10kΩ Linear Potentiometer (POT-001)',
  push_button_large: '12mm Tactile Push Button (BTN-001)',
  three_pin_switch: 'SPDT Toggle Switch (SW-001)',
  thermistor: '10kΩ NTC Thermistor (THERM-001)',
  npn_transistor_8050: '8050 NPN Transistor TO-92 (TRANS-001)',
  pnp_transistor_8050: '8550 PNP Transistor TO-92 (TRANS-002)',
  optocoupler: 'PC817 Optocoupler DIP-4 (OPT-001)',
  diode_1n4148: '1N4148 Fast Switching Diode (DIODE-001)',
  diode_1n4007: '1N4007 Rectifier Diode (DIODE-002)'
};

// Function to generate Arduino kit description
function generateArduinoDescription(arduinoComponents, otherComponents, baseDescription) {
  const selectedComponents = [];
  
  // Add predefined components
  Object.entries(arduinoComponents).forEach(([key, value]) => {
    if (value === true && ARDUINO_COMPONENT_MAP[key]) {
      selectedComponents.push(`• ${ARDUINO_COMPONENT_MAP[key]}`);
    }
  });
  
  // Add other components
  if (otherComponents && otherComponents.trim()) {
    const otherList = otherComponents.split(',').map(comp => comp.trim()).filter(comp => comp);
    otherList.forEach(comp => {
      selectedComponents.push(`• ${comp} (CUSTOM-${Math.random().toString(36).substr(2, 3).toUpperCase()})`);
    });
  }
  
  let description = baseDescription || 'Complete Arduino Development Kit';
  if (selectedComponents.length > 0) {
    description += '\n\n📦 INCLUDED COMPONENTS:\n' + selectedComponents.join('\n');
    description += `\n\n📊 Total Components: ${selectedComponents.length}`;
    description += '\n✅ All components tested and verified';
    description += '\n📝 Beginner-friendly with component guide';
  }
  
  return description;
}

export async function GET(request) {
  return NextResponse.json({
    success: true,
    message: 'StudX Sell API - Active',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'user') {
          try {
            body.user = JSON.parse(value);
          } catch {
            body.user = null;
          }
        } else if (key === 'location') {
          try {
            body.location = JSON.parse(value);
          } catch {
            body.location = value;
          }
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }

    if (!body.type || !body.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', body.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 401 });
    }

    // Check if this is an Arduino kit
    const isArduinoKit = body.type === 'product' && body.isArduinoKit === 'true';
    
    if (isArduinoKit) {
      // For Arduino kits, save ONLY to Arduino table (not products table)
      try {
        console.log('Processing Arduino kit - saving to Arduino table ONLY');
        
        const arduinoComponents = body.arduinoComponents ? JSON.parse(body.arduinoComponents) : {};
        const otherComponents = body.otherArduinoComponents || '';
        
        // Generate enhanced description with component list
        const enhancedDescription = generateArduinoDescription(
          arduinoComponents, 
          otherComponents, 
          body.description
        );
        
        // Count selected components
        const componentCount = Object.values(arduinoComponents).filter(v => v === true).length;
        
        // Create comprehensive Arduino kit data structure
        const productInfo = {
          seller_id: userData.id,
          title: body.title || 'Arduino Development Kit',
          description: enhancedDescription,
          price: Math.max(0, parseFloat(body.price) || 0),
          category: 'electronics',
          condition: body.condition || 'Used',
          college: body.college || '',
          location: body.location || '',
          is_sold: false,
          type: 'arduino_kit',
          component_count: componentCount,
          other_components_text: otherComponents,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Prepare Arduino table data (components + product info in other_components)
        const arduinoData = {
          // Store product information as JSON in other_components field
          other_components: JSON.stringify(productInfo),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add all the component boolean values
          ...arduinoComponents
        };

        console.log('Inserting Arduino kit to Arduino table only:', productInfo.title);

        const { data: arduinoResult, error: arduinoError } = await supabase
          .from('arduino')
          .insert(arduinoData)
          .select()
          .single();

        if (arduinoError) {
          console.error('Arduino table insert error:', arduinoError);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to create Arduino kit listing: ' + arduinoError.message 
          }, { status: 500 });
        }

        console.log('✅ Arduino kit saved successfully to Arduino table only');

        return NextResponse.json({ 
          success: true, 
          message: 'Arduino kit listing created successfully in Arduino table',
          id: arduinoResult.id,
          data: {
            id: arduinoResult.id,
            title: productInfo.title,
            type: 'arduino_kit',
            table: 'arduino_only',
            componentCount: componentCount,
            description: enhancedDescription,
            price: productInfo.price,
            seller_id: userData.id
          }
        });

      } catch (error) {
        console.error('Arduino kit processing error:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process Arduino kit: ' + error.message 
        }, { status: 500 });
      }
      
    } else {
      // For regular products, save to products table
      const insertData = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller_id: userData.id,
        title: body.title || 'Unnamed Product',
        description: body.description || '',
        price: Math.max(0, parseFloat(body.price) || 0),
        category: body.category || 'other',
        condition: body.condition || 'Used',
        college: body.college || '',
        location: body.location || '',
        is_sold: false
      };

      const { data: productData, error: insertError } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create listing' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Product listing created successfully',
        id: productData.id,
        data: {
          id: productData.id,
          title: productData.title,
          type: body.type,
          table: 'products'
        }
      });
    }

  } catch (error) {
    console.error('SELL API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}