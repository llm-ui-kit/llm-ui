import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatDate = (date: Date) => {
  return format(date, "LLL dd, y");
};

export const extractSegmentURL = (path: string) => {
  if (!path) return "";
  if (path === "/") return null;
  return path.split("/")[1];
};

export const capitalizer = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
