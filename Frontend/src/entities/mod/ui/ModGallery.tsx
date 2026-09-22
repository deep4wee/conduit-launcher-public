import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModDetails } from '@/shared/api/types/modrinth';

export function ModGallery({ gallery }: { gallery: ModDetails['gallery'] }) {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            {(!gallery || gallery.length === 0) ? (
                <div className="w-full flex justify-center items-center py-32 text-secondary font-medium text-center">
                    {t('mod_details.empty_gallery')}
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 pb-6 w-full min-w-0">
                    {gallery.map((img, i) => (
                        <div 
                            key={i} 
                            className="flex flex-col gap-3 group cursor-pointer bg-surface/30 p-3 rounded-2xl border border-border hover:border-secondary transition-colors w-full h-full" 
                            onClick={() => setSelectedImage(img.url)}
                        >
                            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-black/50 shrink-0">
                                <img 
                                    src={img.url} 
                                    alt={img.title || "Gallery"} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                />
                            </div>
                            {img.title && <span className="text-lg font-bold text-primary px-1">{img.title}</span>}
                            {img.description && <span className="text-sm text-secondary px-1 line-clamp-3">{img.description}</span>}
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-8 animate-in fade-in" 
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all outline-none"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Fullscreen" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </>
    );
}