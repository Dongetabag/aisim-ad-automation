import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AISIM_BRAND = {
  name: "AISim",
  tagline: "AI-Powered Marketing Excellence",
  colors: {
    primary: "#10b981",
    secondary: "#34d399",
    accent: "#059669",
    text: "#ffffff",
    textSecondary: "#9ca3af",
    background: "#0a0a0a",
    surface: "#1a1a1a",
    border: "rgba(255, 255, 255, 0.05)",
    gradient: "linear-gradient(135deg, #10b981, #34d399)"
  }
} as const;

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
};

export const generateAdId = (): string => {
  return `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};



