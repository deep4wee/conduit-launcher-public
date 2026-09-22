import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Box, Play, Terminal, Search, Loader2, FolderOpen, Edit, Trash2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { CreateInstanceModal } from '@/widgets/instance-creation/CreateInstanceModal';
import { useInstanceStore } from '@/entities/instance/model/instanceStore';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutside';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';

const loaderColors: Record<string, string> = {
  Vanilla: 'hover:border-stone-500/50',
  Fabric: 'hover:border-orange-500/50',
  Forge: 'hover:border-red-500/50',
  NeoForge: 'hover:border-orange-400/50',
  Quilt: 'hover:border-purple-500/50',
  LiteLoader: 'hover:border-blue-500/50'
};

export function InstancesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { instances, fetchInstances, isLoading, launchInstance, deleteInstance, openFolder, renameInstance, launchingInstances } = useInstanceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Vanilla' | 'Custom'>('All');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, instanceId: string, name: string } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  useClickOutside(menuRef, () => setContextMenu(null));

  const handleContextMenu = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, instanceId: id, name });
  };

  const filteredInstances = instances.filter(i => {
    if (activeFilter === 'Vanilla' && i.loaderType !== 'Vanilla') return false;
    if (activeFilter === 'Custom' && i.loaderType === 'Vanilla') return false;
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [renameModal, setRenameModal] = useState<{ id: string, currentName: string } | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameModal && renameInput.trim()) {
      await renameInstance(renameModal.id, renameInput.trim());
      setRenameModal(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-background relative" 
      onClick={() => setContextMenu(null)}
    >
      
      {/* Toolbar */}
      <div className="flex items-center justify-between p-6 pb-2 shrink-0">
        <div className="flex items-center gap-4 border border-border bg-[#0f0f0f] rounded-full p-1 hidden sm:flex">
          {(['All', 'Custom', 'Vanilla'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors outline-none",
                activeFilter === filter 
                  ? "bg-[#252525] text-primary" 
                  : "text-secondary hover:text-primary"
              )}
            >
              {filter === 'All' ? t('instance.filters.all', 'All instances') : 
               filter === 'Custom' ? t('instance.filters.custom', 'Modded') : 
               t('instance.filters.vanilla', 'Vanilla')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              type="text" 
              placeholder={t('common.search', 'Search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 pl-9 pr-4 bg-[#0f0f0f] border border-border rounded-full text-sm focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 bg-brand/10 text-brand font-medium text-sm rounded-lg hover:bg-brand/20 transition-colors border border-brand/20 outline-none flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('instance.create', 'Create Instance')}</span>
            <span className="inline sm:hidden">{t('common.create', 'Create')}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-secondary">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary gap-4">
            <Box className="w-12 h-12 opacity-50" />
            <p>{t('instance.noInstances', 'No instances found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInstances.map(inst => {
              const isLaunching = launchingInstances?.[inst.id];
              return (
                <div 
                  key={inst.id}
                  data-instance-id={inst.id}
                  onClick={() => !isLaunching && navigate(`/instances/${inst.id}`)}
                  onContextMenu={(e) => handleContextMenu(e, inst.id, inst.name)}
                  className={cn("group relative bg-[#131313] border border-border/40 rounded-xl p-3 hover:bg-[#1a1a1a] transition-all flex items-center gap-3 cursor-pointer overflow-hidden", isLaunching && "opacity-75 pointer-events-none", loaderColors[inst.loaderType] || "hover:border-border")}
                >
                  <div className="w-12 h-12 bg-[#202020] rounded-lg shrink-0 flex items-center justify-center border border-border/50">
                    {inst.iconBase64 ? (
                      <img src={"data:image/png;base64," + inst.iconBase64} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <Box className="w-6 h-6 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-primary/90 truncate">{inst.name}</div>
                    <div className="text-xs text-secondary flex items-center gap-1.5 mt-0.5">
                      <Terminal className="w-3 h-3" />
                      <span className="truncate">{inst.loaderType} {inst.minecraftVersion}</span>
                    </div>
                  </div>
                  {isLaunching ? (
                      <Loader2 className="w-5 h-5 text-brand animate-spin shrink-0 opacity-100 transition-opacity mr-1" />
                  ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); launchInstance(inst.id); }}
                        className="p-1 rounded-md hover:bg-brand/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-200 mr-1 outline-none"
                      >
                        <Play className="w-5 h-5 text-brand" />
                      </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateInstanceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); fetchInstances(); }} 
      />

      {contextMenu && (
        <div 
          ref={menuRef}
          className="fixed z-50 w-48 bg-surface border border-border rounded-xl shadow-2xl py-1 overflow-hidden"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 192), top: Math.min(contextMenu.y, window.innerHeight - 150) }}
        >
          <div className="px-3 py-2 text-xs font-bold text-secondary uppercase tracking-wider border-b border-border/50 mb-1 truncate">
            {contextMenu.name}
          </div>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover flex items-center gap-2"
            onClick={() => { !launchingInstances?.[contextMenu.instanceId] && launchInstance(contextMenu.instanceId); setContextMenu(null); }}
          >
            <Play className="w-4 h-4 text-brand" /> {t('common.play', 'Play')}
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover flex items-center gap-2"
            onClick={() => { openFolder(contextMenu.instanceId); setContextMenu(null); }}
          >
            <FolderOpen className="w-4 h-4 text-secondary" /> {t('common.folder', 'Folder')}
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover flex items-center gap-2"
            onClick={() => { navigate(`/browser?instanceId=${contextMenu.instanceId}`); setContextMenu(null); }}
          >
            <Globe className="w-4 h-4 text-accent" /> {t('instance.browseMods', 'Add Mods / Content')}
          </button>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover flex items-center gap-2"
            onClick={() => { setRenameModal({ id: contextMenu.instanceId, currentName: contextMenu.name }); setRenameInput(contextMenu.name); setContextMenu(null); }}
          >
            <Edit className="w-4 h-4 text-secondary" /> {t('common.rename', 'Rename')}
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button 
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            onClick={() => { setDeleteModal(contextMenu.instanceId); setContextMenu(null); }}
          >
            <Trash2 className="w-4 h-4" /> {t('common.delete', 'Delete')}
          </button>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-primary">{t('instance.deleteConfirm', 'Delete instance?')}</h3>
            <p className="text-sm text-secondary">{t('instance.deleteWarning', 'This action is irreversible. All mods and worlds will be lost.')}</p>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setDeleteModal(null)}>{t('common.cancel', 'Cancel')}</Button>
              <Button variant="primary" className="bg-red-500 hover:bg-red-600 text-white" onClick={async () => { await deleteInstance(deleteModal); setDeleteModal(null); }}>
                {t('common.delete', 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {renameModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-primary">{t('instance.renameTitle', 'Rename instance')}</h3>
            <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
              <input 
                autoFocus
                type="text" 
                value={renameInput}
                onChange={e => setRenameInput(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors text-primary"
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button type="button" variant="secondary" onClick={() => setRenameModal(null)}>{t('common.cancel', 'Cancel')}</Button>
                <Button type="submit" variant="primary" disabled={!renameInput.trim() || renameInput === renameModal.currentName}>
                  {t('common.save', 'Save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
