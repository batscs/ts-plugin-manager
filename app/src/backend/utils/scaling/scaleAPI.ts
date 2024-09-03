import {Router} from "express";

export interface Plugin {
    name: string;    // Plugin name
    version: string; // Plugin version
    running: boolean; // Plugin running state

    initialize(): void;
    start(): void;
    stop(): void;

    registerEndpoints(router: Router): void;
}
