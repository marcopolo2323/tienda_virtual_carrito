/**
 * Logger utility for application-wide logging
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs'); // ❌ CAMBIAR: era '../../logs', debería ser '../logs'
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'express-api.log');

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}\n`;
};

/**
 * Write log to file (ASYNC version para mejor rendimiento)
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 */
const writeLog = (level, message, meta = {}) => {
  const logMessage = formatLogMessage(level, message, meta);
  
  // Log to console
  console.log(logMessage.trim()); // ✅ MEJORAR: quitar \n extra
  
  // Log to file ASYNC (no bloquea el proceso)
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
};

const logger = {
  error: (message, meta = {}) => writeLog(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta = {}) => writeLog(LOG_LEVELS.WARN, message, meta),
  info: (message, meta = {}) => writeLog(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta = {}) => writeLog(LOG_LEVELS.DEBUG, message, meta)
};

module.exports = logger;