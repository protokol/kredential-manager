const DEBUG = true;

function log(...messages: unknown[]): void {
    if (DEBUG) {
        console.log(...messages);
    }
}

export { log };