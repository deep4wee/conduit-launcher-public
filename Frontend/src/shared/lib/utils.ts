import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTagBadgeStyle(tag: string): string {
    const t = tag.toLowerCase();
    if (t === 'fabric') return "bg-[#D4C4A1]/10 text-[#D4C4A1] border-[#D4C4A1]/20";
    if (t === 'forge') return "bg-[#dfa86a]/10 text-[#dfa86a] border-[#dfa86a]/20";
    if (t === 'neoforge') return "bg-[#f16436]/10 text-[#f16436] border-[#f16436]/20";
    if (t === 'quilt') return "bg-[#8b50d4]/10 text-[#8b50d4] border-[#8b50d4]/20";
    if (t === 'client' || t === 'server' || t === 'required') return "bg-green-500/10 text-green-500 border-green-500/20";
    if (t === 'optional') return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (t === 'incompatible') return "bg-red-500/10 text-red-500 border-red-500/20";
    
    return "bg-background border-border text-secondary";
}
            
    