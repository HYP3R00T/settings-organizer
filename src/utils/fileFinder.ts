import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { detectPlatform, getWindowsUsername } from './system';

export async function getSettingsPath(): Promise<string | null> {
  let defaultPath = getUserSettingsPath();

  if (defaultPath && fs.existsSync(defaultPath)) {
    return defaultPath;
  } else {
    return null;
  }
}

export async function getLocalSettingsPath(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder is open.');
    return null;
  }
  const userSettingsPath = path.join(
    workspaceFolders[0].uri.fsPath,
    '.vscode',
    'settings.json',
  );
  return userSettingsPath;
}

export async function getManualPath(): Promise<string | null> {
  let path: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    canSelectFolders: false,
    filters: {
      'JSON files': ['json'],
      'All files': ['*']
    },
    openLabel: 'Select settings.json file'
  });

  if (path) {
    return path[0].fsPath;
  }

  return null;
}

function isInsidersVersion() {
  return vscode.version.includes('-insider');
}

function isPortableMode() {
  if (process.env.VSCODE_PORTABLE) {
    return path.join(
      process.env.VSCODE_PORTABLE,
      'user-data',
      'User',
      'settings.json',
    );
  }
  return null;
}

function getUserSettingsPath() {
  const platform = detectPlatform();
  const portablePath = isPortableMode();

  let userSettingsPath = '';
  if (platform === 'win32') {
    if (portablePath) {
      userSettingsPath = portablePath;
    } else {
      userSettingsPath = path.join(
        process.env.APPDATA || '',
        isInsidersVersion() ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    }
  } else if (platform === 'darwin') {
    if (portablePath) {
      userSettingsPath = portablePath;
    } else {
      userSettingsPath = path.join(
        process.env.HOME || '',
        'Library',
        'Application Support',
        isInsidersVersion() ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    }
  } else if (platform === 'wsl2') {
    const windowsUsername = getWindowsUsername();
    if (windowsUsername) {
      if (portablePath) {
        userSettingsPath = portablePath;
      } else {
        userSettingsPath = path.join(
          '/mnt/c/Users',
          windowsUsername,
          isInsidersVersion()
            ? 'AppData/Roaming/Code - Insiders/User/settings.json'
            : 'AppData/Roaming/Code/User/settings.json',
        );
      }
    }
  } else if (platform === 'linux') {
    if (portablePath) {
      userSettingsPath = portablePath;
    } else {
      userSettingsPath = path.join(
        process.env.HOME || '',
        '.config',
        isInsidersVersion() ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    }
  }

  return userSettingsPath;
}
