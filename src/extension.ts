import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export function activate(context: vscode.ExtensionContext) {
  let settings_organizer_global = vscode.commands.registerCommand(
    "extension.settings-organizer-global",
    () => {
      const platform = os.platform();
      let userSettingsPath = "";

      if (platform === "win32") {
        userSettingsPath = path.join(
          process.env.APPDATA || "",
          "Code",
          "User",
          "settings.json"
        );
      } else if (platform === "darwin") {
        userSettingsPath = path.join(
          process.env.HOME || "",
          "Library",
          "Application Support",
          "Code",
          "User",
          "settings.json"
        );
      } else if (platform === "linux") {
        userSettingsPath = path.join(
          process.env.HOME || "",
          ".config",
          "Code",
          "User",
          "settings.json"
        );
      }

      // Log the path for debugging
      console.log(`Looking for settings.json at: ${userSettingsPath}`);

      if (fs.existsSync(userSettingsPath)) {
        const rawSettings = fs.readFileSync(userSettingsPath, "utf-8");
        const cleanedSettings = preprocessJSON(rawSettings);
        const settings = JSON.parse(cleanedSettings);
        const categorizedSettings = categorizeSettings(settings);
        fs.writeFileSync(
          userSettingsPath,
          JSON.stringify(categorizedSettings, null, 2)
        );
        vscode.window.showInformationMessage("Global settings.json organized!");
      } else {
        vscode.window.showErrorMessage("Global settings.json not found!");
      }
    }
  );

  let settings_organizer_local = vscode.commands.registerCommand(
    "extension.settings-organizer-local",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder is open.");
        return;
      }
      const userSettingsPath = path.join(
        workspaceFolders[0].uri.fsPath,
        ".vscode",
        "settings.json"
      );

      // Log the path for debugging
      console.log(`Looking for settings.json at: ${userSettingsPath}`);

      if (fs.existsSync(userSettingsPath)) {
        const rawSettings = fs.readFileSync(userSettingsPath, "utf-8");
        const cleanedSettings = preprocessJSON(rawSettings);
        const settings = JSON.parse(cleanedSettings);
        const categorizedSettings = categorizeSettings(settings);
        fs.writeFileSync(
          userSettingsPath,
          JSON.stringify(categorizedSettings, null, 2)
        );
        vscode.window.showInformationMessage("Local settings.json organized!");
      } else {
        vscode.window.showErrorMessage("Local settings.json not found!");
      }
    }
  );

  context.subscriptions.push(settings_organizer_global);
  context.subscriptions.push(settings_organizer_local);
}

export function deactivate() {}

function preprocessJSON(jsonString: string): string {
  // Remove comments
  jsonString = jsonString.replace(/\/\/.*$/gm, "");
  // Remove trailing commas
  jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
  return jsonString;
}

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
  categoriesOrder.forEach((category) => {
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
  sortedLanguageSettingsKeys.forEach((key) => {
    sortedSettings[key] = languageSettings[key];
  });

  // Add any miscellaneous settings that don't fit into categories
  for (const key in settings) {
    if (
      !categoriesOrder.some((category) => key.startsWith(category)) &&
      !(key.startsWith("[") && key.endsWith("]"))
    ) {
      sortedSettings[key] = settings[key];
    }
  }

  return sortedSettings;
}
