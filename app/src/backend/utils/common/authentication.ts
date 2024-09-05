import crypto from "crypto";
import db from "./database";

type TokenEntry = {
    token: string;
    timestamp: number; // store timestamp in milliseconds
    userid: string; // associate the token with a user ID
};

export default class Authentication {
    // Store tokens in a Set. The Set will store objects of type TokenEntry
    private static tokenSet: Set<TokenEntry> = new Set();

    static generateToken(): string {
        // Generate and return a new token without any additional logic
        return crypto.randomUUID();
    }

    static registerToken(userid: string): string {
        // Generate a token
        const token: string = this.generateToken();

        // Get the current timestamp
        const now: number = Date.now();

        // Add the token, timestamp, and userid to the Set
        this.tokenSet.add({ token, timestamp: now, userid });

        // Clean up tokens older than 14 days
        this.cleanupOldTokens();

        // Return the generated token
        return token;
    }


    static getUserByToken(token: string): string | null {
        // Find the entry with the given token
        const entry = [...this.tokenSet].find(entry => entry.token === token);
        return entry ? entry.userid : null;
    }

    static getUserPermissions(userid: string): string[] {
        const users = db.getUsers();
        const user = users.find(user => user.id === userid);
        return user ? user.permissions : [];
    }

    static grantPermission(userid: string, permission: string): void {
        const users = db.getUsers();
        const user = users.find(user => user.id === userid);
        if (user && !user.permissions.includes(permission)) {
            user.permissions.push(permission);
            db.saveUsers(users); // Assuming `db.saveUsers` writes users back to the DB
        }
    }

    static login(username: string, password: string): string | null {
        const users = db.getUsers();
        const user = users.find(user => user.username === username);
        if (user && user.password === password) {
            return user.id;
        }
        return null;
    }

    static authenticateToken(token: string): boolean {
        // Check if the token exists in the Set
        return !![...this.tokenSet].find(entry => entry.token === token);
    }

    private static cleanupOldTokens(): void {
        const expiration = 14 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const maxTimestamp = now + expiration;

        // Iterate through the Set and remove tokens older than 14 days
        for (let entry of this.tokenSet) {
            if (entry.timestamp > maxTimestamp) {
                this.tokenSet.delete(entry);
            }
        }
    }
}
