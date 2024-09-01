export interface Plugin {
    name: string;    // Plugin name
    version: string; // Plugin version

    initialize(): void;
    start(): void;
    stop(): void;
}
