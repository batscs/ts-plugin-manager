const fs = require('fs');
const path = require('path');
import {User} from "../../types/database";


/**
 * Öffnet Datenbankdatei aus dem data-Ordner
 * @param {string} filename Dateiname des JSON-Datei
 * @returns Datei-Inhalt
 */
const openFile = (filename : string): string => {
    // Pfad aufgrund unterschiedlicher Slashes bei Ordnerpfaden (Windows vs. Unix) dynamisch aufbauen
    const pathToFile = path.join('data', `${filename}.json`);

    // Datei-Inhalt mit der UTF8-Zeichenkodierung interpretieren
    const options = { encoding: 'utf8' };

    // Datei öffnen
    const filecontent = fs.readFileSync(pathToFile, options);

    return filecontent;
}

const writeFile = (filename : string, data: string): void => {
    try {
        const pathToFile = path.join('data', `${filename}.json`);
        fs.writeFileSync(pathToFile, data, { encoding: 'utf8' });
    } catch (error) {
        console.error(`Error writing file ${filename}.json:`, error);
    }
}

export default class db {

    static getUsers = (): User[] => {
        // TODO Abfangen falls users.json nicht existiert, dann einfach []
        return JSON.parse(openFile("users"));
    }

    static saveUsers(users: User[]) {
        writeFile("users", JSON.stringify(users));
    }
}