import * as vscode from "vscode";
import * as fs from "fs";
import * as cjson from "comment-json";

export function organizeSettings(filePath: string | null) {
  if (!filePath || !fs.existsSync(filePath)) {
    vscode.window.showErrorMessage(`Settings file not found: ${filePath}`);
    return;
  }

  const rawSettings = fs.readFileSync(filePath, "utf-8");
  const settings = cjson.parse(rawSettings);
  const categorizedSettings = categorizeSettings(settings);
  fs.writeFileSync(filePath, cjson.stringify(categorizedSettings, null, 2));

  vscode.window.showInformationMessage(`Settings organized: ${filePath}`);
}

export function categorizeSettings(settings: any) {
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
