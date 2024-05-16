import { $, Options } from "execa";

export const shell = (options: Options = {}) => {
  return $({
    stdout: process.stdout,
    stderr: process.stdout,
    verbose: "short",
    ...options,
  });
};
