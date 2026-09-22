import Logo from '@/assets/logo.svg';

export function SplashScreen() {
    return (
        <div className="absolute inset-0 bg-[#11111b] z-[999] flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards pointer-events-none" style={{ animationDelay: '1s' }}>
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="w-24 h-24 text-[#89b4fa]">
                    <img src={Logo} alt="Conduit" className="w-full h-full object-contain filter invert opacity-80" />
                </div>
                <h1 className="text-3xl font-bold text-[#cdd6f4] tracking-widest">CONDUIT</h1>
                <div className="w-32 h-1 bg-[#313244] rounded-full overflow-hidden mt-4">
                    <div className="w-1/2 h-full bg-[#89b4fa] animate-[slide_1s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );
}
    