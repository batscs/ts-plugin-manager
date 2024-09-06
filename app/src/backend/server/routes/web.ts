// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import PluginManager from "../../utils/scaling/manager";
import Permissions from "../../utils/common/permission";
import manager from "../../utils/scaling/manager";

router.get('/', (req: Request, res: Response) => {
    res.render("index");
});

router.get('/login', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;

    if (perms.isGuest()) {
        res.render("login");
    } else {
        res.redirect("/");
    }
});

router.get('/admin', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;

    if (perms.hasPermission(manager.PERMISSION_ADMIN)) {
        res.render("admin");
    } else {
        res.redirect("/error/no-permissions");
    }

});

export default router;
