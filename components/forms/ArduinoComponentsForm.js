'use client';

import { useState } from 'react';

const ARDUINO_COMPONENTS = [
    { id: 'arduino_uno_r3', label: 'Arduino Uno R3' },
    { id: 'usb_connector', label: 'USB Connector' },
    { id: 'breadboard', label: 'Breadboard' },
    { id: 'ultrasonic_sensor', label: 'Ultrasonic Sensor' },
    { id: 'resistor_220_ohm', label: 'Resistor 220Ω' },
    { id: 'resistor_1k_ohm', label: 'Resistor 1kΩ' },
    { id: 'resistor_10k_ohm', label: 'Resistor 10kΩ' },
    { id: 'buzzer', label: 'Buzzer' },
    { id: 'ceramic_capacitor', label: 'Ceramic Capacitor' },
    { id: 'electrolytic_capacitor', label: 'Electrolytic Capacitor' },
    { id: 'i2c_module_for_lcd', label: 'I2C Module for LCD' },
    { id: 'lcd_16x2_display', label: 'LCD 16x2 Display' },
    { id: 'motor_driver_ic_l293d', label: 'Motor Driver IC L293D' },
    { id: 'tilt_sensor', label: 'Tilt Sensor' },
    { id: 'relay_module', label: 'Relay Module' },
    { id: 'rgb_led', label: 'RGB LED' },
    { id: 'male_to_male_jumper_wires', label: 'Male to Male Jumper Wires' },
    { id: 'male_to_female_jumper_wires', label: 'Male to Female Jumper Wires' },
    { id: 'servo_motor_sg90', label: 'Servo Motor SG90' },
    { id: 'piezoelectric_sensor', label: 'Piezoelectric Sensor' },
    { id: 'seven_segment_display', label: '7-Segment Display' },
    { id: 'photoresistor_ldr', label: 'Photoresistor (LDR)' },
    { id: 'optocoupler', label: 'Optocoupler' },
    { id: 'three_pin_switch', label: '3-Pin Switch' },
    { id: 'temperature_sensor', label: 'Temperature Sensor' },
    { id: 'npn_transistor_8050', label: 'NPN Transistor 8050' },
    { id: 'pnp_transistor_8050', label: 'PNP Transistor 8050' },
    { id: 'push_button_large', label: 'Push Button (Large)' },
    { id: 'led_red', label: 'LED Red' },
    { id: 'led_yellow', label: 'LED Yellow' },
    { id: 'led_green', label: 'LED Green' },
    { id: 'potentiometer_10k_ohm', label: 'Potentiometer 10kΩ' },
    { id: 'thermistor', label: 'Thermistor' },
    { id: 'dc_motor_3v', label: '3V DC Motor' },
    { id: 'header_pins', label: 'Header Pins' },
    { id: 'diode_1n4148', label: 'Diode 1N4148' },
    { id: 'diode_1n4007', label: 'Diode 1N4007' },
    { id: 'laser_diode', label: 'Laser Diode' }
];

export default function ArduinoComponentsForm({ 
    selectedComponents = {}, 
    otherComponents = '', 
    onComponentChange, 
    onOtherComponentsChange 
}) {
    const [showOtherInput, setShowOtherInput] = useState(false);

    const handleComponentToggle = (componentId) => {
        const newValue = !selectedComponents[componentId];
        onComponentChange(componentId, newValue);
    };

    const handleOtherToggle = () => {
        setShowOtherInput(!showOtherInput);
        if (showOtherInput && otherComponents) {
            onOtherComponentsChange('');
        }
    };

    const getSelectedCount = () => {
        return Object.values(selectedComponents).filter(Boolean).length;
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    🔧 Arduino Kit Components
                </h3>
                <p className="text-blue-600 dark:text-blue-300 text-sm mb-4">
                    Select all components included in your Arduino kit. This helps buyers know exactly what they're getting.
                </p>
                <div className="bg-white dark:bg-blue-800/30 rounded-md p-3">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                        Selected: {getSelectedCount()} components
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ARDUINO_COMPONENTS.map((component) => (
                    <label
                        key={component.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedComponents[component.id]
                                ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedComponents[component.id] || false}
                            onChange={() => handleComponentToggle(component.id)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className={`text-sm font-medium ${
                            selectedComponents[component.id]
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}>
                            {component.label}
                        </span>
                    </label>
                ))}
            </div>

            {/* Other Components Section */}
            <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    showOtherInput
                        ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20 dark:border-purple-400'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500'
                }`}>
                    <input
                        type="checkbox"
                        checked={showOtherInput}
                        onChange={handleOtherToggle}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className={`text-sm font-medium ${
                        showOtherInput
                            ? 'text-purple-800 dark:text-purple-200'
                            : 'text-gray-700 dark:text-gray-300'
                    }`}>
                        ➕ Other Components
                    </span>
                </label>

                {showOtherInput && (
                    <div className="ml-7">
                        <textarea
                            value={otherComponents}
                            onChange={(e) => onOtherComponentsChange(e.target.value)}
                            placeholder="List any additional components included in your Arduino kit (e.g., specific sensors, modules, wires not listed above)..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            rows="3"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Describe additional components that aren't in the standard list above
                        </p>
                    </div>
                )}
            </div>

            {getSelectedCount() > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-green-600 dark:text-green-400 text-lg mr-2">✅</span>
                        <span className="text-green-800 dark:text-green-200 font-medium">
                            Great! You've selected {getSelectedCount()} components for your Arduino kit.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}