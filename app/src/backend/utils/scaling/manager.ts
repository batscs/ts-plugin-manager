import * as fs from 'fs';
import * as path from 'path';
import {Plugin} from './scaleAPI';
import express from "express";

class PluginManager {
    private static pluginsDirectory: string = path.join(__dirname, "..", "..", "..", "..", 'scales');
    // TODO Maybe getter statt public
    public static plugins: Record<string, Plugin> = {};
    private static pluginStates: Record<string, boolean> = {}; // Track plugin start/stop states

    public static PERMISSION_ADMIN: string = "pangolin:admin";
    public static PERMISSION_MANAGER: string = "pangolin:manager";
    public static PERMISSION_MANAGER_SCALING: string = "pangolin:manager-scaling";
    public static PERMISSION_MANAGER_USERS: string = "pangolin:manager-users";

    // TODO Irgendwie Methode zum deploy von neuem Plugin/Scale
    //  public static PERMISSION_MANAGER_DEPLOY: string = "pangolin:manager-deploy";


    public static healthCheck(): boolean {
        // TODO use at the beginning of loadPlugins

        // TODO Check if no plugin has empty name or invalid name (like having space ' ' in the name or weird characters)

        // TODO Check if no plugins plugin.getPermissions() have overlapping permission names
        //  also considering this.getPermissions()

        // TODO Check if all plugin permissions follow format ${name}:.+
        //  and no duplicate names, also name 'pangolin' is a reserved name
        return true;
    }

    public static cleanup(): void {
        // TODO use at the end of loadPlugins

        // TODO Check if no user has permissions that are not used by ANY plugin

        // TODO Remove any plugin from plugins Record that is no longer in scales folder
    }

    public static getPermissions(): string[] {
        return [this.PERMISSION_ADMIN, this.PERMISSION_MANAGER, this.PERMISSION_MANAGER_SCALING, this.PERMISSION_MANAGER_USERS];
    }

    public static loadPlugins(app: any): void {
        // TODO Only loadPlugins if healthCheck() returns true

        const pluginDirs = fs.readdirSync(PluginManager.pluginsDirectory);
        // TODO Eventuell check ob directory überhaupt existiert

        pluginDirs.forEach((dir) => {
            const pluginPath = path.join(PluginManager.pluginsDirectory, dir);

            if (fs.statSync(pluginPath).isDirectory()) {
                const pluginModule = require(pluginPath);
                // TODO catch if not a plugin interface implementation
                const plugin: Plugin = pluginModule.default;
                const name : string = plugin.name;

                if (!PluginManager.plugins[name]) { // Only load if not already registered
                    try {
                        PluginManager.plugins[plugin.name] = plugin;
                        PluginManager.pluginStates[plugin.name] = false; // Mark plugin as registered but not started
                        console.log(`Manager: Plugin ${plugin.name} registered.`);
                        plugin.initialize();
                        const router = express.Router();

                        // Register endpoints with the new router
                        plugin.registerEndpoints(router);

                        // Use the router under /plugin/{pluginName}
                        app.use(`/plugin/${plugin.name}`, router);
                    } catch (error) {
                        console.error(`Manager: Failed to load plugin at ${pluginPath}:`, error);
                    }
                } else {
                    console.log(`Manager: Plugin ${dir} is already registered.`);
                }
            }
        });
    }

    public static startPlugins(): void {
        for (const [name, plugin] of Object.entries(PluginManager.plugins)) {
            if (!PluginManager.pluginStates[name]) { // Only start if not already started
                try {
                    PluginManager.pluginStates[name] = true;
                    console.log(`Manager: Plugin ${name} started.`);
                    plugin.start();
                } catch (error) {
                    console.error(`Manager: Failed to start plugin ${name}:`, error);
                }
            } else {
                console.log(`Manager: Plugin ${name} is already started.`);
            }
        }
    }

    public static startPlugin(name: string): void {
        const plugin = PluginManager.plugins[name];
        if (plugin && !PluginManager.pluginStates[name]) {
            try {
                PluginManager.pluginStates[name] = true;
                console.log(`Manager: Plugin ${name} started.`);
                plugin.start();
            } catch (error) {
                console.error(`Manager: Failed to start plugin ${name}:`, error);
            }
        } else if (PluginManager.pluginStates[name]) {
            console.log(`Manager: Plugin ${name} is already started.`);
        } else {
            console.log(`Manager: Plugin ${name} is not registered.`);
        }
    }

    public static stopPlugins(): void {
        for (const [name, plugin] of Object.entries(PluginManager.plugins)) {
            if (PluginManager.pluginStates[name]) { // Only stop if started
                try {
                    PluginManager.pluginStates[name] = false;
                    console.log(`Manager: Plugin ${name} stopped.`);
                    plugin.stop();
                } catch (error) {
                    console.error(`Manager: Failed to stop plugin ${name}:`, error);
                }
            } else {
                console.log(`Manager: Plugin ${name} is already stopped.`);
            }
        }
    }

    public static stopPlugin(name: string): void {
        const plugin = PluginManager.plugins[name];
        if (plugin && PluginManager.pluginStates[name]) {
            try {
                PluginManager.pluginStates[name] = false;
                console.log(`Manager: Plugin ${name} stopped.`);
                plugin.stop();
            } catch (error) {
                console.error(`Manager: Failed to stop plugin ${name}:`, error);
            }
        } else if (!PluginManager.pluginStates[name]) {
            console.log(`Manager: Plugin ${name} is already stopped.`);
        } else {
            console.log(`Manager: Plugin ${name} is not registered.`);
        }
    }

    public static getPluginNames(): string[] {
        return Object.keys(PluginManager.plugins);
    }

    public static getAllPermissions(): any[] {
        let result: any[] = [];

        result.push({
           name: "pangolin",
            permissions: this.getPermissions()
        });

        for (const plugin of Object.values(PluginManager.plugins)) {
            result.push({
                name: plugin.name,
                permissions: plugin.getPermissions()
            });
        }

        return result;
    }

    public static getPlugin(name: string): Plugin | null {
        return PluginManager.plugins[name] || null;
    }
}

export default PluginManager;
