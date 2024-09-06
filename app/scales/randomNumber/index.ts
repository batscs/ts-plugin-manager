import { Plugin } from '../../src/backend/utils/scaling/scaleAPI';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore
import pug from "pug";
import {Request, Response, Router} from 'express';
import Permissions from "../../src/backend/utils/common/permission";

class RandomNumberPlugin implements Plugin {
    name: string = 'rNums';
    version: string = '1.0.0';
    running: boolean = false;

    private pythonProcess: ChildProcess | null = null;
    private readonly dbPath: string;

    private PERMISSION_ACCESS = `${this.name}:access`;

    constructor() {
        this.dbPath = path.join(__dirname, 'numbers.json');
    }

    initialize(): void {
        console.log(`${this.name} initialized.`);

        // Create an empty JSON database if it does not exist
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({ numbers: [] }));
            console.log(`${this.name}: Created empty JSON database.`);
        }
    }

    start(): void {
        if (!this.pythonProcess) {
            // Join the current directory with the script path to ensure correct execution
            const scriptPath = path.join(__dirname, 'core.py');

            // Spawn a child process to run the python script
            this.pythonProcess = spawn('python3', [scriptPath], {
                cwd: __dirname // Current working directory where the script should run
            });

        }

        this.running = true;
    }

    stop(): void {
        if (this.pythonProcess) {
            console.log(`${this.name} stopped.`);
            this.pythonProcess.kill();  // Terminate the Python script
            this.pythonProcess = null;
        }

        this.running = false;
    }

    registerEndpoints(router: Router): void {

        router.get('/', (req, res) => {
            const pugFilePath = path.join(__dirname, 'content.pug');
            const compiledFunction = pug.compileFile(pugFilePath);

            const perms : Permissions = req.permission;
            if (perms.hasPermission(this.PERMISSION_ACCESS)) {
                res.render('plugin', { pluginContent: compiledFunction() });
            } else {
                res.send("no perms");
            }

        });

        router.get('/data', (req, res) => {
            try {
                const data = fs.readFileSync(this.dbPath, 'utf-8');
                res.json(JSON.parse(data));
            } catch (error) {
                console.error(`Error reading the database file: ${error}`);
                res.status(500).send('Failed to read data.');
            }
        });

    }

    getPermissions(): string[] {
        return ["rnum:view", "rnum:access"];
    }

    isAccessible(permissions: Permissions): boolean {
        return permissions.hasPermission(this.PERMISSION_ACCESS);
    }

    getState(): string {
        return this.running ? "running" : "stopped";
    }
}

export default new RandomNumberPlugin();
