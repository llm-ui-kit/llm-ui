import prettierConfig from "./.prettierrc.precommit.mjs";

/** @type {import("prettier").Config} */
export default {
  ...prettierConfig,
  organizeImportsSkipDestructiveCodeActions: true,
};
