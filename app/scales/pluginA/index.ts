import { Plugin } from '../../src/backend/utils/scales/api';

export class PluginA implements Plugin {
    name: string = "testA";
    version: string = "1.0";

    initialize(): void {
        console.log('PluginA: initialized');
    }

    start(): void {
        console.log('PluginA: started');
    }

    stop(): void {
        console.log('PluginA: stopped');
    }
}

export default new PluginA();
