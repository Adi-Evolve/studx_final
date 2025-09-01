// Test script for privileged user functionality
// Run this in your browser console after logging in with adiinamdar888@gmail.com

console.log('🧪 Testing Privileged User Functionality');

// Test privileged user detection
import { isPrivilegedUser, getUserPrivileges, getCustomStyling } from './lib/privilegedUsers.js';

const testEmail = 'adiinamdar888@gmail.com';
const regularEmail = 'student@example.com';

console.log('🔍 Testing privileged user detection:');
console.log(`${testEmail} is privileged:`, isPrivilegedUser(testEmail));
console.log(`${regularEmail} is privileged:`, isPrivilegedUser(regularEmail));

console.log('🎨 Testing custom styling for privileged user:');
console.log('Custom styling:', getCustomStyling(testEmail));

console.log('📋 Testing user privileges:');
console.log('User privileges:', getUserPrivileges(testEmail));

// Test form data
console.log('📝 Test data for your Arduino products:');
const testProducts = [
  {
    title: "Arduino Uno R3 Development Board",
    category: "Project Equipment",
    price: 500,
    description: "Genuine Arduino Uno R3 with USB cable. Perfect for beginners and advanced projects."
  },
  {
    title: "HC-SR04 Ultrasonic Sensor Module",
    category: "Project Equipment", 
    price: 150,
    description: "Accurate distance measurement sensor for robotics and IoT projects."
  },
  {
    title: "ESP32 WiFi Bluetooth Development Board",
    category: "Project Equipment",
    price: 800,
    description: "Powerful microcontroller with built-in WiFi and Bluetooth capabilities."
  }
];

console.log('🚀 Sample Arduino products for testing:', testProducts);

console.log('✅ All tests completed! Your products should now get priority display.');
