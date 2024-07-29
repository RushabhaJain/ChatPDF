import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  console.log(window);
  if (process && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`
  } else if (process) {
    `http://localhost:${process.env.PORT ?? 3000}${path}`
  } else {
    return path;
  }
}
