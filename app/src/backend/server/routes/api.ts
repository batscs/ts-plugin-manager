// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import auth from "../../utils/common/authentication";
import PluginManager from "../../utils/scaling/manager";
import manager from "../../utils/scaling/manager";
import Permissions from "../../utils/common/permission";

router.get('/api/plugins', (req: Request, res: Response) => {
    // TODO Permisisons checking

    res.send({"plugins": manager.getPluginNames()});
});

router.get("/api/admin/plugin/:name/info", (req: Request, res: Response) => {
    // TODO Permisisons checking
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"status": "?"});
    } else {
        res.send({"status": plugin.getState()});
    }
});

router.get("/api/admin/plugin/:name/stop", (req: Request, res: Response) => {
    // TODO Permisisons checking
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"error": "no plugin"});
    } else {
        plugin.stop();
        res.send({"status": plugin.getState()});
    }
});

router.get("/api/admin/plugin/:name/start", (req: Request, res: Response) => {
    // TODO Permisisons checking
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"error": "no plugin"});
    } else {
        plugin.start();
        res.send({"status": plugin.getState()});
    }
});

router.get('/api/navigation', (req: Request, res: Response) => {
    type hallo = {
        name: string;
        url: string;
    };

    let result: hallo[] = [];
    const token: string = req.cookies.token;
    const perms: Permissions = req.permission;

    result.push({name: "Homepage", url: "/"});

    if (perms.hasPermission(manager.PERMISSION_ADMIN)) {
        result.push({name: "Management", url: "/admin"});
    }

    if (perms.isGuest()) {
        result.push({name: "Login", url: "/login"});
    } else {
        result.push({name: "My Profile", url: "/profile"});
    }

    result.push({name: "-----------", url: ""});

    // TODO zu jedem plugin {} noch ergänzen {running: true/false}
    //  im frontend dann anzeigen lassen ob running oder nicht anklickbar

    Object.values(manager.plugins).forEach(plugin => {
        if (plugin.isAccessible(perms)) {
            result.push({name: plugin.name, url: `/plugin/${plugin.name}`});
        }
    });

    res.send({"plugins": result});
});

router.get('/api/permissions', (req: Request, res: Response) => {
    res.send({"permissions": manager.getPluginPermissions()});
});

router.post('/api/login', (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    let userid = null;

    if (!username || !password) {
        res.status(400).send({"error": "username and password is required"});
    } else if (!(userid = auth.login(username, password))) {
        res.status(400).send({"error": "invalid username or password"});
    } else {
        const token = auth.registerToken(userid);
        res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
        res.redirect(`/`);
    }
});

export default router;
