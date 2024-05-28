import type { DocsConfig } from "@/types";

export const docsConfig: DocsConfig = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Quick start",
          href: "/docs/quick-start",
        },
        {
          title: "Concepts",
          href: "/docs/concepts",
        },
      ],
    },
    {
      title: "Built-in blocks",
      items: [
        {
          title: "Markdown block",
          href: "/docs/blocks/markdown",
        },
        {
          title: "Code block",
          href: "/docs/blocks/code",
        },
      ],
    },
    {
      title: "Custom components",
      items: [
        {
          title: "Introduction",
          href: "/docs/custom-blocks",
        },
        {
          title: "JSON block",
          href: "/docs/blocks/json",
        },
        {
          title: "CSV block",
          href: "/docs/blocks/csv",
        },
      ],
    },
    {
      title: "Guides",
      items: [
        {
          title: "Examples",
          href: "/docs/examples",
        },
      ],
    },
    {
      title: "Advanced",
      items: [
        { title: "LLM output hook", href: "/docs/llm-output-hook" },
        {
          title: "Throttle functions",
          href: "/docs/advanced/throttle-functions",
        },
        { title: "Example hooks", href: "/docs/advanced/example-hooks" },
      ],
    },
  ],
};
