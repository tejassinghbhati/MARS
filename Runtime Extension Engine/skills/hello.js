let counter = 0;

module.exports = {
    onLoad: () => {
        console.log("Hello skill ready to greet!");
    },

    onMessage: (msg) => {
        if (msg.toLowerCase().includes('hello') || msg.toLowerCase().includes('hi')) {
            counter++;
            console.log(`Hello there! I have greeted you ${counter} times in this session.`);
        }
    }
};
