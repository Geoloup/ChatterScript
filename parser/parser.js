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
                this.log.push(`Event handler for '${eventName}' registered.`);
            }

            // Handle class definitions
            else if (line.startsWith('class ')) {
                const className = line.split(' ')[1].replace(':', '');
                this.classes[className] = {};
                currentClass = className;
                this.log.push(`Class '${className}' defined.`);
            }

            // Handle function definitions inside classes
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

            // Allow calls to defined functions and methods
            else if (this.isFunctionCall(line)) {
                const methodName = line.split('(')[0].trim();
                const args = this.extractArgs(line);
                this.callFunction(methodName, args);
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
                this.log.push(`Called method ${className}.${methodName} with args: ${JSON.stringify(args)}`);
            } else {
                this.log.push(`Error: Method ${methodName} not found in class ${className}`);
            }
        }
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
