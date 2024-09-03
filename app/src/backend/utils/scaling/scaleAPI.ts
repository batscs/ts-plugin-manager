import {Router} from "express";

export interface Plugin {
    name: string;    // Plugin name
    version: string; // Plugin version
    running: boolean; // Plugin version

    initialize(): void;
    start(): void;
    stop(): void;

    renderContent(): string;

    registerEndpoints(router: Router): void;
}
