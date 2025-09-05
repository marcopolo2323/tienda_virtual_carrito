/**
 * Script to clean log files
 * Run with: node scripts/clean-logs.js
 */

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  console.log('Logs directory does not exist. Creating...');
  fs.mkdirSync(logsDir, { recursive: true });
}

// Read all files in the logs directory
fs.readdir(logsDir, (err, files) => {
  if (err) {
    console.error('Error reading logs directory:', err.message);
    process.exit(1);
  }

  // Filter for log files
  const logFiles = files.filter(file => file.endsWith('.log'));
  
  if (logFiles.length === 0) {
    console.log('No log files found to clean.');
    process.exit(0);
  }

  // Delete each log file
  let deletedCount = 0;
  logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    
    try {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`Deleted: ${file}`);
    } catch (error) {
      console.error(`Error deleting ${file}:`, error.message);
    }
  });

  console.log(`Successfully cleaned ${deletedCount} log files.`);
});