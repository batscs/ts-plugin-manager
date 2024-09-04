import * as fs from 'fs';
import * as path from 'path';
import { Plugin } from './scaleAPI';
import express from "express";

class PluginManager {
    private static pluginsDirectory: string = path.join(__dirname, "..", "..", "..", "..", 'scales');
    // TODO Maybe getter statt public
    public static plugins: Record<string, Plugin> = {};
    private static pluginStates: Record<string, boolean> = {}; // Track plugin start/stop states

    public static loadPlugins(app: any): void {
        const pluginDirs = fs.readdirSync(PluginManager.pluginsDirectory);

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

    public static getPermissions(): string[] {
        let result: string[] = [];

        for (const plugin  of Object.values(PluginManager.plugins)) {
            result = result.concat(plugin.getPermissions());
        }

        return result;
    }

}

export default PluginManager;
