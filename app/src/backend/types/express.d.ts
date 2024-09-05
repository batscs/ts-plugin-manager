// src/backend/types/express.d.ts
import * as express from 'express';
import { Permissions } from '../utils/permission';

declare global {
    namespace Express {
        interface Request {
            permission?: Permissions;
        }
    }
}