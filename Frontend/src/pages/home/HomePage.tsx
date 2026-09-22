import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full items-start justify-between p-8 relative overflow-hidden"
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t('home.welcome', 'Welcome')}</h1>
        <p className="text-secondary mt-2">{t('home.subtitle', 'Your recent instances will appear here later.')}</p>
      </div>
      
      {/* News Panels (Bottom Right) */}
      <div className="self-end flex gap-4 w-full max-w-2xl mt-auto">
        {/* Launcher News */}
        <div className="flex-1 bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border shadow-xl min-h-[200px] flex flex-col">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">{t('home.launcherNews', 'Launcher News')}</h3>
            <div className="flex-1 flex items-center justify-center text-secondary/50 text-sm">
                {t('home.noNews', 'No new notifications')}
            </div>
        </div>

        {/* Minecraft News */}
        <div className="flex-1 bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border shadow-xl min-h-[200px] flex flex-col">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">{t('home.minecraftNews', 'Minecraft News')}</h3>
            <div className="flex-1 flex items-center justify-center text-secondary/50 text-sm">
                {t('home.noNews', 'No new notifications')}
            </div>
        </div>
      </div>
    </motion.div>
  );
}
            
    