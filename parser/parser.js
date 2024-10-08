class ChatterScript {
    constructor() {
        this.classes = {};
        this.events = {};
        this.log = []; // Array to store log messages
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

            if (this.isSafe(line)) {
                // Handle events
                if (line.startsWith('on ')) {
                    const eventName = line.split(' ')[1].replace(':', '');
                    this.events[eventName] = [];
                    this.log.push(`Event handler for '${eventName}' registered.`);
                }

                // Handle class definitions
                else if (line.startsWith('class ')) {
                    const className = line.split(' ')[1].replace(':', '');
                    this.classes[className] = {};
                    currentClass = className;
                    this.log.push(`Class '${className}' defined.`);
                }

                // Handle functions inside classes
                else if (line.startsWith('function ') && currentClass) {
                    const funcName = line.split(' ')[1].replace(':', '');
                    this.classes[currentClass][funcName] = (args) => {
                        this.log.push(`Executing function ${funcName} in class ${currentClass} with args: ${JSON.stringify(args)}`);
                    };
                    this.log.push(`Function '${funcName}' defined in class '${currentClass}'.`);
                }

                // Handle replies and messages
                else if (line.startsWith('reply(')) {
                    const message = line.match(/"([^"]+)"/)[1];
                    this.log.push(`Bot replies: ${message}`);
                } else if (line.startsWith('say(')) {
                    const message = line.match(/"([^"]+)"/)[1];
                    this.log.push(`Bot says: ${message}`);
                }
            } else {
                this.log.push(`Unsafe code detected: ${line}`);
            }
        }
    }

    isSafe(line) {
        const safeKeywords = ['on', 'class', 'function', 'reply', 'say', 'if', 'contains'];
        return safeKeywords.some(keyword => line.startsWith(keyword));
    }

    triggerEvent(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
            this.log.push(`Event '${eventName}' triggered with data: ${JSON.stringify(data)}`);
        }
    }

    getLogs() {
        return this.log.join('\n'); // Return logs as a single string
    }
}
