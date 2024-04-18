import type { DocsConfig } from "@/types";

export const docsConfig: DocsConfig = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs/introduction",
        },
        {
          title: "Quick start",
          href: "/docs/quick-start",
        },
      ],
    },
    {
      title: "LLMOutput",
      items: [
        {
          title: "Concepts",
          href: "/docs/concepts",
        },
        {
          title: "Throttle functions",
          href: "/docs/throttling",
        },
      ],
    },
    {
      title: "Blocks (components)",
      items: [
        {
          title: "Markdown",
          href: "/docs/blocks/markdown",
        },
        {
          title: "Code blocks",
          href: "/docs/blocks/code-blocks",
        },
        {
          title: "Buttons",
          href: "/docs/blocks/buttons",
        },
        {
          title: "Custom blocks",
          href: "/docs/custom-blocks",
        },
      ],
    },
  ],
};
