import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from "chokidar";
import { Plugin } from './api';

class PluginManager {
    private static pluginsDirectory: string = path.join(__dirname, "..", "..", "..", "..", 'scales');
    private static plugins: Record<string, Plugin> = {};
    private static pluginStates: Record<string, boolean> = {}; // Track plugin start/stop states

    // Function to discover and load plugins
    public static loadPlugins(): void {
        const pluginDirs = fs.readdirSync(PluginManager.pluginsDirectory);

        pluginDirs.forEach((dir) => {
            const pluginPath = path.join(PluginManager.pluginsDirectory, dir);

            if (fs.statSync(pluginPath).isDirectory()) {
                try {
                    const pluginModule = require(pluginPath);
                    const plugin: Plugin = pluginModule.default;

                    if (!PluginManager.plugins[plugin.name]) { // Use plugin's name attribute
                        PluginManager.plugins[plugin.name] = plugin;
                        PluginManager.pluginStates[plugin.name] = false; // Mark plugin as registered but not started
                        console.log(`Manager: Plugin ${plugin.name} (v${plugin.version}) registered.`);
                        plugin.initialize();
                    } else {
                        console.log(`Manager: Plugin ${plugin.name} is already registered.`);
                    }
                } catch (error) {
                    console.error(`Manager: Failed to load plugin at ${pluginPath}:`, error);
                }
            }
        });
    }

    // Function to start all registered plugins
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

    // Function to start a specific plugin by name
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

    // Function to stop all registered plugins
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

    // Function to stop a specific plugin by name
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
}

export default PluginManager;