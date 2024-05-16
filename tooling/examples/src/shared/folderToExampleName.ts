export const folderToExampleName = (folder: string) => {
  return `llm-ui-${folder.split("/").join("-")}-example`;
};
