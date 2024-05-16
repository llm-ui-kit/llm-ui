export type CommonParams = {
  repoRoot: string;
  nextjsVersion: string;
  llmUiVersion: string;
};

export type Example = {
  folder: string;
  exampleName: string;
  dependencies: string[];
  devDependencies: string[];
};
