// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/databaseJson";

router.get('/', (req: Request, res: Response) => {
    res.render("index", {});
});

router.get('/about', (req: Request, res: Response) => {
    console.log(db.getContent());
    res.send('About Page');
});

export default router;
