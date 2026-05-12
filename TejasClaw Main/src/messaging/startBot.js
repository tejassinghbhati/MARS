'use strict';

require('dotenv').config();

const CommandProcessor = require('./CommandProcessor');
const TelegramAdapter = require('./adapters/TelegramAdapter');
const DiscordAdapter = require('./adapters/DiscordAdapter');

const pingCommand = require('./commands/ping');
const echoCommand = require('./commands/echo');
const askCommand = require('./commands/ask');

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  MARS — Multi-Platform Messaging                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const processor = new CommandProcessor('/');

  processor.registerCommand(pingCommand.name, pingCommand);
  processor.registerCommand(echoCommand.name, echoCommand);
  processor.registerCommand(askCommand.name, askCommand);

  const telegramToken =
    process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
  if (telegramToken && telegramToken !== 'your_telegram_bot_token_here') {
    console.log('Telegram adapter: starting…');
    new TelegramAdapter(telegramToken, processor);
  } else {
    console.warn('TELEGRAM_BOT_TOKEN not set — skipping Telegram.');
  }

  const discordToken =
    process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
  if (discordToken && discordToken !== 'your_discord_bot_token_here') {
    console.log('Discord adapter: starting…');
    const discordAdapter = new DiscordAdapter(discordToken, processor);
    discordAdapter.start();
  } else {
    console.warn('DISCORD_BOT_TOKEN not set — skipping Discord.');
  }

  if (
    (!telegramToken || telegramToken === 'your_telegram_bot_token_here') &&
    (!discordToken || discordToken === 'your_discord_bot_token_here')
  ) {
    console.error('\nNo bot tokens configured. Set TELEGRAM_BOT_TOKEN and/or DISCORD_BOT_TOKEN in .env\n');
    process.exit(1);
  }
}

module.exports = main;

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
