const { Client, GatewayIntentBits } = require('discord.js');

class DiscordAdapter {
    /**
     * @param {string} token - The Discord bot token
     * @param {import('../core/CommandProcessor')} commandProcessor - The command processor instance
     */
    constructor(token, commandProcessor) {
        // Requires Guilds, GuildMessages, and MessageContent intents
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        
        this.processor = commandProcessor;
        this.token = token;

        this.setupListeners();
    }

    setupListeners() {
        this.client.once('ready', () => {
            console.log(`[DiscordAdapter] Logged in as ${this.client.user.tag}!`);
        });

        this.client.on('messageCreate', (msg) => {
            // Ignore messages from bots
            if (msg.author.bot) return;
            if (!msg.content) return;

            const normalizedMessage = {
                platform: 'discord',
                userId: msg.author.id,
                channelId: msg.channel.id,
                text: msg.content,
                originalMessage: msg // Store original in case commands need platform-specific features
            };

            // Define the reply callback for the processor
            const replyCallback = async (responseText) => {
                await msg.reply(responseText);
            };

            this.processor.process(normalizedMessage, replyCallback);
        });
    }

    start() {
        this.client.login(this.token).catch(err => {
            console.error('[DiscordAdapter] Failed to login:', err);
        });
    }
}

module.exports = DiscordAdapter;
