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
    private logs: string[] = [];

    private PERMISSION_ACCESS = `${this.name}:access`;
    private PERMISSION_CONFIGURE = `${this.name}:configure`;

    constructor() {
        this.dbPath = path.join(__dirname, 'numbers.json');
    }

    initialize(): void {
        this.addLog(`${this.name}: initializing.`);
        // Create an empty JSON database if it does not exist

        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({ numbers: [] }));
            this.addLog(`${this.name}: created empty JSON Database (numbers.json).`);
        } else {
            this.addLog(`${this.name}: JSON Database (numbers.json) already exists.`);
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

            this.addLog(`${this.name}: started python process.`);
        } else {
            this.addLog(`${this.name}: attempted to start but python process already running.`);
        }

        this.running = true;
    }

    stop(): void {
        if (this.pythonProcess) {
            console.log(`${this.name} stopped.`);
            this.pythonProcess.kill();  // Terminate the Python script
            this.pythonProcess = null;
            this.addLog(`${this.name}: stopped python process.`);
        } else {
            this.addLog(`${this.name}: attempted to stop but python process already stopped.`);
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
                res.send("no permissions");
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
        return [this.PERMISSION_CONFIGURE, this.PERMISSION_ACCESS];
    }

    getState(): string {
        return this.running ? "running" : "stopped";
    }

    getLogs(): string[] {
        return this.logs;
    }

    addLog(log: string): void {
        this.logs.push(log);
    }

    isAccessible(permissions: Permissions): boolean {
        return permissions.hasPermission(this.PERMISSION_ACCESS);
    }

    isConfigurable(permissions: Permissions): boolean {
        return permissions.hasPermission(this.PERMISSION_CONFIGURE);
    }
}

export default new RandomNumberPlugin();
