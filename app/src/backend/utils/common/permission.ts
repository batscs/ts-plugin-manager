export default class Permissions {
    private permissions: string[];

    constructor(permissions: string[]) {
        this.permissions = permissions;
    }

    public getPermissions(): string[] {
        return this.permissions;
    }

    // Method to check if a single permission exists
    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    // Method to check if all permissions are granted
    public hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.permissions.includes(permission));
    }

    // Method to check if any of the given permissions are granted
    public hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.permissions.includes(permission));
    }
}