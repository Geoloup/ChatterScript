class ChatterScript {
    constructor() {
        this.classes = {};
        this.events = {};
    }

    loadFromFile(filePath) {
        if (!filePath.endsWith('.csc')) {
            throw new Error("Invalid file extension. Please provide a '.csc' file.");
        }

        const script = fs.readFileSync(filePath, 'utf8');
        this.parse(script);
    }

    loadFromString(script) {
        this.parse(script);
    }

    parse(script) {
        const lines = script.split('\n');
        let currentClass = null;

        for (let line of lines) {
            line = line.trim();

            // Secure evaluation: only allow known safe commands
            if (this.isSafe(line)) {

                // Handle events
                if (line.startsWith('on ')) {
                    const eventName = line.split(' ')[1].replace(':', '');
                    this.events[eventName] = [];
                }

                // Handle class definitions
                else if (line.startsWith('class ')) {
                    const className = line.split(' ')[1].replace(':', '');
                    this.classes[className] = {};
                    currentClass = className;
                }

                // Handle functions inside classes
                else if (line.startsWith('function ') && currentClass) {
                    const funcName = line.split(' ')[1].replace(':', '');
                    this.classes[currentClass][funcName] = (args) => {
                        console.log(`Executing function ${funcName} in class ${currentClass} with args:`, args);
                    };
                }

                // Handle function invocations
                else if (line.startsWith('reply(')) {
                    const message = line.match(/"([^"]+)"/)[1];
                    console.log('Bot replies:', message);
                }

                // Example to trigger the event
                else if (line.startsWith('say(')) {
                    const message = line.match(/"([^"]+)"/)[1];
                    console.log('Bot says:', message);
                }
            } else {
                console.error(`Unsafe code detected: ${line}`);
            }
        }
    }

    isSafe(line) {
        // Define safe operations here
        const safeKeywords = ['on', 'class', 'function', 'reply', 'say', 'if', 'contains'];
        return safeKeywords.some(keyword => line.startsWith(keyword));
    }

    triggerEvent(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}
