'use strict';

/**
 * Start the Reactive Execution Fabric (cron + probes + notifier).
 */

const scheduler = require('../scheduler/scheduler');

function printBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       ⚡  MARS — Reactive Execution Fabric               ║
║       Modular Agent Runtime System                       ║
╚══════════════════════════════════════════════════════════╝
`);
}

async function shutdown(signal) {
  console.log(`\n📴 Received ${signal}. Shutting down…`);
  await scheduler.stop();
  process.exit(0);
}

function main() {
  printBanner();
  scheduler.start();
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error(`\n❌ [Fatal] Uncaught exception: ${err.message}`);
    console.error(err.stack);
  });
  process.on('unhandledRejection', (reason) => {
    console.error(`\n❌ [Fatal] Unhandled rejection: ${reason}`);
  });
}

module.exports = main;

if (require.main === module) {
  main();
}
