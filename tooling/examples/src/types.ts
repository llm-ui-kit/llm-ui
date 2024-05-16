export type CommonParams = {
  repoRoot: string;
  examplesFolder: string;
  nextjsVersion: string;
  llmUiVersion: string;
};

export type Example = {
  folder: string;
  exampleName: string;
  description: string;
  generate: (params: CommonParams) => Promise<void>;
};
