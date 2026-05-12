'use strict';

/**
 * Runtime Extension Engine — hot-reload skills from /skills.
 */

const path = require('path');
const readline = require('readline');
const PluginManager = require('../extensions/PluginManager');

const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');

function main() {
  const manager = new PluginManager(SKILLS_DIR);
  manager.start();

  console.log('--- MARS — Runtime Extension Engine ---');
  console.log(`Watching: ${SKILLS_DIR}`);
  console.log('Commands: simulate <message>  |  exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  setTimeout(() => rl.prompt(), 100);

  rl.on('line', (line) => {
    const input = line.trim();
    if (input === 'exit') {
      process.exit(0);
    }
    if (input.startsWith('simulate ')) {
      const msg = input.slice('simulate '.length);
      console.log(`\n[System] Simulating: "${msg}"`);
      manager.emit('onMessage', msg);
    } else if (input.length > 0) {
      console.log('Unknown. Try: simulate hello');
    }
    setTimeout(() => rl.prompt(), 50);
  });
}

module.exports = main;

if (require.main === module) {
  main();
}
