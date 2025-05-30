import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setCookieWithEvent = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) => {
  Cookies.set(name, value, options);
  const event = new CustomEvent("cookieChange", { detail: { name, value } });
  if (typeof window !== "undefined") {
    window.dispatchEvent(event);
  }
};

export const unslugify = (slug: string): string => {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces
    .trim() // Trim leading/trailing whitespace
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
