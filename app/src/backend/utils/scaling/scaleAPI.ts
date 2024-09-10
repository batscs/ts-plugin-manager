import {Router} from "express";
import Permissions from "../common/permission";

export interface Plugin {
    name: string;    // Plugin name
    version: string; // Plugin version

    // TODO eventuell shortname: string
    //  eventuell zwanghaft die permissions mit prefix vom shortname forcen

    initialize(): void;
    start(): void;
    stop(): void;

    getPermissions(): string[];
    getState(): string;
    getLogs(): string[];

    isAccessible(permissions: Permissions): boolean;
    isConfigurable(permissions: Permissions): boolean;

    // TODO getConfiguration(): config[];
    //  für konfigurieren in Management -> Settings/Configuration
    //  braucht wahrscheinlich dann auch setConfiguration(configs: config[]);

    registerEndpoints(router: Router): void;
}
