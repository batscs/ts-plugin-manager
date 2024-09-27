import * as fs from 'fs';
import * as path from 'path';
import { Plugin } from './scale-api';
import express from "express";
import { v4 as uuidv4 } from 'uuid';

class PluginManager {
    private static pluginsDirectory: string = path.join(__dirname, "..", "..", "..", "..", 'scales');
    private static plugins: Map<string, Plugin> = new Map(); // Store registered plugins
    private static pluginUUIDs: Map<string, string> = new Map(); // Store UUIDs by plugin name
    private static allPermissions: Set<string> = new Set(); // Centralized permission tracking

    public static readonly PERMISSIONS = {
        ADMIN: "pangolin:admin",
        MANAGER: "pangolin:manager",
        MANAGER_SCALING: "pangolin:manager-scaling",
        MANAGER_USERS: "pangolin:manager-users",
    };

    /**
     * Performs a health check to ensure plugins are valid before loading.
     * Validates plugin names, permission overlaps, and permission format.
     */
    public static healthCheck(): boolean {
        for (const [name, plugin] of PluginManager.plugins) {
            if (!this.isPluginNameValid(name)) {
                return false;
            }

            if (!this.isPermissionStructureValid(name, plugin.getPermissions())) {
                return false;
            }

            // Reserved names conflict check
            if (this.isReservedName(name) || plugin.getPermissions().some(p => this.isReservedPermission(p))) {
                console.error(`Manager: Plugin ${name} is using reserved names or permissions.`);
                return false;
            }
        }
        return true;
    }

    /**
     * Cleans up unused plugins and permissions.
     */
    public static cleanup(): void {
        const currentPluginDirs = new Set(fs.readdirSync(PluginManager.pluginsDirectory));

        for (const pluginName of PluginManager.plugins.keys()) {
            if (!currentPluginDirs.has(pluginName)) {
                console.log(`Manager: Cleaning up unregistered plugin ${pluginName}.`);
                PluginManager.plugins.delete(pluginName);
            }
        }

        // Rebuild permissions after cleanup
        this.rebuildPermissions();
    }

    public static getPermissions(): string[] {
        return Object.values(this.PERMISSIONS);
    }

    /**
     * Load and register all plugins from the plugins directory.
     */
    public static loadPlugins(app: express.Application): void {
        const pluginDirs = fs.readdirSync(PluginManager.pluginsDirectory);
        if (!fs.existsSync(PluginManager.pluginsDirectory)) {
            console.error(`Manager: Plugin directory '${PluginManager.pluginsDirectory}' not found.`);
            return;
        }

        pluginDirs.forEach((dir) => {
            const pluginPath = path.join(PluginManager.pluginsDirectory, dir);
            if (fs.statSync(pluginPath).isDirectory()) {
                try {
                    const pluginModule = require(pluginPath);
                    if (pluginModule && pluginModule.default) {
                        const plugin: Plugin = pluginModule.default;

                        if (!this.registerPlugin(plugin, app)) {
                            console.error(`Manager: Plugin ${plugin.name} could not be registered due to conflicts.`);
                        }
                    } else {
                        throw new Error(`No default export found in plugin module at ${pluginPath}.`);
                    }
                } catch (error) {
                    console.error(`Manager: Failed to load plugin at ${pluginPath}:`, error);
                }
            }
        });
    }

    /**
     * Register the plugin and assign a UUID if it passes all conflict checks.
     * @param plugin Plugin to register
     * @param app Express application for registering endpoints
     * @returns boolean indicating success or failure of registration
     */
    private static registerPlugin(plugin: Plugin, app: express.Application): boolean {
        const name = plugin.name;

        // Check for name or permission conflicts
        if (!this.isPluginNameValid(name) || !this.isPermissionStructureValid(name, plugin.getPermissions())) {
            return false;
        }

        // Check if plugin name conflicts with reserved names
        if (this.isReservedName(name)) {
            console.error(`Manager: Plugin name '${name}' is reserved and cannot be used.`);
            return false;
        }

        // Ensure no permission conflicts
        if (plugin.getPermissions().some(p => this.isReservedPermission(p) || this.allPermissions.has(p))) {
            console.error(`Manager: Plugin ${name} has permission conflicts.`);
            return false;
        }

        try {
            // Generate or retrieve UUID
            let pluginUUID = this.pluginUUIDs.get(name) || uuidv4(); // Either retrieve an existing UUID or generate a new one
            this.pluginUUIDs.set(name, pluginUUID); // Store UUID for future use
            plugin.uuid = pluginUUID; // Pass UUID to the plugin

            console.log(`Manager: Plugin ${name} registered successfully with UUID ${pluginUUID}, initializing now...`);
            plugin.initialize();
            PluginManager.plugins.set(name, plugin);

            // Register the plugin's permissions
            plugin.getPermissions().forEach(perm => this.allPermissions.add(perm));

            const router = express.Router();
            plugin.registerEndpoints(router);
            app.use(`/plugin/${name}`, router);

            return true;
        } catch (error) {
            console.error(`Manager: Failed to initialize plugin ${name}:`, error);
            return false;
        }
    }

