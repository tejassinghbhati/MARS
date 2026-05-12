const vm = require('vm');

class Sandbox {
    constructor() {
        // Define base globals available in all sandboxes if needed
    }

    execute(code, filename) {
        // Context is the isolated environment for the skill
        const context = {
            console: {
                log: (...args) => console.log(`[Skill: ${filename}]`, ...args),
                error: (...args) => console.error(`[Skill: ${filename}] ERROR:`, ...args),
                warn: (...args) => console.warn(`[Skill: ${filename}] WARN:`, ...args)
            },
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            // Simulated global APIs for the bot
            bot: {
                reply: (msg) => console.log(`[Bot Action] Replying: ${msg}`)
            }
        };

        // We compile the code in a wrapper so it acts like a CommonJS module
        // that exports an object.
        const wrapper = `
            const module = { exports: {} };
            const exports = module.exports;
            (function() {
                ${code}
            })();
            module.exports;
        `;

        try {
            vm.createContext(context);
            const script = new vm.Script(wrapper, { filename });
            // Run code with a timeout to prevent infinite loops (like while(true){})
            const result = script.runInContext(context, {
                timeout: 1000 
            });
            return result;
        } catch (err) {
            console.error(`[Sandbox Error] Failed to execute ${filename}:`, err.message);
            return null;
        }
    }
}

module.exports = Sandbox;
