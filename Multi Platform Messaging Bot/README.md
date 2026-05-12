# Messaging Abstraction Layer (MAL)

**Author:** Tejas Singh Bhati  
**Status:** Experimental / Under Active Development  

## Abstract
This repository contains an exploratory implementation of a Multi-Platform Messaging Abstraction Layer (MAL). The primary objective of this module is to investigate and formalize the architectural patterns necessary to decouple core business logic (e.g., command processing, state management) from platform-specific delivery mechanisms (e.g., Telegram, Discord). This work serves as a foundational component for the broader OpenClaw cognitive architecture, facilitating seamless, multi-modal interaction across disparate communication protocols.

## Research Objectives
1. **Input Normalization**: To develop a standardized, platform-agnostic data structure that robustly represents incoming messages, ensuring downstream processors are insulated from the structural idiosyncrasies of specific APIs.
2. **Adapter Pattern Efficacy**: To empirically evaluate the Adapter design pattern in managing diverse webhooks, long-polling mechanisms, and gateway events (e.g., `discord.js`, `node-telegram-bot-api`).
3. **Unified Routing**: To construct a centralized `CommandProcessor` capable of routing abstract events to deterministic execution modules (`commands/`), thereby minimizing code duplication and enhancing system scalability.

## System Architecture

The architecture relies on a strict separation of concerns, divided into three primary tiers:

*   **Adapters (`src/adapters/`)**: The boundary layer. These modules interface directly with third-party APIs. They are responsible for listening to platform-specific events, transforming these payloads into the normalized `Message` object, and injecting a standardized `reply()` callback for asynchronous responses.
*   **Core Processor (`src/core/CommandProcessor.js`)**: The routing layer. This module remains completely agnostic to the origin of the message. It parses the normalized input, extracts command intents, and dispatches the request to the appropriate handler.
*   **Execution Modules (`src/commands/`)**: The operational layer. Isolated command implementations (e.g., `/ping`, `/echo`) that execute arbitrary logic and utilize the provided callback to return state to the user.

## Methodology & Setup

To replicate this environment and run the abstraction layer locally, follow standard Node.js initialization procedures:

### Prerequisites
*   Node.js (v18+ recommended)
*   Discord Application Token (requires `MessageContent` intent enabled)
*   Telegram Bot HTTP API Token

### Initialization
```bash
# Install required dependencies
npm install

# Configure environment variables
# Copy the provided template and inject your API tokens
cp .env.example .env
```

### Execution
```bash
# Initialize the routing core and mount active adapters
node src/index.js
```

## Future Work
Subsequent phases of this research will focus on integrating persistent conversation memory, handling complex multi-step dialog states, and evaluating the latency implications of webhook-based event ingestion versus the current long-polling implementation used for the Telegram adapter.