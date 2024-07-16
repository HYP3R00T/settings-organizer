import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.settings-organizer', () => {
        const appData = process.env.APPDATA || process.env.HOME || '';
        const userSettingsPath = path.join(appData, 'Code', 'User', 'settings.json');
        // Log the path for debugging
        console.log(`Looking for settings.json at: ${userSettingsPath}`);

        if (fs.existsSync(userSettingsPath)) {
            const settings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf-8'));
            const categorizedSettings = categorizeSettings(settings);
            fs.writeFileSync(userSettingsPath, JSON.stringify(categorizedSettings, null, 2));
            vscode.window.showInformationMessage('Global settings.json organized!');
        } else {
            vscode.window.showErrorMessage('Global settings.json not found!');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }

function categorizeSettings(settings: any) {
    const sortedSettings: { [key: string]: any } = {};
    const categoriesOrder = [
        "window",
        "workbench",
        "security",
        "explorer",
        "terminal",
        "editor",
        "git",
        "extensions",
        "remote",
    ];

    // Sort settings based on categories
    categoriesOrder.forEach(category => {
        for (const key in settings) {
            if (key.startsWith(category)) {
                sortedSettings[key] = settings[key];
            }
        }
    });

    // Add language-specific settings
    const languageSettings: { [key: string]: any } = {};
    for (const key in settings) {
        if (key.startsWith("[") && key.endsWith("]")) {
            languageSettings[key] = settings[key];
        }
    }

    // Sort language-specific settings alphabetically
    const sortedLanguageSettingsKeys = Object.keys(languageSettings).sort();
    sortedLanguageSettingsKeys.forEach(key => {
        sortedSettings[key] = languageSettings[key];
    });

    // Add any miscellaneous settings that don't fit into categories
    for (const key in settings) {
        if (
            !categoriesOrder.some(category => key.startsWith(category)) &&
            !(key.startsWith("[") && key.endsWith("]"))
        ) {
            sortedSettings[key] = settings[key];
        }
    }

    return sortedSettings;
}
