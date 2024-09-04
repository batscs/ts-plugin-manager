// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import PluginManager from "../../utils/scaling/manager";
import manager from "../../utils/scaling/manager";

router.get('/api/plugins', (req: Request, res: Response) => {
    res.send({"plugins": manager.getPluginNames()});
});

router.get('/api/permissions', (req: Request, res: Response) => {
    res.send({"permissions": manager.getPermissions()});
});


export default router;
