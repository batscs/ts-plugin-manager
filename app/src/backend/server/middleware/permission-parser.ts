import {NextFunction, Request, Response} from 'express';
import auth from "../../utils/common/authentication";
import Permissions from '../../utils/common/permission'

export function permissionParser(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) {
        req.permission = new Permissions(null, []);
        next();
        return;
    }

    const user : string | null  = auth.getUserByToken(token);
    if (user) {
        req.permission = new Permissions(user, auth.getUserPermissions(user));
    } else {
        req.permission = new Permissions(null, []);
        res.clearCookie("token");
    }

    next();
}