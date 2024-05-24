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
      title: "Core",
      items: [
        { title: "LLM output hook", href: "/docs/llm-output-hook" },
        {
          title: "Markdown component",
          href: "/docs/blocks/markdown",
        },
        {
          title: "Code component",
          href: "/docs/blocks/code",
        },
        {
          title: "Custom components",
          href: "/docs/custom-block",
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
        {
          title: "Throttle functions",
          href: "/docs/advanced/throttle-functions",
        },
        { title: "Example hooks", href: "/docs/advanced/example-hooks" },
      ],
    },
  ],
};
