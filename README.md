<h1 align="center">Settings Organizer</h1>

<p align="center">
<img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/HYP3R00T/settings-organizer/ci.yml?style=for-the-badge&labelColor=%23363a4f&color=%23b7bdf8">
<img alt="VSCode Marketplace downloads" src="https://img.shields.io/visual-studio-marketplace/i/hyperoot.settings-organizer?style=for-the-badge&labelColor=%23363a4f&color=%23b7bdf8">
</p>

# Settings Organizer for VS Code

The **Settings Organizer** extension for VS Code allows users to efficiently manage and organize their `settings.json` files for different environments. This extension supports:

- **Global Settings** (User-wide configuration)
- **Local Workspace Settings** (`.vscode/settings.json` for individual projects)
- **Manual Selection** (allows entering a custom settings file path)

## Features

- Automatically detects and organizes `settings.json` files.
- Supports multiple environments (Windows, macOS, Linux, WSL2).
- Categorizes settings into logical groups for better readability.
- Provides an interactive command palette menu for easy selection.
- Allows manual path entry for settings files outside the default locations.

## Installation

1. Download and install the extension from the VS Code Marketplace (or manually load it in `extensions` folder).
2. Reload VS Code if necessary.

## Usage

### Command Palette

1. Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P` on macOS).
2. Search for `Settings Organizer` and select it.
3. Choose one of the available options:
   - **Organize Global Settings**: Sorts `settings.json` in the global user folder.
   - **Organize Local Workspace Settings**: Sorts `settings.json` inside the workspace `.vscode` folder.
   - **Manual Path Entry**: If a settings file is not found, you can enter a custom path.

## How It Works

1. Reads the `settings.json` file from the selected environment.
2. Categorizes settings into predefined groups in the following order:
    - `window`: Window management settings
    - `workbench`: UI and layout settings
    - `security`: Security-related configurations
    - `explorer`: File explorer settings
    - `terminal`: Terminal behavior and appearance
    - `editor`: Code editor preferences
    - `git`: Git integration settings
    - `extensions`: Extension-related configurations
    - `remote`: Remote development settings

    Additionally, it separately organizes language-specific settings and miscellaneous settings that do not fall under the predefined categories.
3. Sorts language-specific and miscellaneous settings separately.
4. Saves the organized settings back to the file.

## Supported Platforms

- Windows
- macOS
- Linux
- WSL2

## Contributing

Feel free to submit issues or PRs for improvements!

## License

[MIT License](LICENSE)
