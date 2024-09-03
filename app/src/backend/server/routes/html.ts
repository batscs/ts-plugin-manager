// src/routes/router.ts
import { Router, Request, Response } from 'express';
const router = Router();

import db from "../../utils/common/database";
import PluginManager from "../../utils/scaling/manager";

router.get('/', (req: Request, res: Response) => {
    res.render("index", {});
});

router.get('/plugin/:name', (req: Request, res: Response) => {
    const pluginName = req.params.name;
    const plugin = PluginManager.plugins[pluginName];

    if (plugin) {
        try {
            const pluginContent = plugin.renderContent();
            res.render('plugin', { pluginContent });
        } catch (error) {
            console.error(`Error rendering content for plugin ${pluginName}:`, error);
            res.status(500).send('An error occurred while rendering the plugin content.');
        }
    } else {
        res.status(404).send(`Plugin ${pluginName} not found.`);
    }
});

export default router;
