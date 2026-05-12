'use strict';

const readline = require('readline');
const { runAgent } = require('../core/agent');

function printBanner() {
  console.log('\n' + '═'.repeat(60));
  console.log('  🛰  MARS — Modular Agent Runtime System');
  console.log('       Chat REPL (Claude + tools + memory)');
  console.log('═'.repeat(60));
  console.log('  Model  : ' + (process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022'));
  console.log('  Type   : examples | exit');
  console.log('═'.repeat(60) + '\n');
}

const EXAMPLES = [
  '  📐 Math   →  "What is sqrt(1764) multiplied by 3?"',
  '  💾 Memory →  "Remember that my favorite editor is Cursor"',
  '  📁 File    →  "Read sample.txt from data and summarize"',
];

function printExamples() {
  console.log('\nExample queries:\n');
  EXAMPLES.forEach((e) => console.log(e));
  console.log('');
}

async function main() {
  printBanner();

  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
    prompt: '❯ You: ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye.\n');
      rl.close();
      process.exit(0);
    }
    if (input.toLowerCase() === 'examples') {
      printExamples();
      rl.prompt();
      return;
    }

    rl.pause();
    try {
      await runAgent(input);
    } catch (err) {
      console.error(err.message || err);
    }
    rl.resume();
    rl.prompt();
  });
}

module.exports = main;

if (require.main === module) {
  main();
}
