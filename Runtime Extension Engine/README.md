# Runtime Extension Engine

> **Architectural Precursor to the OpenClaw Framework**

**Author:** Tejas Singh Bhati
**Status:** Experimental / Under Active Development

## Abstract

The Runtime Extension Engine is a foundational research module designed to rigorously investigate the mechanics of **dynamic module loading, execution sandboxing, and plugin lifecycle management** in a live Node.js runtime. While functionally self-contained, this system exists as the direct architectural prototype for **OpenClaw's extensibility core** — the subsystem that will enable users to install, hot-swap, and isolate AI capabilities (skills) without ever interrupting the primary agent runtime.

The central thesis motivating this work is that a truly extensible agentic framework cannot depend on restarts, recompilation, or any form of static module bundling. Skills must be deployable as discrete, independently verifiable behavioral units that the host system can absorb or eject dynamically, in a manner that is both safe and observable.

---

## Research Context & Objectives

Building a production-grade extensibility layer requires solving three non-trivial engineering problems simultaneously: **discovery, isolation, and lifecycle coherence.** This project isolates each problem domain and derives validated solutions in a controlled environment before they are promoted into the OpenClaw core.

By mapping the seemingly simple act of "dropping a file into a folder" to the full complexity of a plugin lifecycle, this engine validates the engineering decisions that will undergird OpenClaw's skill registry:

1. **Filesystem-Driven Discovery (`chokidar`)**
   - *The Sandbox*: A persistent file system watcher monitors a designated `skills/` directory and emits structured events (`add`, `change`, `unlink`) in real-time, regardless of cross-platform I/O irregularities.
   - *The OpenClaw Translation*: Mirrors the mechanism by which OpenClaw will resolve newly installed skill packages — decoupling the act of deployment (dropping a file) from the act of integration (loading it into the agent's capability graph) without manual intervention.

2. **Isolated Execution Contexts (Node.js `vm` Module)**
   - *The Sandbox*: Each skill is compiled and executed inside a dedicated `vm.Context`, receiving only an explicitly whitelisted set of APIs — a controlled `console`, a simulated `bot` interface, and standard timer functions. Direct access to `fs`, `process`, `require`, or the host network is denied.
   - *The OpenClaw Translation*: Prototypes the trust boundary OpenClaw must enforce between its privileged orchestrator core and untrusted third-party skills. A malformed or adversarially crafted skill must not be capable of reading environment variables, polluting global state, or crashing the primary agent loop.

3. **Plugin Lifecycle Management**
   - *The Sandbox*: Skills expose a structured interface (`onLoad`, `onMessage`, `onUnload`) that the `PluginManager` orchestrates. The engine guarantees that `onUnload` is always called before a skill is evicted — whether due to a file change, explicit deletion, or runtime error — ensuring that timers, subscriptions, or stateful resources are released deterministically.
   - *The OpenClaw Translation*: Formalizes the contract between OpenClaw and its skill ecosystem. Every skill registered in the capability graph must be certifiably disposable — the framework cannot accumulate resource debt from the accumulation of skill loads over an agent's operational lifetime.

4. **Hot-Reload Without Service Interruption**
   - *The Sandbox*: Modifying a skill file on disk causes the engine to tear down the existing module instance, invoke its cleanup hook, and instantiate the new version — all within a single file-change event, with zero downtime to the simulation loop.
   - *The OpenClaw Translation*: Directly enables OpenClaw's planned *"live skill patching"* capability, allowing operators to update skill logic, fix behavioral regressions, or iterate on prompt templates during an active agent session without terminating ongoing conversational contexts.

---

## System Architecture

The engine is composed of three tightly scoped modules, each with a distinct responsibility:

- **`src/Sandbox.js`** — The trust boundary. Wraps Node's `vm` module to compile arbitrary skill code against a controlled context with a strict execution timeout (1000ms). Returns the skill's exported interface or `null` on failure, ensuring the host process is never destabilized by malformed skill code.

- **`src/PluginManager.js`** — The lifecycle orchestrator. Owns the `chokidar` watcher, maintains the canonical skill registry (`Map<filename, skillInterface>`), and dispatches `add`/`change`/`unlink` events to the appropriate load/reload/unload procedures. Exposes an `emit(eventName, ...args)` method that fans out events to all concurrently active skills.

- **`src/index.js`** — The runtime host. Initializes the `PluginManager` and exposes an interactive CLI (`simulate <message>`) to inject synthetic events into the engine, allowing the full skill execution pathway to be exercised without requiring external dependencies.

### Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js (v18+ recommended) |
| File Watching | `chokidar` |
| Skill Isolation | Node.js `vm` (native) |
| Interaction | `readline` (native) |

---

## Methodology & Setup

### Prerequisites
- Node.js (v18+)

### Initialization

```bash
# Install dependencies
npm install
```

### Execution

```bash
# Start the engine — skills/ is watched immediately
node src/index.js
```

The engine will begin watching the `skills/` directory. Any `.js` file present at startup will be auto-loaded. The interactive prompt accepts the following:

```bash
# Trigger an onMessage event across all loaded skills
> simulate ping
> simulate hello there

# Exit the runtime cleanly
> exit
```

### Hot-Loading Demonstration

With the engine running, open a second terminal and create a new skill file:

```bash
# Drop a new skill at runtime — no restart needed
echo "module.exports = { onMessage: (msg) => { if(msg==='math') console.log(2+2); } };" > skills/math.js
```

The engine will log the discovery and load event within milliseconds. Modifying or deleting the file will trigger the appropriate lifecycle events automatically.

---

## Skill Interface Contract

All skills must export an object conforming to the following interface. All methods are optional; the engine will only invoke methods that are present.

```javascript
module.exports = {
  // Called once immediately after the skill is loaded
  onLoad: () => { /* initialize state, start timers, etc. */ },

  // Called for every simulated message event emitted by the host
  onMessage: (msg) => { /* process the message */ },

  // Called before the skill is evicted — guaranteed to fire on reload or delete
  onUnload: () => { /* clean up timers, release resources */ }
};
```

Within a skill's execution context, the following globals are available:

| Global | Description |
|---|---|
| `console.log/error/warn` | Prefixed logger tied to the skill's filename |
| `bot.reply(msg)` | Simulated reply mechanism |
| `setTimeout / setInterval` | Standard timer functions |

---

## Future Vectors

Subsequent phases of this research will focus on:

- **Dependency Injection**: Exposing a richer, permissioned API surface to skills (e.g., access to a memory store or an LLM client), replacing the current minimal `bot` stub.
- **Skill Metadata & Manifests**: Requiring skills to declare a `manifest.json` alongside their implementation, enabling the engine to validate compatibility, version constraints, and required permissions before loading.
- **Inter-Skill Communication**: Investigating an event-bus architecture that allows skills to subscribe to and emit custom events, enabling emergent compositional behaviors without coupling skill implementations directly.
- **Promotion to OpenClaw Core**: The validated patterns from this module — particularly the `vm` sandboxing strategy and the `PluginManager` lifecycle contract — will be directly integrated into OpenClaw's skill registry subsystem.
#   R u n t i m e - E x t e n s i o n - E n g i n e  
 