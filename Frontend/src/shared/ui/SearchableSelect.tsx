import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../lib/hooks/useClickOutside';
import { cn } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchable = true, 
  disabled = false,
  loading = false,
  className
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!isOpen) {
      setSearch('');
    }
  }, [isOpen, searchable]);

  const displayPlaceholder = placeholder || t('common.select', 'Оберіть...');

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-surface border rounded-xl px-4 py-2.5 text-sm font-medium transition-colors outline-none",
          (disabled || loading) ? "opacity-50 cursor-not-allowed border-transparent" : "border-border hover:border-accent/50 focus:border-accent cursor-pointer hover:bg-surfaceHover"
        )}
      >
        <span className={selectedOption ? 'text-primary' : 'text-secondary'}>
          {loading ? t('common.loading', 'Завантаження...') : selectedOption ? selectedOption.label : displayPlaceholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {searchable && (
            <div className="flex items-center gap-2 p-3 border-b border-border bg-surfaceHover/30">
              <Search className="w-4 h-4 text-secondary shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('common.search', 'Пошук...')}
                className="w-full bg-transparent text-sm text-primary outline-none"
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-secondary text-sm">{t('common.noResults', 'Нічого не знайдено')}</div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    option.value === value ? "bg-accent/10 text-accent font-semibold" : "text-primary hover:bg-surfaceHover"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    {option.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-black/20 text-secondary">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.value === value && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
