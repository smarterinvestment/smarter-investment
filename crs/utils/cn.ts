// ============================================
// 🎨 CLASS NAME UTILITY
// Combines clsx and tailwind-merge
// ============================================
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
