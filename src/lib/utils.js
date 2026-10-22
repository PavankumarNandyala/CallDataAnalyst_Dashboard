import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class names safely (used by every shadcn component)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
