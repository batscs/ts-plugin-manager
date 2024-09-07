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
    isAccessible(permissions: Permissions): boolean;
    getState(): string;

    getLogs(): string[];
    // TODO getLog(): string[] implementieren
    //  das wird witzig das auch ordentlich auf der adminpage zu verwenden, eventuell muss man das umstrukturieren
    //  in seperate page plugin-info für ein spezifisches plugin welches man suchen kann mit custom autocomplete
    //  ja das ist eine gute idee

    registerEndpoints(router: Router): void;
}
