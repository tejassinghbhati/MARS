const TelegramBot = require('node-telegram-bot-api');

class TelegramAdapter {
    /**
     * @param {string} token - The Telegram bot token
     * @param {import('../core/CommandProcessor')} commandProcessor - The command processor instance
     */
    constructor(token, commandProcessor) {
        this.bot = new TelegramBot(token, { polling: true });
        this.processor = commandProcessor;

        this.setupListeners();
    }

    setupListeners() {
        this.bot.on('message', (msg) => {
            // Only process text messages
            if (!msg.text) return;

            const normalizedMessage = {
                platform: 'telegram',
                userId: msg.from.id.toString(),
                channelId: msg.chat.id.toString(),
                text: msg.text,
                originalMessage: msg // Store original in case commands need platform-specific features
            };

            // Define the reply callback for the processor
            const replyCallback = async (responseText) => {
                await this.bot.sendMessage(msg.chat.id, responseText);
            };

            this.processor.process(normalizedMessage, replyCallback);
        });

        this.bot.on('polling_error', (error) => {
            console.error('[TelegramAdapter] Polling Error:', error.code, error.response ? error.response.body : '');
        });

        console.log('[TelegramAdapter] Initialized and polling for messages.');
    }
}

module.exports = TelegramAdapter;
