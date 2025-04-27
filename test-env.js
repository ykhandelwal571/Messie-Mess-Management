const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if .env file exists
const envPath = path.resolve('.env');
console.log(`Checking for .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

// Try to load it
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

// Check environment variables
console.log('DATABASE_URL exists:', process.env.DATABASE_URL ? 'Yes' : 'No');