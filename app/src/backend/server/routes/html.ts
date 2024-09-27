// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import auth from "../../utils/common/authentication";
import manager from "../../utils/scaling/manager";
import Permissions from "../../utils/common/permission";
import pug from "pug";
import path from "path";

const dir: string = path.join(__dirname, "..", "..", "..", "frontend", "pug");
const dir_admin: string = path.join(dir, "fragments", "admin");

router.get('/api/html/admin/plugins', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;

    if (perms.hasAnyPermission(manager.PERMISSIONS.ADMIN, manager.PERMISSIONS.MANAGER)) {
        const dir_file = path.join(dir_admin, "plugins.pug");
        const compiledFunction = pug.compileFile(dir_file);

        let plugins = manager.getPlugins();

        if (!perms.hasAnyPermission(manager.PERMISSIONS.ADMIN, manager.PERMISSIONS.MANAGER_SCALING)) {
            plugins = plugins.filter(plugin => plugin.isConfigurable(perms));
        }

        const names = plugins.map(plugin => plugin.name);

        res.send(compiledFunction({plugins: names}));
    } else {
        res.send("no permissions");
    }
});

router.get('/api/html/admin/users', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;

    if (perms.hasAnyPermission(manager.PERMISSIONS.ADMIN, manager.PERMISSIONS.MANAGER)) {
        const dir_file = path.join(dir_admin, "users.pug");
        const compiledFunction = pug.compileFile(dir_file);
        res.send(compiledFunction({plugins: manager.getPluginNames()}));
    } else {
        res.send("no permissions");
    }
});

export default router;
