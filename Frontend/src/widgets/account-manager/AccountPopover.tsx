import { useState, useRef } from 'react';
import { User, Key, Globe, Trash2, Plus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/entities/account/model/accountStore';
import { AccountProfile } from '@/entities/account/api/accountApi';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutside';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';

interface AccountPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (type: 'Offline' | 'Microsoft' | 'Modrinth') => void;
}

export function AccountPopover({ isOpen, onClose, onAddAccount }: AccountPopoverProps) {
  const { accounts, activeAccountId, setActiveAccount, deleteAccount } = useAccountStore();
  const [showProviders, setShowProviders] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useClickOutside(popoverRef, () => {
    if (isOpen) {
      onClose();
      setShowProviders(false);
    }
  });

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="absolute bottom-full mb-2 left-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex flex-col max-h-[300px]">
        {/* Account List */}
        <div className="overflow-y-auto p-2 flex flex-col gap-1">
          {accounts.length === 0 ? (
            <div className="text-center p-3 text-secondary text-sm">{t('account.noAccounts', 'No accounts')}</div>
          ) : (
            accounts.map((acc: AccountProfile) => {
              const isActive = acc.id === activeAccountId;
              return (
                <div 
                  key={acc.id}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                    isActive ? "bg-accent/15 border border-accent/30" : "hover:bg-surfaceHover border border-transparent"
                  )}
                  onClick={() => {
                    setActiveAccount(acc.id);
                    onClose();
                  }}
                >
            
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 rounded-md bg-black/40 flex items-center justify-center relative border border-transparent group-hover:border-accent/30 transition-colors">
                    {acc.type === 'Microsoft' ? <Globe className="w-5 h-5 text-blue-400" /> : 
                     acc.type === 'Modrinth' ? <Key className="w-5 h-5 text-green-400" /> :
                     <User className="w-5 h-5 text-gray-400" />}
                  </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-primary truncate">{acc.username}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                    </div>
                    <span className="text-xs text-secondary truncate">{acc.type}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAccount(acc.id);
                  }}
                  className="p-2 shrink-0 text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all outline-none"
                  title={t('account.delete', 'Delete account')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );})
          )}
        </div>
            

        {/* Add Account Section */}
        <div className="p-2 border-t border-border bg-surfaceHover/30">
          {showProviders ? (
            <div className="flex items-center justify-around gap-1 px-1 h-10">
              <button 
                onClick={() => { onAddAccount('Offline'); onClose(); setShowProviders(false); }}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surfaceHover text-secondary hover:text-primary transition-colors outline-none"
                title={t('account.offline', 'Offline')}
              >
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { onAddAccount('Microsoft'); onClose(); setShowProviders(false); }}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surfaceHover text-secondary hover:text-primary transition-colors outline-none"
                title="Microsoft"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { onAddAccount('Modrinth'); onClose(); setShowProviders(false); }}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surfaceHover text-secondary hover:text-primary transition-colors outline-none"
                title="Modrinth"
              >
                <Key className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button 
              variant="secondary" 
              className="w-full flex items-center justify-center gap-2 border border-border bg-surface"
              onClick={() => setShowProviders(true)}
            >
              <Plus className="w-4 h-4" /> {t('account.add', 'Add account')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
