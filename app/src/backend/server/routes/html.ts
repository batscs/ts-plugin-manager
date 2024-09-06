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
    // TODO Permisisons checking

    const dir_file = path.join(dir_admin, "plugins.pug");
    const compiledFunction = pug.compileFile(dir_file);
    res.send(compiledFunction({plugins: manager.getPluginNames()}));
});

export default router;
