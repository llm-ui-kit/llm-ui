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
          title: "Markdown block",
          href: "/docs/blocks/markdown",
        },
        {
          title: "Code block",
          href: "/docs/blocks/code",
        },
        {
          title: "Buttons block",
          href: "/docs/blocks/buttons",
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
          title: "Custom blocks",
          href: "/docs/advanced/custom-blocks",
        },
        {
          title: "Throttle functions",
          href: "/docs/advanced/throttle-functions",
        },
        { title: "Example hooks", href: "/docs/advanced/example-hooks" },
      ],
    },
  ],
};
