// src/backend/types/express.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        permissions?: string[]; // Replace 'any' with the specific type if available
    }
}