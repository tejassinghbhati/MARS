'use strict';

require('dotenv').config();
const path      = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { v4: uuidv4 } = require('uuid');
const { getToolSchemas, dispatch, listTools } = require('./toolRegistry');

const MEMORY_PATH = path.join(__dirname, '..', 'memory', 'memoryManager.js');
let memoryManager = null;
try {
  memoryManager = require(MEMORY_PATH);
} catch (_) {
  console.warn('⚠️  [Memory] Cognitive memory module not loadable. Running without persistent memory.');
}

const MODEL          = process.env.ANTHROPIC_MODEL    || 'claude-3-5-haiku-20241022';
const MAX_ITERATIONS = parseInt(process.env.AGENT_MAX_ITERATIONS || '8', 10);

let client = null;
function getClient() {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key === 'your_anthropic_api_key_here') {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key from https://console.anthropic.com/'
      );
    }
    client = new Anthropic();
  }
  return client;
}

const SYSTEM_PROMPT = `You are MARS (Modular Agent Runtime System), an intelligent AI agent built by Tejas Singh Bhati.

You have access to tools including:
- calculator: evaluate mathematical expressions
- fileReader: read files under the allowed data directory
- webSearch: search for current information (mock unless configured)
- rememberFact, recallMemory, forgetMemory: long-term user memory
- saveEntity, recallEntity: structured entity registry
- summarizeSession: condense conversation into archival facts

TOOL USE GUIDELINES:
- For math, ALWAYS use calculator — do not compute mentally.
- For file contents, ALWAYS use fileReader.
- For facts that should persist across sessions, use rememberFact; to look up stored knowledge, use recallMemory.
- For simple greetings or general knowledge, you may answer directly without tools.
- After tool results, compose a complete, helpful answer for the user.

Always be concise but thorough. If a tool fails, explain why and suggest alternatives.`;

const log = {
  agent:  (msg) => console.log(`\n🤖 [Agent]     ${msg}`),
  tool:   (msg) => console.log(`🔧 [Tool Call] ${msg}`),
  result: (msg) => console.log(`📦 [Result]    ${msg}`),
  answer: (msg) => console.log(`\n✅ [Answer]\n${'─'.repeat(60)}\n${msg}\n${'─'.repeat(60)}`),
  warn:   (msg) => console.warn(`⚠️  [Warning]   ${msg}`),
  error:  (msg) => console.error(`❌ [Error]     ${msg}`),
};

/**
 * Runs the MARS agent against a single user query.
 * @param {string} userMessage
 * @param {string} [sessionId]
 * @param {{ silent?: boolean }} [opts] - silent: no console logging (for bots)
 * @returns {Promise<string>}
 */
async function runAgent(userMessage, sessionId = uuidv4(), opts = {}) {
  const silent = !!opts.silent;
  const say = silent ? () => {} : log.agent.bind(log);
  const sayTool = silent ? () => {} : log.tool.bind(log);
  const sayResult = silent ? () => {} : log.result.bind(log);
  const sayAnswer = silent ? () => {} : log.answer.bind(log);
  const sayWarn = silent ? () => {} : log.warn.bind(log);
  const sayError = silent ? () => {} : log.error.bind(log);

  say(`Processing: "${userMessage.slice(0, 200)}${userMessage.length > 200 ? '…' : ''}"`);
  say(`Tools available: [${listTools().join(', ')}]`);

  let dynamicSystemPrompt = SYSTEM_PROMPT;
  if (memoryManager) {
    try {
      const memContext = await memoryManager.injectContext(userMessage, sessionId);
      if (memContext.trim()) {
        dynamicSystemPrompt = SYSTEM_PROMPT + '\n' + memContext;
        say('Memory context injected into system prompt.');
      }
    } catch (err) {
      sayWarn(`Memory context injection failed: ${err.message}`);
    }

    try {
      memoryManager.logConversation(sessionId, 'user', userMessage);
    } catch (_) {}
  }

  /** @type {Array<import('@anthropic-ai/sdk').MessageParam>} */
  const messages = [{ role: 'user', content: userMessage }];

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    let response;
    try {
      response = await getClient().messages.create({
        model:      MODEL,
        max_tokens: 2048,
        system:     dynamicSystemPrompt,
        tools:      getToolSchemas(),
        messages,
      });
    } catch (err) {
      sayError(`Anthropic API error: ${err.message}`);
      throw err;
    }

    const { stop_reason, content } = response;
    messages.push({ role: 'assistant', content });

    if (stop_reason === 'end_turn') {
      const textBlock = content.find((b) => b.type === 'text');
      const answer    = textBlock ? textBlock.text : '(No text response from model)';
      sayAnswer(answer);

      if (memoryManager) {
        try { memoryManager.logConversation(sessionId, 'assistant', answer); } catch (_) {}
      }

      return answer;
    }

    if (stop_reason === 'tool_use') {
      const toolResultBlocks = [];

      for (const block of content) {
        if (block.type !== 'tool_use') continue;

        const { id: toolUseId, name: toolName, input: toolArgs } = block;

        sayTool(`${toolName}(${JSON.stringify(toolArgs)})`);

        const toolResult = await dispatch(toolName, toolArgs);

        const previewLen = 200;
        const preview = toolResult.length > previewLen
          ? toolResult.slice(0, previewLen) + '…'
          : toolResult;
        sayResult(preview);

        toolResultBlocks.push({
          type:        'tool_result',
          tool_use_id: toolUseId,
          content:     toolResult,
        });
      }

      messages.push({ role: 'user', content: toolResultBlocks });
      continue;
    }

    sayWarn(`Unexpected stop_reason: "${stop_reason}". Ending loop.`);
    break;
  }

  const fallback = `I was unable to complete your request within ${MAX_ITERATIONS} steps. Please try rephrasing your question.`;
  sayWarn(`Max iterations (${MAX_ITERATIONS}) reached.`);
  return fallback;
}

module.exports = { runAgent };
