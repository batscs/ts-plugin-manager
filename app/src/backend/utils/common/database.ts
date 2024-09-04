const fs = require('fs');
const path = require('path');

/**
 * Öffnet Datenbankdatei aus dem data-Ordner
 * @param {string} filename Dateiname des JSON-Datei
 * @returns Datei-Inhalt
 */
const openFile = (filename : string) => {
    // Pfad aufgrund unterschiedlicher Slashes bei Ordnerpfaden (Windows vs. Unix) dynamisch aufbauen
    const pathToFile = path.join('data', `${filename}.json`);

    // Datei-Inhalt mit der UTF8-Zeichenkodierung interpretieren
    const options = { encoding: 'utf8' };

    // Datei öffnen
    const filecontent = fs.readFileSync(pathToFile, options);

    return filecontent;
}

export default class db {
    static getUsers = () => {
        return JSON.parse(openFile("users"));
    }
}