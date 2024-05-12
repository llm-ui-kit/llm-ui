import { Button } from "@/components/ui/Button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { search, type PagefindResultWithData } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { DialogProps } from "@radix-ui/react-alert-dialog";
import { FileIcon } from "lucide-react";
import * as React from "react";

type CommandMenuProps = DialogProps;

const defaultSearchResults: PagefindResultWithData[] = [
  {
    id: "quick-start",
    data: {
      meta: { title: "Quick start" },
      url: "/docs/quick-start",
    },
  },
  {
    id: "concepts",
    data: {
      meta: { title: "Concepts" },
      url: "/docs/concepts",
    },
  },
  {
    id: "markdown",
    data: {
      meta: { title: "Markdown block" },
      url: "/docs/blocks/markdown",
    },
  },
  {
    id: "code",
    data: {
      meta: { title: "Code block" },
      url: "/docs/blocks/code",
    },
  },
] as PagefindResultWithData[];

export const CommandMenu = ({ ...props }: CommandMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<
    PagefindResultWithData[] | undefined
  >(defaultSearchResults);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setIsOpen((prevIsValue) => !prevIsValue);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setIsOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        {...props}
        className={cn(
          "relative h-10 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-64",
        )}
        onClick={() => setIsOpen(true)}
      >
        <span className="inline-flex">Search docs...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.6rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        // We do our own filtering with pagefind
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder="Search docs..."
          onValueChange={async (searchQuery) => {
            if (!searchQuery) {
              setSearchResults(undefined);
              return;
            }
            const searchResponse = await search(searchQuery);
            if (searchResponse) {
              const results = await Promise.all(
                searchResponse.results.map(async (result) => ({
                  ...result,
                  data: await result.data(),
                })),
              );
              setSearchResults(results);
            }
          }}
        />
        <CommandList>
          <CommandEmpty>{"No results found."}</CommandEmpty>
          {searchResults && searchResults.length > 0 && (
            <CommandGroup heading="Docs">
              {searchResults.map((result) => {
                return (
                  <CommandItem
                    key={result.id}
                    value={result.data.meta.title}
                    onSelect={() => {
                      runCommand(
                        () =>
                          (window.location.href = result.data.url as string),
                      );
                    }}
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    {result.data.meta.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
