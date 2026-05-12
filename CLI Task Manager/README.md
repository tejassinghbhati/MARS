# Orchestrator CLI

> **Architectural Precursor to the OpenClaw Framework**

Orchestrator CLI is a project that I have built to lay down the foundations of building a high performance agentic system. It is a command-line task manager. While functionally a standalone utility for managing local tasks, structurally it serves as the foundational proving ground for **OpenClaw**—a robust, agentic orchestration framework currently in development. 

## Research Context & Objectives

Building advanced agentic systems requires uncompromising foundational primitives. Rather than attempting to solve high-level LLM orchestration immediately, this project isolates and stress-tests the core mechanics of system dispatch, state persistence, and schema modeling in a deterministic environment. 

By mapping seemingly simple CLI interactions to complex autonomous agent behaviors, Orchestrator CLI validates the engineering decisions that will undergird OpenClaw:

1. **Deterministic Intent Routing (`commander`)**
   - *The Sandbox*: Parsing raw terminal strings and routing them to distinct execution branches.
   - *The OpenClaw Translation*: Mirrors the exact dispatcher pattern OpenClaw will use to parse user messages, determine intent, and invoke specific skills or agent subsets.
   
2. **Abstract Data Modeling**
   - *The Sandbox*: Defining strict schemas for task entities (ID, state, metadata).
   - *The OpenClaw Translation*: Cultivating the schema discipline required for the semantic memory engine, where conversational context and agent states must be serialized perfectly.

3. **High-Speed Persistent State (`better-sqlite3`)**
   - *The Sandbox*: Synchronous, file-based SQLite operations that survive session termination.
   - *The OpenClaw Translation*: Prototyping the fast, lightweight persistence layer that will act as OpenClaw's continuous memory, storing conversational history, environmental states, and vectorized embeddings without the overhead of external database servers.

4. **Fault Tolerance and Edge-Case Recovery**
   - *The Sandbox*: Gracefully mitigating invalid inputs, corrupted files, and out-of-bounds queries.
   - *The OpenClaw Translation*: Ensuring the core runtime loop of an autonomous agent does not halt upon encountering corrupted memory states or invalid tool call schemas.

## Architecture & Stack

This repository adheres to a lightweight, highly synchronous Node.js stack to maximize I/O efficiency:
- **Runtime**: Node.js
- **Dispatch**: `commander`
- **Persistence**: `better-sqlite3`
- **Presentation**: `cli-table3` & `chalk`

## Usage

```bash
# Clone the repository
git clone https://github.com/tejassinghbhati/Orchestrator-CLI.git
cd "Orchestrator-CLI"

# Install dependencies
npm install

# Link the package globally for system-wide execution
npm link
```

Once linked, the orchestrator daemon can be invoked from any directory:

```bash
task add "Initialize memory engine schema"
task list
task done 1
task list --all
task delete 1
```

## Future Vectors

As the foundation solidifies, this architecture will evolve to integrate complex data relations—such as priority queueing and vectorized semantic search—serving as the direct evolutionary predecessor to OpenClaw's core systems.
