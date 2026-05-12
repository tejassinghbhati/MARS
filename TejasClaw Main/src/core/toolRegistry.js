'use strict';

/**
 * Central registry for all MARS (Modular Agent Runtime System) tools.
 */

const calculator       = require('../tools/calculator');
const fileReader       = require('../tools/fileReader');
const webSearch        = require('../tools/webSearch');
const rememberFact     = require('../memory/tools/rememberFact');
const recallMemory     = require('../memory/tools/recallMemory');
const forgetMemory     = require('../memory/tools/forgetMemory');
const saveEntity       = require('../memory/tools/saveEntity');
const recallEntity     = require('../memory/tools/recallEntity');
const summarizeSession = require('../memory/tools/summarizeSession');

const TOOLS = [
  calculator,
  fileReader,
  webSearch,
  rememberFact,
  recallMemory,
  forgetMemory,
  saveEntity,
  recallEntity,
  summarizeSession,
];

const TOOL_MAP = new Map(TOOLS.map((t) => [t.name, t]));

function getToolSchemas() {
  return TOOLS.map((tool) => ({
    name:         tool.name,
    description:  tool.description,
    input_schema: tool.inputSchema,
  }));
}

async function dispatch(name, args) {
  const tool = TOOL_MAP.get(name);

  if (!tool) {
    return (
      `Unknown tool: "${name}". ` +
      `Available tools: ${Array.from(TOOL_MAP.keys()).join(', ')}.`
    );
  }

  try {
    const result = await tool.execute(args);
    return String(result);
  } catch (err) {
    return `Tool "${name}" threw an unexpected error: ${err.message}`;
  }
}

function listTools() {
  return Array.from(TOOL_MAP.keys());
}

module.exports = { getToolSchemas, dispatch, listTools };
