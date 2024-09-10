// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import auth from "../../utils/common/authentication";
import PluginManager from "../../utils/scaling/manager";
import manager from "../../utils/scaling/manager";
import Permissions from "../../utils/common/permission";
import {User} from "../../types/database";

// TODO Kann gelöscht werden (nirgends benutzt?)
router.get('/api/admin/plugin/plugins', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;

    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_SCALING)) {
        res.send({"plugins": manager.getPluginNames()});
    } else {
        res.send({"error": "no permissions"});
    }
});

router.post('/api/admin/users/search', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;
    const search: string = req.body.search;

    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_USERS)) {
        res.send(db.getUsers().filter(user => user.username.includes(search)).map(user => user.username));
    } else {
        res.send({"error": "no permissions"});
    }
});

router.get('/api/admin/user/:username', (req: Request, res: Response) => {
    const perms: Permissions = req.permission;
    const search: string = req.params.username;

    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_USERS)) {
        const user : User | null = db.getUsers().find(user => user.username == search) || null;
        let result: {} = {};
        if (user) {
            result = {
                "username": user.username,
                "permissions": user.permissions
            }
        } else {
            result = {"error": "not found"};
        }
        res.send(result);
    } else {
        res.send({"error": "no permissions"});
    }
});

router.post('/api/admin/user/:username/permission', (req: Request, res: Response) => {
    const username = req.params.username;
    const action = req.body.action;
    const permission = req.body.permission;

    // TODO permission checking admin || manager-users

    // TODO check ob permission überhaupt existiert

    const users = db.getUsers();
    const user = users.find(user => user.username == username) || null;

    if (user == null) {
        res.send({"error": "user not found"});
        return;
    }

    if (action == "added") {
        user.permissions.push(permission);
    } else if (action == "removed") {
        const index = user.permissions.indexOf(permission);
        user.permissions.splice(index, 1);
    }

    db.saveUsers(users);

    res.send({message: "successfully added permission", permissions: user.permissions});
});

router.get("/api/admin/plugin/:name/info", (req: Request, res: Response) => {
    const perms = req.permission;
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"error": "plugin not found"});
    } else if (plugin.isConfigurable(perms) || perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_SCALING)) {
        res.send({"status": plugin.getState()});
    } else {
        res.send({error: "unauthorized"});
    }
});

router.get("/api/admin/plugin/:name/logs", (req: Request, res: Response) => {
    const perms = req.permission;
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"error": "plugin not found"});
    } else if (plugin.isConfigurable(perms) || perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_SCALING)) {
        res.send({"logs": plugin.getLogs()});
    } else {
        res.send({error: "unauthorized"});
    }
});

router.get("/api/admin/plugin/:name/stop", (req: Request, res: Response) => {
    const perms = req.permission;
    const name = req.params.name;
    const plugin = manager.getPlugin(name);

    if (plugin == null) {
        res.send({"error": "no plugin"});
    } else if (plugin.isConfigurable(perms) || perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_SCALING)) {
        plugin.stop();
        res.send({"status": plugin.getState()});
    } else {
        res.send({error: "unauthorized"});
    }
});

router.get("/api/admin/plugin/:name/start", (req: Request, res: Response) => {
    const name = req.params.name;
    const plugin = manager.getPlugin(name);
    const perms: Permissions = req.permission;

    if (plugin == null) {
        res.send({"error": "no plugin"});
    } else if (plugin.isConfigurable(perms) || perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_SCALING)) {
        plugin.start();
        res.send({"status": plugin.getState()});
    } else {
        res.send({error: "unauthorized"});
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

    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER)) {
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

router.get('/api/admin/permissions', (req: Request, res: Response) => {
    // TODO permissions check admin || manager-users
    const perms : Permissions = req.permission;
    if (perms.hasAnyPermission(manager.PERMISSION_ADMIN, manager.PERMISSION_MANAGER_USERS)) {
        res.send(manager.getAllPermissions());
    } else {
       res.send({error: "unauthorized"})
    }
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
