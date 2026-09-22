import { useState } from 'react';
import { X, User, Globe, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/entities/account/model/accountStore';
import { Button } from '@/shared/ui/Button';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  addType: 'Offline' | 'Microsoft' | 'Modrinth' | null;
}

export function AddAccountModal({ isOpen, onClose, addType }: AddAccountModalProps) {
  const { addOfflineAccount, addMicrosoftAccount, addModrinthAccount, isLoading } = useAccountStore();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');

  if (!isOpen || !addType) return null;

  const handleAddAccount = async () => {
    if (addType === 'Offline') {
      await addOfflineAccount(username);
    } else if (addType === 'Microsoft') {
      await addMicrosoftAccount();
    } else if (addType === 'Modrinth') {
      await addModrinthAccount(username, token);
    }
    setUsername('');
    setToken('');
    onClose();
  };

  const getIcon = () => {
    switch (addType) {
      case 'Microsoft': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'Modrinth': return <Key className="w-5 h-5 text-green-400" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surfaceHover/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
              {getIcon()}
            </div>
            <h2 className="text-lg font-bold text-primary">{t('account.add_type', { type: addType, defaultValue: `Add ${addType}` })}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface transition-colors outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {addType === 'Microsoft' ? (
            <div className="text-sm text-secondary">
              {t('account.microsoftAuthDesc', 'Click Add to open the Microsoft authentication browser window. Log in to your Xbox account.')}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-secondary">{t('account.username', 'Nickname')}</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && username) handleAddAccount(); }}
                  className="bg-surfaceHover border border-border rounded-lg px-3 py-2 text-primary outline-none focus:border-accent"
                  placeholder={t('account.enterUsername', 'Enter nickname')}
                  autoFocus
                />
              </div>

              {addType === 'Modrinth' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-secondary">
                    {t('account.apiKey', 'API Key')}
                  </label>
                  <input 
                    type="password" 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-surfaceHover border border-border rounded-lg px-3 py-2 text-primary outline-none focus:border-accent"
                    placeholder={t('account.enterToken', 'Enter token/key')}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('common.cancel', 'Cancel')}</Button>
            <Button variant="primary" onClick={handleAddAccount} disabled={isLoading || (addType !== 'Microsoft' && !username)}>
              {isLoading ? (addType === 'Microsoft' ? 'Logging in...' : 'Adding...') : t('common.add', 'Add')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
