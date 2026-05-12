module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    async execute(message, args, reply) {
        await reply('Pong! 🏓');
    },
};
