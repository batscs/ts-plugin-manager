export default class Permissions {
    private permissions: string[];
    private userid: string | null;

    constructor(userid: string | null, permissions: string[]) {
        this.permissions = permissions;
        this.userid = userid;
    }

    public getPermissions(): string[] {
        return this.permissions;
    }

    // Method to check if a single permission exists
    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    // Method to check if all permissions are granted
    public hasAllPermissions(...permissions: string[]): boolean {
        return permissions.every(permission => this.permissions.includes(permission));
    }

    // Method to check if any of the given permissions are granted
    public hasAnyPermission(...permissions: string[]): boolean {
        return permissions.some(permission => this.permissions.includes(permission));
    }

    /**
     * True if session has no token or no token that can be associated with a user.
     */
    public isGuest(): boolean {
        return this.userid == null;
    }
}