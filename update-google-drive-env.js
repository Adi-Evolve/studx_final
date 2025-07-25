/**
 * Google Drive API Environment Variables Update Helper
 * 
 * This script will help you update your .env.local file with the new Google Drive API credentials.
 * 
 * BEFORE RUNNING THIS SCRIPT:
 * 1. Download the service account JSON file from Google Cloud Console
 * 2. Place it in this directory (studx folder)
 * 3. Note the name of the JSON file
 * 4. Get the Google Drive folder ID from the shared folder URL
 * 
 * THEN RUN: node update-google-drive-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateEnvironmentVariables() {
  console.log('🔧 Google Drive API Environment Variables Setup');
  console.log('=' .repeat(50));
  
  try {
    // Ask for the JSON file name
    const jsonFileName = await askQuestion('Enter the name of your service account JSON file (e.g., studx-drive-api-abc123.json): ');
    
    // Check if file exists
    const jsonFilePath = path.join(__dirname, jsonFileName);
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ File not found: ${jsonFileName}`);
      console.error('Please make sure the JSON file is in the studx directory.');
      rl.close();
      return;
    }
    
    // Read and parse the JSON file
    const serviceAccountData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Ask for the folder ID
    const folderId = await askQuestion('Enter your Google Drive folder ID (from the folder URL): ');
    
    // Read existing .env.local file
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env.local file');
    } else {
      console.log('⚠️ No existing .env.local file found, creating new one');
    }
    
    // Prepare the new Google Drive variables
    const newVars = {
      'GOOGLE_DRIVE_FOLDER_ID': folderId,
      'GOOGLE_SERVICE_ACCOUNT_EMAIL': serviceAccountData.client_email,
      'GOOGLE_PRIVATE_KEY': serviceAccountData.private_key.replace(/\\n/g, '\n'),
      'GOOGLE_PROJECT_ID': serviceAccountData.project_id
    };
    
    // Update or add the variables
    let updatedEnvContent = envContent;
    
    for (const [key, value] of Object.entries(newVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(updatedEnvContent)) {
        // Replace existing variable
        updatedEnvContent = updatedEnvContent.replace(regex, newLine);
        console.log(`✅ Updated ${key}`);
      } else {
        // Add new variable
        updatedEnvContent += `\n${newLine}`;
        console.log(`➕ Added ${key}`);
      }
    }
    
    // Write the updated content back to .env.local
    fs.writeFileSync(envPath, updatedEnvContent);
    
    console.log('\n🎉 Environment variables updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node test-google-drive.js');
    console.log('2. If the test passes, try uploading a PDF through your forms');
    console.log('3. Delete the service account JSON file for security');
    
    // Ask if they want to delete the JSON file
    const deleteFile = await askQuestion('\nDo you want to delete the service account JSON file now? (y/N): ');
    if (deleteFile.toLowerCase() === 'y' || deleteFile.toLowerCase() === 'yes') {
      fs.unlinkSync(jsonFilePath);
      console.log(`✅ Deleted ${jsonFileName}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating environment variables:', error.message);
  }
  
  rl.close();
}

// Run the update process
updateEnvironmentVariables();
