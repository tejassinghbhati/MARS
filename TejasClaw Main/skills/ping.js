module.exports = {
    onLoad: () => {
        console.log("Ping skill initialized!");
    },
    
    onUnload: () => {
        console.log("Ping skill cleaning up...");
    },

    onMessage: (msg) => {
        if (msg.toLowerCase() === 'ping') {
            console.log("Pong!");
            bot.reply("Pong!"); // Uses the simulated bot API from the Sandbox
        }
    }
};
