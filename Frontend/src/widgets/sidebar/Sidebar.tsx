import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Globe, Layers, Server, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { useUiStore } from '@/shared/model/uiStore';
import Logo from '@/assets/logo.svg';

import { useState, useEffect } from 'react';
import { useAccountStore } from '@/entities/account/model/accountStore';
import { AddAccountModal } from '../account-manager/AddAccountModal';
import { AccountPopover } from '../account-manager/AccountPopover';

export function Sidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { setSettingsOpen } = useUiStore();
    
        const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addAccountType, setAddAccountType] = useState<'Offline' | 'Microsoft' | 'Modrinth' | null>(null);
    const { accounts, activeAccountId, loadAccounts } = useAccountStore();
    
    const activeAccount = accounts.find(a => a.id === activeAccountId) || (accounts.length > 0 ? accounts[0] : null);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);
            

    const navItems = [
        { path: '/home', icon: Home, label: t('sidebar.home') },
        { path: '/browser', icon: Globe, label: t('sidebar.browser') },
        { path: '/instances', icon: Layers, label: t('sidebar.instances') },
        { path: '/servers', icon: Server, label: t('sidebar.servers') },
    ];

    return (
        <>
        <aside 
            onMouseLeave={() => setIsAccountPopoverOpen(false)}
            className="w-16 hover:w-64 bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col h-full group z-40 absolute left-0 top-0 bottom-0 shadow-lg"
        >
            <div className="h-14 flex items-center px-4 overflow-hidden shrink-0 border-b border-border/50 bg-background/50 drag-region">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center p-0.5 no-drag">
                    <img src={Logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-md text-accent" style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(45%) saturate(3065%) hue-rotate(193deg) brightness(101%) contrast(96%)' }} />
                </div>
                <span className="ml-4 font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 no-drag">
                    Conduit
                </span>
            </div>

            {/* Приховуємо скролбар візуально, але залишаємо скрол */}
            <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2 [&::-webkit-scrollbar]:hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.path}
                            data-nav={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex items-center h-12 px-2 rounded-xl transition-colors duration-200 w-full text-left outline-none shrink-0 overflow-hidden relative",
                                isActive ? "bg-accent/10 text-accent" : "text-secondary hover:bg-surfaceHover hover:text-primary"
                            )}
                        >
                            <item.icon className="w-6 h-6 shrink-0 mx-1 relative z-10" />
                            <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-2 flex flex-col gap-2 shrink-0 mb-2 mt-auto">
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center h-12 px-2 w-full text-left rounded-xl transition-colors duration-200 text-secondary hover:bg-surfaceHover hover:text-primary outline-none shrink-0 overflow-hidden relative"
                >
                    <Settings className="w-6 h-6 shrink-0 mx-1 relative z-10" />
                    <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {t('sidebar.settings')}
                    </span>
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setIsAccountPopoverOpen(!isAccountPopoverOpen)}
                        className="flex items-center h-12 px-2 rounded-xl transition-colors duration-200 w-full text-left bg-surfaceHover/50 hover:bg-surfaceHover outline-none shrink-0 overflow-hidden relative"
                    >
                        <div className="w-6 h-6 mx-1 bg-black/40 rounded-md shrink-0 flex items-center justify-center overflow-hidden relative z-10">
                            {activeAccount ? (
                                <img 
                                    src={activeAccount.skinUrl || `https://minotar.net/avatar/${activeAccount.username}/24`} 
                                    alt={activeAccount.username} 
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <User className="w-4 h-4 text-gray-300" />
                            )}
                        </div>
                        <div className="ml-4 flex flex-col flex-1 min-w-0 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="font-bold text-sm text-primary truncate leading-tight">
                                {activeAccount ? activeAccount.username : 'No account'}
                            </span>
                            <span className="text-xs text-green-500 font-medium truncate leading-tight">
                                {activeAccount ? activeAccount.type : 'Add account'}
                            </span>
                        </div>
                    </button>

                    
                    <AccountPopover 
                        isOpen={isAccountPopoverOpen} 
                        onClose={() => setIsAccountPopoverOpen(false)}
                        onAddAccount={async (type) => {
                            if (type === 'Microsoft') {
                                // Trigger MS Auth directly instead of opening modal
                                setIsAccountPopoverOpen(false);
                                try {
                                    await useAccountStore.getState().addMicrosoftAccount();
                                } catch (e) {
                                    console.error("Microsoft auth failed", e);
                                }
                            } else {
                                setAddAccountType(type);
                                setIsAddModalOpen(true);
                            }
                        }}
                    />
                </div>
            </div>
        </aside>
        
        <AddAccountModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            addType={addAccountType}
        />
        </>
    );
}