import { invoke } from '@/shared/ipc/ipcClient';

export function WindowResizeHandles() {
    // Win32 HitTest Constants
    const edges = {
        top: 12, bottom: 15, left: 10, right: 11,
        topLeft: 13, topRight: 14, bottomLeft: 16, bottomRight: 17
    };

    const handleResize = (edge: number) => (e: React.PointerEvent) => {
        e.preventDefault();
        invoke('WINDOW_RESIZE', edge);
    };

    return (
        <>
            <div onPointerDown={handleResize(edges.top)} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.bottom)} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.left)} className="absolute top-2 bottom-2 left-0 w-1 cursor-w-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.right)} className="absolute top-2 bottom-2 right-0 w-1 cursor-e-resize z-[9999]" />
            
            <div onPointerDown={handleResize(edges.topLeft)} className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.topRight)} className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.bottomLeft)} className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize z-[9999]" />
            <div onPointerDown={handleResize(edges.bottomRight)} className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-[9999]" />
        </>
    );
}
    