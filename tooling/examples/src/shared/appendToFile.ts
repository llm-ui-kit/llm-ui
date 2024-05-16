import fs from "fs/promises";

export const appendToFile = async (filePath: string, content: string) => {
  const fileContent = await fs.readFile(filePath, "utf8");
  const newContents = `${fileContent}\n${content}`;
  await fs.writeFile(filePath, newContents);
};
