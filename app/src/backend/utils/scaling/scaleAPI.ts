import {Router} from "express";
import Permissions from "../common/permission";

export interface Plugin {
    name: string;    // Plugin name
    version: string; // Plugin version
    running: boolean; // Plugin running state

    // TODO eventuell shortname: string
    //  eventuell zwanghaft die permissions mit prefix vom shortname forcen

    initialize(): void;
    start(): void;
    stop(): void;

    getPermissions(): string[];
    isAccessible(permissions: Permissions): boolean;

    registerEndpoints(router: Router): void;
}
