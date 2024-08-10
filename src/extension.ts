import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as cjson from "comment-json";

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
        const settings = cjson.parse(rawSettings);
        console.log(settings);
        const categorizedSettings = categorizeSettings(settings);
        fs.writeFileSync(
          userSettingsPath,
          cjson.stringify(categorizedSettings, null, 2)
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
        const settings = cjson.parse(rawSettings);
        console.log(settings);
        const categorizedSettings = categorizeSettings(settings);
        fs.writeFileSync(
          userSettingsPath,
          cjson.stringify(categorizedSettings, null, 2)
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

  // Helper function to recursively sort objects
  function sortObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sortObject);
    }

    const sorted: { [key: string]: any } = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObject(obj[key]);
      });

    return sorted;
  }

  // Sort settings based on categories
  categoriesOrder.forEach((category) => {
    for (const key in settings) {
      if (key.startsWith(category)) {
        sortedSettings[key] = sortObject(settings[key]);
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

  // Sort language-specific settings alphabetically and their nested objects
  const sortedLanguageSettingsKeys = Object.keys(languageSettings).sort();
  sortedLanguageSettingsKeys.forEach((key) => {
    sortedSettings[key] = sortObject(languageSettings[key]);
  });

  // Add any miscellaneous settings that don't fit into categories
  const miscellaneousSettings: { [key: string]: any } = {};
  for (const key in settings) {
    if (
      !categoriesOrder.some((category) => key.startsWith(category)) &&
      !(key.startsWith("[") && key.endsWith("]"))
    ) {
      miscellaneousSettings[key] = settings[key];
    }
  }

  // Sort miscellaneous settings alphabetically
  const sortedMiscellaneousKeys = Object.keys(miscellaneousSettings).sort();
  sortedMiscellaneousKeys.forEach((key) => {
    sortedSettings[key] = miscellaneousSettings[key];
  });

  return sortedSettings;
}
