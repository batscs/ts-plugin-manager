// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import PluginManager from "../../utils/scaling/manager";
import Permissions from "../../utils/common/permission";
import manager from "../../utils/scaling/manager";

// TODO /error/permissions/:source oder sowas in der art

// TODO /error/notfound/:source oder sowas in der art

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

    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER)) {
        res.render("admin");
    } else {
        res.render("error", {error: "not authorized to access this ressource"});
    }

});

export default router;
