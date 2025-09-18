import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Função utilitária para obter data atual no formato YYYY-MM-DD de forma segura
 */
export function getCurrentDateString(): string {
  try {
    const now = new Date();
    const isoString = now.toISOString();
    if (isoString && typeof isoString === 'string') {
      return isoString.split('T')[0];
    }
    // Fallback manual se toISOString() falhar
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error getting current date:', error);
    // Fallback para data atual se tudo falhar
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Função utilitária para converter Date para string YYYY-MM-DD de forma segura
 */
export function dateToString(date: Date): string {
  try {
    const isoString = date.toISOString();
    if (isoString && typeof isoString === 'string') {
      return isoString.split('T')[0];
    }
    // Fallback manual se toISOString() falhar
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting date to string:', error);
    // Fallback para data atual se tudo falhar
    return getCurrentDateString();
  }
}
