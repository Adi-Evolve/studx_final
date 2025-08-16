const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  // SVG files to convert
  const svgFiles = [
    { input: 'icon-72x72.svg', output: 'icon-72x72.png', size: 72 },
    { input: 'icon-96x96.svg', output: 'icon-96x96.png', size: 96 },
    { input: 'icon-128x128.svg', output: 'icon-128x128.png', size: 128 },
    { input: 'icon-144x144.svg', output: 'icon-144x144.png', size: 144 },
    { input: 'icon-152x152.svg', output: 'icon-152x152.png', size: 152 },
    { input: 'icon-192x192.svg', output: 'icon-192x192.png', size: 192 },
    { input: 'icon-384x384.svg', output: 'icon-384x384.png', size: 384 },
    { input: 'icon-512x512.svg', output: 'icon-512x512.png', size: 512 }
  ];
  
  for (const file of svgFiles) {
    try {
      const inputPath = path.join(iconsDir, file.input);
      const outputPath = path.join(iconsDir, file.output);
      
      if (fs.existsSync(inputPath)) {
        await sharp(inputPath)
          .resize(file.size, file.size)
          .png()
          .toFile(outputPath);
        
        // console.log(`✅ Converted ${file.input} to ${file.output}`);
      } else {
        // console.log(`❌ SVG file not found: ${file.input}`);
      }
    } catch (error) {
      // console.error(`❌ Error converting ${file.input}:`, error.message);
    }
  }
  
  // Also create favicon.ico from the smallest SVG
  try {
    const faviconSvgPath = path.join(__dirname, 'public', 'favicon.svg');
    const faviconIcoPath = path.join(__dirname, 'public', 'favicon.ico');
    
    if (fs.existsSync(faviconSvgPath)) {
      await sharp(faviconSvgPath)
        .resize(32, 32)
        .png()
        .toFile(faviconIcoPath);
      
      // console.log('✅ Created favicon.ico');
    }
  } catch (error) {
    // console.error('❌ Error creating favicon.ico:', error.message);
  }
}

convertSvgToPng().then(() => {
  // console.log('🎉 Icon conversion complete!');
}).catch(console.error);
