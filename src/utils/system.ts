import * as fs from "fs";
import * as os from "os";

export function detectPlatform(): string {
  const platform = os.platform();

  if (platform === "linux") {
    try {
      const version = fs.readFileSync("/proc/version", "utf-8").toLowerCase();
      if (version.includes("microsoft") && version.includes("wsl2")) {
        return "wsl2";
      } else if (version.includes("microsoft")) {
        return "wsl1";
      }
    } catch (error) {
      console.error("Error reading /proc/version:", error);
    }
  }

  return platform;
}

export function getWindowsUsername(): string | null {
  try {
    const mntCUsers = "/mnt/c/Users";
    if (fs.existsSync(mntCUsers)) {
      const users = fs.readdirSync(mntCUsers);
      // Find the first non-default user (ignoring Public, Default, etc.)
      for (const user of users) {
        if (
          user !== "Public" &&
          user !== "Default" &&
          user !== "Default User" &&
          user !== "All Users" &&
          user !== "desktop.ini"
        ) {
          return user; // Return the first valid username
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving Windows username:", error);
  }
  return null;
}
