const path = require('path');
const PluginManager = require('./PluginManager');

// Define where skills will be loaded from
const SKILLS_DIR = path.join(__dirname, '..', 'skills');

// Initialize the Plugin Manager
const manager = new PluginManager(SKILLS_DIR);
manager.start();

console.log('--- Runtime Extension Engine Started ---');
console.log('Drop a .js file into the "skills" folder to see it hot-load!');
console.log('Type "simulate <message>" to send an event to all skills. Type "exit" to quit.');
console.log('----------------------------------------\n');

// CLI for interacting with the engine
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

// Give chokidar a tiny moment to log its startup lines before prompting
setTimeout(() => rl.prompt(), 100);

rl.on('line', (line) => {
    const input = line.trim();
    if (input === 'exit') {
        process.exit(0);
    } else if (input.startsWith('simulate ')) {
        const msg = input.replace('simulate ', '');
        console.log(`\n[System] Simulating message event: "${msg}"`);
        manager.emit('onMessage', msg);
    } else if (input.length > 0) {
        console.log(`Unknown command. Try "simulate hello" or "exit"`);
    }
    
    // We delay the prompt to let skills log synchronously if they want
    setTimeout(() => rl.prompt(), 50);
});
