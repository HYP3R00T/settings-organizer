import * as vscode from 'vscode';
import {
  getSettingsPath,
  getLocalSettingsPath,
  getManualPath,
} from '@/utils/fileFinder';
import { organizeSettings } from './utils/organizer';

export function activate(context: vscode.ExtensionContext) {
  let settingsOrganizer = vscode.commands.registerCommand(
    'extension.settings-organizer',
    async () => {
      const option = await vscode.window.showQuickPick(
        [
          'Organize Global Settings',
          'Organize Local Workspace Settings',
          'Manual Path Entry',
        ],
        {
          placeHolder: 'Select an option',
        },
      );

      if (!option) {
        return;
      }

      switch (option) {
        case 'Organize Global Settings':
          organizeSettings(await getSettingsPath());
          break;
        case 'Organize Local Workspace Settings':
          organizeSettings(await getLocalSettingsPath());
          break;
        case 'Manual Path Entry':
          organizeSettings(await getManualPath());
          break;
      }
    },
  );

  context.subscriptions.push(settingsOrganizer);
}

export function deactivate() {}
