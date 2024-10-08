class ChatterScript {
    constructor() {
        this.classes = {};
        this.events = {};
        this.log = []; // Array to store log messages
    }

    loadFromFile(filePath) {
        if (!filePath.endsWith('.csc')) {
            this.log.push("Invalid file extension. Please provide a '.csc' file.");
            return; // Stop loading if the file extension is invalid
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

            // Handle function definitions inside classes
            else if (line.startsWith('function ') && currentClass) {
                const funcName = line.split(' ')[1].replace(':', '');
                this.classes[currentClass][funcName] = (args) => {
                    const name = args[0] || "there"; // Default name if no argument is provided
                    this.log.push(`Bot replies: Hello, ${name}!`);
                };
            }

            // Handle replies and messages
            else if (line.startsWith('reply(')) {
                const message = line.match(/"([^"]+)"/)[1];
                this.log.push(`Bot replies: ${message}`);
            } else if (line.startsWith('say(')) {
                const message = line.match(/"([^"]+)"/)[1];
                this.log.push(`Bot says: ${message}`);
            }

            // Allow calls to defined functions and methods
            else if (this.isFunctionCall(line)) {
                const args = this.extractArgs(line);
                this.callFunction(line, args);
            }
        }
    }

    isFunctionCall(line) {
        const functionCallRegex = /(\w+)\.(\w+)\s*\(\s*(.*)\s*\)/; // Matches method calls like ClassName.methodName(args)
        return functionCallRegex.test(line);
    }

    extractArgs(line) {
        const functionCallRegex = /(\w+)\.(\w+)\s*\(\s*(.*)\s*\)/; // Matches method calls like ClassName.methodName(args)
        const match = line.match(functionCallRegex);
        if (match) {
            const argsString = match[3]; // Extract the arguments string
            return argsString.split(',').map(arg => arg.trim().replace(/['"]/g, '')); // Return as an array of strings
        }
        return [];
    }

    callFunction(line, args) {
        const functionCallRegex = /(\w+)\.(\w+)/; // Matches method calls like ClassName.methodName
        const match = line.match(functionCallRegex);
        if (match) {
            const className = match[1];
            const methodName = match[2];
            // Check if the class and method exist
            if (className in this.classes && methodName in this.classes[className]) {
                this.classes[className][methodName](args); // Call the function with arguments
            }
        }
    }

    triggerEvent(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }

    getLogs() {
        return this.log.join('\n'); // Return logs as a single string
    }
}
