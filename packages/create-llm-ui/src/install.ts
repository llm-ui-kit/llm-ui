import spawn from "cross-spawn";
import type { PackageManager } from "./packageManager";

/**
 * Spawn a package manager installation based on user preference.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export const install = async (
  /** Indicate which package manager to use. */
  packageManager: PackageManager,
  folder: string,
): Promise<void> => {
  /**
   * Return a Promise that resolves once the installation is finished.
   */
  return new Promise((resolve, reject) => {
    /**
     * Spawn the installation process.
     */
    console.log(`\nRunning: ${packageManager} install`);
    const child = spawn(packageManager, ["install"], {
      stdio: "inherit",
      cwd: folder,
      env: {
        ...process.env,
        ADBLOCK: "1",
        // we set NODE_ENV to development as pnpm skips dev
        // dependencies when production
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} install` });
        return;
      }
      resolve();
    });
  });
};
