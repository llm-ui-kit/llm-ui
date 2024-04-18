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
      title: "Blocks",
      items: [
        {
          title: "Markdown",
          href: "/docs/blocks/markdown",
        },
        {
          title: "Code",
          href: "/docs/blocks/code",
        },
        {
          title: "Buttons",
          href: "/docs/blocks/buttons",
        },
        {
          title: "Custom blocks",
          href: "/docs/blocks/custom-blocks",
        },
      ],
    },
    {
      title: "useLlmOutput hook",
      items: [
        {
          title: "useLlmOutput",
          href: "/docs/useLlmOutput",
        },
        {
          title: "Throttle functions",
          href: "/docs/throttling",
        },
      ],
    },
  ],
};
