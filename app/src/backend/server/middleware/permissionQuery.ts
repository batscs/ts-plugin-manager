import {NextFunction, Request, Response} from 'express';
import auth from "../../utils/common/authentication";

export function permissionQuery(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        req.permissions = [];
        next();
        return;
    }

    const user : string | null  = auth.getUserByToken(token);
    if (user) {
        req.permissions = auth.getUserPermissions(user);
    } else {
        req.permissions = [];
    }

    next();
}