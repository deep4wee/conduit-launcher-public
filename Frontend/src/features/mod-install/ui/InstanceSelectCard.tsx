import { Check, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { InstanceDto } from '@/entities/instance';

interface InstanceSelectCardProps {
  instance: InstanceDto;
  isSelected: boolean;
  onSelect: () => void;
}

export function InstanceSelectCard({ instance, isSelected, onSelect }: InstanceSelectCardProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
        isSelected
          ? "border-accent bg-accent/10 shadow-sm"
          : "border-border bg-surfaceHover/30 hover:border-border/80 hover:bg-surfaceHover/60"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border/50 shrink-0 overflow-hidden font-bold text-sm">
          {instance.iconBase64 ? (
            <img src={instance.iconBase64} alt={instance.name} className="w-full h-full object-cover" />
          ) : (
            <Layers className="w-4 h-4 text-secondary" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-primary truncate">{instance.name}</span>
          <div className="flex items-center gap-1.5 text-xs text-secondary mt-0.5">
            <span>{instance.minecraftVersion}</span>
            <span>•</span>
            <span className="capitalize">{instance.loaderType || 'Vanilla'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('mod_install.compatible', 'Compatible')}
        </span>

        <div className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
          isSelected ? "bg-accent border-accent text-[#11111b]" : "border-border text-transparent"
        )}>
          <Check className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
    
