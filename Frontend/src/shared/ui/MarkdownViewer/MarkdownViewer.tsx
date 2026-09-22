import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/shared/lib/utils';
import { invoke } from '@/shared/ipc/ipcClient';

interface MarkdownViewerProps {
    content: string;
    className?: string;
    debugMarkdown?: boolean;
    onExternalLinkClick?: (url: string) => void;
}

export function MarkdownViewer({ content, className, debugMarkdown = false, onExternalLinkClick }: MarkdownViewerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleExternalLink = (url: string) => {
        if (onExternalLinkClick) onExternalLinkClick(url);
        else invoke('OPEN_URL', url);
    };

    return (
        <article className={cn(
            "prose prose-invert prose-emerald max-w-none prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-a:text-accent hover:prose-a:text-primary transition-colors select-text overflow-x-auto",
            debugMarkdown && "debug-markdown",
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    // Кастомний рендер для iframe (вирішення помилки YouTube CORS та sandbox)
                    iframe: ({ node, src, ...props }) => {
                        if (!src) return <iframe src={src} {...props} />;

                        const match = src.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
                        if (match && match[1]) {
                            const videoId = match[1];
                            const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                            return (
                                <div
                                    onClick={() => handleExternalLink(`https://www.youtube.com/watch?v=${videoId}`)}
                                    className="relative w-full max-w-xl aspect-video rounded-2xl overflow-hidden border border-border my-6 group cursor-pointer shadow-lg bg-black flex items-center justify-center select-none"
                                >
                                    <img
                                        src={thumbUrl}
                                        alt="YouTube Preview"
                                        className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                                    <div className="absolute w-16 h-12 bg-[#FF0000] rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                        <span className="text-white text-2xl leading-none ml-1">▶</span>
                                    </div>

                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-xs font-bold text-white/90">
                                        <span>Watch on YouTube</span>
                                        <span className="bg-black/60 px-2 py-0.5 rounded border border-white/20">External Player</span>
                                    </div>
                                </div>
                            );
                        }

                        return <iframe src={src} {...props} className="max-w-full rounded-xl" />;
                    },

                    a: ({ node, href, children, ...props }) => {
                        const modrinthMatch = href?.match(/(?:https?:\/\/)?(?:www\.)?modrinth\.com\/(?:mod|plugin|datapack|resourcepack|shader|modpack)\/([a-zA-Z0-9_-]+)/);

                        return (
                            <a
                                {...props}
                                href={href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!href) return;
                                    if (modrinthMatch && modrinthMatch[1]) {
                                        navigate(`/browser/mod/${modrinthMatch[1]}`);
                                    } else {
                                        handleExternalLink(href);
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    if (href) handleExternalLink(href);
                                }}
                                title={modrinthMatch ? t('mod_details.link_action_hint') : undefined}
                            >

                                {children}
                            </a>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}