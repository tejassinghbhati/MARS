/**
 * Normalizes messages and routes them to the appropriate command handler.
 */
class CommandProcessor {
    constructor(prefix = '/') {
        this.prefix = prefix;
        this.commands = new Map();
    }

    /**
     * Registers a command handler.
     * @param {string} name - The command name (e.g., 'ping')
     * @param {object} handler - The command handler object with an execute() method.
     */
    registerCommand(name, handler) {
        this.commands.set(name.toLowerCase(), handler);
        console.log(`[CommandProcessor] Registered command: ${this.prefix}${name}`);
    }

    /**
     * Processes an incoming normalized message.
     * @param {object} message - The normalized message object.
     * @param {string} message.platform - The origin platform ('discord', 'telegram').
     * @param {string} message.userId - The user ID who sent the message.
     * @param {string} message.channelId - The channel/chat ID where the message was sent.
     * @param {string} message.text - The text content of the message.
     * @param {function} reply - A callback function to send a reply back: reply(text)
     */
    async process(message, reply) {
        if (!message.text || !message.text.startsWith(this.prefix)) {
            return; // Not a command
        }

        const args = message.text.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.commands.get(commandName);

        if (!command) {
            // Optional: reply that command was not found
            // await reply(`Command not found: ${this.prefix}${commandName}`);
            return;
        }

        try {
            console.log(`[CommandProcessor] Executing /${commandName} from ${message.platform} user ${message.userId}`);
            await command.execute(message, args, reply);
        } catch (error) {
            console.error(`[CommandProcessor] Error executing command ${commandName}:`, error);
            await reply('There was an error trying to execute that command!');
        }
    }
}

module.exports = CommandProcessor;
