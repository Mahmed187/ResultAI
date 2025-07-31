const fs = require('fs');
const path = require('path');

console.log('=== Environment File Debug ===');
console.log('Current directory:', process.cwd());

// Check if files exist
const envFiles = ['.env', '.env.local'];

envFiles.forEach(filename => {
  const filePath = path.join(process.cwd(), filename);
  console.log(`\n--- Checking ${filename} ---`);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filename} exists`);
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`File size: ${content.length} bytes`);
      console.log(`Lines: ${content.split('\n').length}`);
      
      // Check for DATABASE_URL
      const lines = content.split('\n');
      const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL'));
      if (dbUrlLine) {
        console.log(`✅ Found DATABASE_URL line: ${dbUrlLine.substring(0, 30)}...`);
        console.log(`Line length: ${dbUrlLine.length}`);
        // Check for common issues
        if (dbUrlLine.includes(' ')) console.log('⚠️  Line contains spaces (might be an issue)');
        if (!dbUrlLine.includes('=')) console.log('❌ No equals sign found');
        if (!dbUrlLine.includes('"')) console.log('ℹ️  No quotes (might be fine)');
      } else {
        console.log('❌ DATABASE_URL not found in file');
      }
    } else {
      console.log(`❌ ${filename} does not exist`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filename}:`, error.message);
  }
});

// Test dotenv loading
console.log('\n--- Testing dotenv ---');
try {
  const result = require('dotenv').config();
  console.log('dotenv result:', result.error ? result.error.message : 'success');
  console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
} catch (error) {
  console.log('dotenv error:', error.message);
} 
 