    /**
     * Validate if a plugin name is valid (no spaces, special chars).
     */
    private static isPluginNameValid(name: string): boolean {
        if (!name || name.includes(" ") || /[^a-zA-Z0-9_-]/.test(name)) {
            console.error(`Manager: Invalid plugin name '${name}'.`);
            return false;
        }
        return true;
    }

    /**
     * Validate if the plugin permissions are well-structured (prefix with plugin name).
     */
    private static isPermissionStructureValid(name: string, permissions: string[]): boolean {
        const valid = permissions.every(perm => perm.startsWith(`${name}:`));
        if (!valid) {
            console.error(`Manager: Plugin ${name} has permissions that do not follow the ${name}: prefix format.`);
        }
        return valid;
    }

    /**
     * Check if a name is reserved.
     */
    private static isReservedName(name: string): boolean {
        return name === 'pangolin';
    }

    /**
     * Check if a permission is reserved.
     */
    private static isReservedPermission(permission: string): boolean {
        return permission.startsWith('pangolin:');
    }

    /**
     * Start all registered plugins.
     */
    public static startPlugins(): void {
        this.managePlugins(true);
    }

    /**
     * Stop all registered plugins.
     */
    public static stopPlugins(): void {
        this.managePlugins(false);
    }

    /**
     * Manage (start/stop) all registered plugins.
     */
    private static managePlugins(start: boolean): void {
        for (const [name, plugin] of PluginManager.plugins) {
            if (start) {
                try {
                    plugin.start();
                    console.log(`Manager: Plugin ${name} started.`);
                } catch (error) {
                    console.error(`Manager: Failed to start plugin ${name}:`, error);
                }
            } else {
                try {
                    plugin.stop();
                    console.log(`Manager: Plugin ${name} stopped.`);
                } catch (error) {
                    console.error(`Manager: Failed to stop plugin ${name}:`, error);
                }
            }
        }
    }

    public static startPlugin(name: string): void {
        this.managePlugin(name, true);
    }

    public static stopPlugin(name: string): void {
        this.managePlugin(name, false);
    }

    private static managePlugin(name: string, start: boolean): void {
        const plugin = PluginManager.plugins.get(name);
        if (!plugin) {
            console.error(`Manager: Plugin ${name} is not registered.`);
            return;
        }

        if (start) {
            try {
                plugin.start();
                console.log(`Manager: Plugin ${name} started.`);
            } catch (error) {
                console.error(`Manager: Failed to start plugin ${name}:`, error);
            }
        } else {
            try {
                plugin.stop();
                console.log(`Manager: Plugin ${name} stopped.`);
            } catch (error) {
                console.error(`Manager: Failed to stop plugin ${name}:`, error);
            }
        }
    }

    public static getPluginNames(): string[] {
        return Array.from(PluginManager.plugins.keys());
    }

    public static getPlugins(): Plugin[] {
        return Array.from(PluginManager.plugins.values());
    }

    public static getAllPermissions(): any[] {
        return [
            { name: 'pangolin', permissions: this.getPermissions() },
            ...Array.from(PluginManager.plugins.values()).map(plugin => ({
                name: plugin.name,
                permissions: plugin.getPermissions(),
            }))
        ];
    }

    public static getPlugin(name: string): Plugin | null {
        return PluginManager.plugins.get(name) || null;
    }

    /**
     * Rebuilds all permissions when plugins are removed.
     */
    private static rebuildPermissions(): void {
        this.allPermissions.clear();
        PluginManager.plugins.forEach(plugin => {
            plugin.getPermissions().forEach(perm => this.allPermissions.add(perm));
        });
    }
}

export default PluginManager;
