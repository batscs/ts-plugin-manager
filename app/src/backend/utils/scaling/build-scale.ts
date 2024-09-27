import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pathToFileURL } from 'url';  // Import URL utility

const rootDir = process.cwd();

// Take the directory name from command line arguments
const pluginDir = process.argv[2];
if (!pluginDir) {
    console.error("Error: Please specify a plugin directory like 'scales/example-plugin'.");
    process.exit(1);
}

// Resolve the plugin's index.ts path
const pluginPath = path.join(rootDir, pluginDir, 'index.ts');

// Ensure the index.ts exists
if (!fs.existsSync(pluginPath)) {
    console.error(`Error: index.ts not found in ${pluginDir}`);
    process.exit(1);
}

// Dynamically import the plugin's index.ts to extract metadata
(async () => {
    try {
        // Convert the path to a file:// URL (important for ESM)
        const pluginURL = pathToFileURL(pluginPath).href;

        // Import the module dynamically
        const plugin = await import(pluginURL);  // Import using file URL

        // Get plugin name and version from the exports in index.ts
        const pluginName: string = plugin.name || 'unknown';
        const pluginVersion: string = plugin.version || '0.0.1';

        // Construct the output file name and path
        const outputFileName = `${pluginName}_${pluginVersion}.scale.zip`;
        const outputPath = path.join(__dirname, 'dist', outputFileName);

        // Ensure dist directory exists
        if (!fs.existsSync(path.join(__dirname, 'dist'))) {
            fs.mkdirSync(path.join(__dirname, 'dist'));
        }

        // Create output stream for the zip file
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`Plugin ${pluginName} version ${pluginVersion} has been packaged: ${outputPath} (${archive.pointer()} total bytes)`);
        });

        output.on('end', () => {
            console.log('Data has been drained');
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Warning:', err.message);
            } else {
                throw err;
            }
        });

        archive.on('error', (err) => {
            throw err;
        });

        // Pipe the archive data to the file
        archive.pipe(output);

        // Add the plugin files to the archive
        archive.directory(pluginDir, pluginName);

        // Finalize the archive
        await archive.finalize();

    } catch (error) {
        console.error(`Error generating or packaging the plugin from ${pluginDir}:`, error);
    }
})();
