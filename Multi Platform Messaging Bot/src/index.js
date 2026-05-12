require('dotenv').config();

const CommandProcessor = require('./core/CommandProcessor');
const TelegramAdapter = require('./adapters/TelegramAdapter');
const DiscordAdapter = require('./adapters/DiscordAdapter');

// Commands
const pingCommand = require('./commands/ping');
const echoCommand = require('./commands/echo');

async function main() {
    console.log('Starting Multi-Platform Messaging Bot...');

    // Initialize the core command processor
    const processor = new CommandProcessor('/');

    // Register commands
    processor.registerCommand(pingCommand.name, pingCommand);
    processor.registerCommand(echoCommand.name, echoCommand);

    // Initialize Telegram Adapter if a valid token is provided
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (telegramToken && telegramToken !== 'your_telegram_bot_token_here') {
        console.log('Initializing Telegram Adapter...');
        new TelegramAdapter(telegramToken, processor);
    } else {
        console.warn('TELEGRAM_BOT_TOKEN not found in .env, skipping Telegram adapter.');
    }

    // Initialize Discord Adapter if a valid token is provided
    const discordToken = process.env.DISCORD_BOT_TOKEN;
    if (discordToken && discordToken !== 'your_discord_bot_token_here') {
        console.log('Initializing Discord Adapter...');
        const discordAdapter = new DiscordAdapter(discordToken, processor);
        discordAdapter.start();
    } else {
        console.warn('DISCORD_BOT_TOKEN not found in .env, skipping Discord adapter.');
    }

    // Process will keep running because of event listeners in adapters
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
