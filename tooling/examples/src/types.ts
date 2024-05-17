export type CommonParams = {
  repoRoot: string;
  examplesFolder: string;
  nextjsVersion: string;
  viteVersion: string;
  llmUiVersion: string;
};

export type Example = {
  folder: string;
  exampleName: string;
  exampleDescription: string;
  generate: (params: CommonParams) => Promise<void>;
};
