const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const Sandbox = require('./Sandbox');

class PluginManager {
    constructor(pluginDir) {
        this.pluginDir = pluginDir;
        this.skills = new Map(); // filename -> exported skill object
        this.sandbox = new Sandbox();
    }

    start() {
        console.log(`[PluginManager] Watching directory: ${this.pluginDir}`);
        
        if (!fs.existsSync(this.pluginDir)) {
            fs.mkdirSync(this.pluginDir, { recursive: true });
        }

        // Initialize chokidar watcher
        this.watcher = chokidar.watch(path.join(this.pluginDir, '*.js'), {
            persistent: true,
            ignoreInitial: false // Automatically load any files already in the folder on startup
        });

        this.watcher
            .on('add', (filePath) => this.loadPlugin(filePath))
            .on('change', (filePath) => this.reloadPlugin(filePath))
            .on('unlink', (filePath) => this.unloadPlugin(filePath));
    }

    loadPlugin(filePath) {
        const filename = path.basename(filePath);
        try {
            const code = fs.readFileSync(filePath, 'utf-8');
            const exportedSkill = this.sandbox.execute(code, filename);

            if (exportedSkill) {
                this.skills.set(filename, exportedSkill);
                console.log(`[PluginManager] Loaded skill: ${filename}`);
                
                // Trigger an optional initialization lifecycle hook
                if (typeof exportedSkill.onLoad === 'function') {
                    exportedSkill.onLoad();
                }
            }
        } catch (err) {
            console.error(`[PluginManager] Failed to read/load ${filename}:`, err.message);
        }
    }

    reloadPlugin(filePath) {
        const filename = path.basename(filePath);
        console.log(`[PluginManager] Reloading skill: ${filename}...`);
        
        this.unloadPlugin(filePath, true); // Pass true to indicate it's a reload
        this.loadPlugin(filePath);
    }

    unloadPlugin(filePath, isReload = false) {
        const filename = path.basename(filePath);
        const skill = this.skills.get(filename);
        
        if (skill) {
            // Trigger cleanup lifecycle hook
            if (typeof skill.onUnload === 'function') {
                skill.onUnload();
            }
            this.skills.delete(filename);
            
            if (!isReload) {
                console.log(`[PluginManager] Unloaded skill: ${filename}`);
            }
        }
    }

    // Emit events to all loaded skills
    emit(eventName, ...args) {
        for (const [filename, skill] of this.skills.entries()) {
            if (typeof skill[eventName] === 'function') {
                try {
                    skill[eventName](...args);
                } catch (err) {
                    console.error(`[PluginManager] Error in skill '${filename}' during event '${eventName}':`, err.message);
                }
            }
        }
    }
}

module.exports = PluginManager;
