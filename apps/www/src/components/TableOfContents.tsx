import * as React from "react";

import type { TableOfContents } from "@/lib/tableOfContents";
import { cn } from "@/lib/utils";

interface TocProps {
  toc: TableOfContents;
}
export const DashboardTableOfContents = ({ toc }: TocProps) => {
  const itemIds = toc.items
    ? toc.items
        .flatMap((item) => [item.url, item?.items?.map((item) => item.url)])
        .flat()
        .filter(Boolean)
        .map((id) => id?.split("#")[1])
    : [];
  const activeHeading = useActiveItem(itemIds);

  if (!toc?.items) {
    return null;
  }
  return (
    <div className="space-y-2">
      <p className="font-medium">On This Page</p>
      <Tree tree={toc} activeItem={activeHeading} />
    </div>
  );
};

const useActiveItem = (itemIds: (string | undefined)[]) => {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: `0% 0% -80% 0%` },
    );

    itemIds?.forEach((id) => {
      if (!id) {
        return;
      }

      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      itemIds?.forEach((id) => {
        if (!id) {
          return;
        }

        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [itemIds]);

  return activeId;
};

interface TreeProps {
  tree: TableOfContents;
  level?: number;
  activeItem?: string | null;
}

const Tree = ({ tree, level = 1, activeItem }: TreeProps) => {
  return tree?.items?.length && level < 3 ? (
    <ul className={cn("m-0 list-none", { "pl-4": level !== 1 })}>
      {tree.items.map((item, index) => {
        return (
          <li key={index} className={cn("mt-0 pt-2")}>
            <a
              href={item.url}
              className={cn(
                "inline-block no-underline",
                item.url === `#${activeItem}`
                  ? "text-primary font-medium"
                  : "text-muted-foreground text-sm",
              )}
            >
              {item.title}
            </a>
            {item.items?.length ? (
              <Tree tree={item} level={level + 1} activeItem={activeItem} />
            ) : null}
          </li>
        );
      })}
    </ul>
  ) : null;
};
