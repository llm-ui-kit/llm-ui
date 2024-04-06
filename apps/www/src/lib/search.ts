export type Pagefind = {
  search: (query: string) => Promise<PagefindResponse>;
  debouncedSearch: (query: string) => Promise<PagefindResponse>;
};

export type PagefindResponse = {
  results: PagefindResult[];
};

export type PagefindResult = {
  id: string;
  score: number;
  words: number[];
  data: () => Promise<PagefindDocument>;
};

export type PagefindResultWithData = Omit<PagefindResult, "data"> & {
  data: PagefindDocument;
};

type Anchor = {
  element: string;
  id: string;
  location: number;
  text: string;
};

export type PagefindDocument = {
  url: string;
  raw_url: string;
  excerpt: string;
  content: string;
  raw_content: string;
  anchors: Anchor[];
  meta: { title: string; image: string; image_alt: string };
  sub_results: { title: string; url: string; excerpt: string }[];
};

declare global {
  interface Window {
    pagefind: Pagefind;
  }
}

const loadPagefind = async (): Promise<Pagefind> => {
  const url = new URL("/pagefind/pagefind.js", import.meta.url).href;
  return await import(/* @vite-ignore */ url);
};

export const search = async (searchQuery: string) => {
  const pagefind = await loadPagefind();
  return await pagefind.debouncedSearch(searchQuery);
};
