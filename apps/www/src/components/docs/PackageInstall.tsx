import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { CodeBlock } from "../ui/custom/CodeBlock";

type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

const installCommand = (packageManager: PackageManager, packages: string[]) => {
  const packageString = packages.join(" ");
  switch (packageManager) {
    case "pnpm":
      return `pnpm add ${packageString}`;
    case "npm":
      return `npm install ${packageString}`;
    case "yarn":
      return `yarn add ${packageString}`;
    case "bun":
      return `bun add ${packageString}`;
  }
};

const PackageInstallCodeBlock: React.FC<{
  packageManager: string;
  packages: string[];
}> = ({ packageManager, packages }) => {
  return (
    <CodeBlock
      className="mt-2"
      code={installCommand(packageManager as PackageManager, packages)}
      codeToHtmlOptions={{ lang: "shell" }}
    />
  );
};

export const PackageInstall: React.FC<{ packages: string[] }> = ({
  packages,
}) => {
  return (
    <Tabs defaultValue="pnpm" className="flex flex-col items-start my-6">
      <TabsList className="flex flex-row">
        <TabsTrigger value="pnpm">pnpm</TabsTrigger>
        <TabsTrigger value="npm">npm</TabsTrigger>
        <TabsTrigger value="yarn">yarn</TabsTrigger>
        <TabsTrigger value="bun">bun</TabsTrigger>
      </TabsList>
      <div className="max-w-full">
        <TabsContent value="pnpm">
          <PackageInstallCodeBlock packageManager="pnpm" packages={packages} />
        </TabsContent>
        <TabsContent value="npm">
          <PackageInstallCodeBlock packageManager="npm" packages={packages} />
        </TabsContent>
        <TabsContent value="yarn">
          <PackageInstallCodeBlock packageManager="yarn" packages={packages} />
        </TabsContent>
        <TabsContent value="bun">
          <PackageInstallCodeBlock packageManager="bun" packages={packages} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
