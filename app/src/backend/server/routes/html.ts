// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import PluginManager from "../../utils/scaling/manager";

router.get('/', (req: Request, res: Response) => {
    res.render("index");
});

router.get('/login', (req: Request, res: Response) => {
    res.render("login");
});

export default router;
