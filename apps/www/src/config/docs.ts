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
        {
          title: "Concepts",
          href: "/docs/concepts",
        },
      ],
    },
    {
      title: "Guides",
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
