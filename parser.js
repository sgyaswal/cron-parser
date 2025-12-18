/**
 * Cron Expression Parser
 * Parses cron expressions and expands each field to show the times at which it will run
 */

/**
 * Field configurations with their valid ranges
 */
const FIELD_CONFIG = {
  minute: { min: 0, max: 59, name: 'minute' },
  hour: { min: 0, max: 23, name: 'hour' },
  dayOfMonth: { min: 1, max: 31, name: 'day of month' },
  month: { min: 1, max: 12, name: 'month' },
  dayOfWeek: { min: 0, max: 6, name: 'day of week' }
};

/**
 * Parse a single cron field expression
 * @param {string} expression - The cron field expression (e.g., star/15, 1-5, 1,15)
 * @param {number} min - Minimum valid value for this field
 * @param {number} max - Maximum valid value for this field
 * @returns {number[]} - Array of expanded values
 */
function parseField(expression, min, max) {
  // Handle asterisk (all values)
  if (expression === '*') {
    return generateRange(min, max, 1);
  }

  // Handle step values (e.g., "*/15" or "0-30/5")
  if (expression.includes('/')) {
    return parseStepValue(expression, min, max);
  }

  // Handle ranges (e.g., "1-5")
  if (expression.includes('-') && !expression.includes(',')) {
    return parseRange(expression, min, max);
  }

  // Handle lists (e.g., "1,15" or "1,2-5,10")
  if (expression.includes(',')) {
    return parseList(expression, min, max);
  }

  // Handle single value
  const value = parseInt(expression, 10);
  if (isNaN(value) || value < min || value > max) {
    throw new Error(`Invalid value: ${expression}. Must be between ${min} and ${max}`);
  }
  return [value];
}

/**
 * Parse step values (e.g., star/15, 0-30/5)
 * @param {string} expression - The step expression
 * @param {number} min - Minimum valid value
 * @param {number} max - Maximum valid value
 * @returns {number[]} - Array of values matching the step pattern
 */
function parseStepValue(expression, min, max) {
  const [range, step] = expression.split('/');
  const stepValue = parseInt(step, 10);

  if (isNaN(stepValue) || stepValue <= 0) {
    throw new Error(`Invalid step value: ${step}`);
  }

  let start = min;
  let end = max;

  // If range is not *, parse the range
  if (range !== '*') {
    if (range.includes('-')) {
      const [rangeStart, rangeEnd] = range.split('-').map(v => parseInt(v, 10));
      if (isNaN(rangeStart) || isNaN(rangeEnd)) {
        throw new Error(`Invalid range in step expression: ${range}`);
      }
      start = rangeStart;
      end = rangeEnd;
    } else {
      start = parseInt(range, 10);
      if (isNaN(start)) {
        throw new Error(`Invalid start value in step expression: ${range}`);
      }
    }
  }

  return generateRange(start, end, stepValue);
}

/**
 * Parse range expressions (e.g., 1-5)
 * @param {string} expression - The range expression
 * @param {number} min - Minimum valid value
 * @param {number} max - Maximum valid value
 * @returns {number[]} - Array of values in the range
 */
function parseRange(expression, min, max) {
  const [start, end] = expression.split('-').map(v => parseInt(v, 10));

  if (isNaN(start) || isNaN(end)) {
    throw new Error(`Invalid range: ${expression}`);
  }

  if (start < min || end > max || start > end) {
    throw new Error(`Range ${expression} is out of bounds (${min}-${max})`);
  }

  return generateRange(start, end, 1);
}

/**
 * Parse list expressions (e.g., 1,15 or 1,2-5,10)
 * @param {string} expression - The list expression
 * @param {number} min - Minimum valid value
 * @param {number} max - Maximum valid value
 * @returns {number[]} - Array of all values in the list
 */
function parseList(expression, min, max) {
  const parts = expression.split(',');
  const values = new Set();

  for (const part of parts) {
    const parsedValues = parseField(part.trim(), min, max);
    parsedValues.forEach(v => values.add(v));
  }

  return Array.from(values).sort((a, b) => a - b);
}

/**
 * Generate a range of numbers with a given step
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} step - Step increment
 * @returns {number[]} - Array of values
 */
function generateRange(start, end, step) {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Parse a complete cron expression
 * @param {string} cronString - The complete cron expression
 * @returns {Object} - Parsed cron fields
 */
function parseCronExpression(cronString) {
  if (!cronString || typeof cronString !== 'string') {
    throw new Error('Cron string is required');
  }

  const parts = cronString.trim().split(/\s+/);

  if (parts.length < 6) {
    throw new Error('Invalid cron expression. Expected format: minute hour day_of_month month day_of_week command');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek, ...commandParts] = parts;
  const command = commandParts.join(' ');

  try {
    return {
      minute: parseField(minute, FIELD_CONFIG.minute.min, FIELD_CONFIG.minute.max),
      hour: parseField(hour, FIELD_CONFIG.hour.min, FIELD_CONFIG.hour.max),
      dayOfMonth: parseField(dayOfMonth, FIELD_CONFIG.dayOfMonth.min, FIELD_CONFIG.dayOfMonth.max),
      month: parseField(month, FIELD_CONFIG.month.min, FIELD_CONFIG.month.max),
      dayOfWeek: parseField(dayOfWeek, FIELD_CONFIG.dayOfWeek.min, FIELD_CONFIG.dayOfWeek.max),
      command: command
    };
  } catch (error) {
    throw new Error(`Failed to parse cron expression: ${error.message}`);
  }
}

/**
 * Format the parsed cron expression as a table
 * @param {Object} parsed - Parsed cron fields
 * @returns {string} - Formatted output
 */
function formatOutput(parsed) {
  const lines = [];
  const fieldWidth = 14;

  lines.push(`${'minute'.padEnd(fieldWidth)}${parsed.minute.join(' ')}`);
  lines.push(`${'hour'.padEnd(fieldWidth)}${parsed.hour.join(' ')}`);
  lines.push(`${'day of month'.padEnd(fieldWidth)}${parsed.dayOfMonth.join(' ')}`);
  lines.push(`${'month'.padEnd(fieldWidth)}${parsed.month.join(' ')}`);
  lines.push(`${'day of week'.padEnd(fieldWidth)}${parsed.dayOfWeek.join(' ')}`);
  lines.push(`${'command'.padEnd(fieldWidth)}${parsed.command}`);

  return lines.join('\n');
}

// Export functions for testing and CLI usage
module.exports = {
  parseField,
  parseCronExpression,
  formatOutput,
  FIELD_CONFIG
};
