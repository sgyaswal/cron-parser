#!/usr/bin/env node

/**
 * Cron Parser CLI
 * Command-line interface for parsing cron expressions
 */

const { parseCronExpression, formatOutput } = require('./parser');

function main() {
  // Get the cron string from command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: No cron expression provided');
    console.error('Usage: node cron-parser.js "minute hour day_of_month month day_of_week command"');
    console.error('Example: node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"');
    process.exit(1);
  }

  const cronString = args[0];

  try {
    const parsed = parseCronExpression(cronString);
    const output = formatOutput(parsed);
    console.log(output);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
