'use strict';

/**
 * /ask — route natural language to the MARS agent (per-user session).
 */

module.exports = {
  name: 'ask',
  description: 'Ask MARS a question (Claude + tools + memory).',

  async execute(message, args, reply) {
    const prompt = args.join(' ').trim();
    if (!prompt) {
      await reply('Usage: `/ask` then your question — MARS will answer using Claude + tools + memory.');
      return;
    }

    await reply('⏳ Thinking…');

    const { runAgent } = require('../../core/agent');
    const sessionId = `${message.platform}:${message.userId}`;

    try {
      const answer = await runAgent(prompt, sessionId, { silent: true });
      const max = 3500;
      const text =
        answer.length > max ? `${answer.slice(0, max)}\n\n…(truncated)` : answer;
      await reply(text);
    } catch (err) {
      await reply(`❌ ${err.message}`);
    }
  },
};
