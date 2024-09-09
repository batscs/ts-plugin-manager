// src/server.ts

import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import less from 'less-middleware';
import path from "path";

import router_web from './routes/web';
import router_api from './routes/api';
import router_html from './routes/html';
import logger from './middleware/logger';

import manager from "../utils/scaling/manager";
import { permissionParser } from './middleware/permission-parser';

const app = express();
const port = 3000;

// Less Stylesheet
const lessSrcPath = path.join(__dirname, '../../frontend/less');
const cssDestPath = path.join(__dirname, '../../frontend/css');
// Use less-middleware to compile LESS files to CSS
app.use('/static/css', less(lessSrcPath, {
    dest: cssDestPath,
    force: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(permissionParser);

app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, '../../frontend/pug'));
app.set('view engine', 'pug');

app.use('/static/css', express.static(path.join(__dirname, "../../frontend/css")));
app.use('/static/js', express.static(path.join(__dirname, "../../frontend/js")));
app.use('/static/', express.static(path.join(__dirname, "../../../static")));

app.use(logger);

app.use(router_web);
app.use(router_api);
app.use(router_html);

manager.loadPlugins(app);
manager.loadPlugins(app);

manager.startPlugins();

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
