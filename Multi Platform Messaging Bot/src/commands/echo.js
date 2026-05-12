module.exports = {
    name: 'echo',
    description: 'Repeats the user message',
    async execute(message, args, reply) {
        if (args.length === 0) {
            return reply('You need to provide something for me to echo!');
        }
        await reply(args.join(' '));
    },
};
