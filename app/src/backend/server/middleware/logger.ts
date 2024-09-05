// src/middleware/logger.ts

import { Request, Response, NextFunction } from 'express';
import Permissions from '../../utils/common/permission'; // Adjust path if necessary

const logger = (req: Request, res: Response, next: NextFunction) => {
    const ip: string | undefined = req.ip;
    const timestamp: string = new Date().toISOString();
    const url: string = req.baseUrl + req.path; // Constructing the URL without query parameters
    const params: string = JSON.stringify(req.params);
    const query: string = JSON.stringify(req.query);
    const body: string = JSON.stringify(req.body);
    const perms: string = JSON.stringify(req.permission ? req.permission.getPermissions() : []);

    console.log(`[${timestamp}] IP: ${ip} URL: ${req.method} ${url} QUERY: ${query} BODY: ${body} PARAMS: ${params} PERMISSIONS: ${perms}`);

    next();
};

export default logger;