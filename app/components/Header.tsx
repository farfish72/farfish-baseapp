import ShareButton from './ShareButton';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-1 max-w-lg">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            {/* App Name */}
            <h1 className="text-2xl font-bold text-primary mb-1">
              FarFISH
            </h1>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-white/80 font-medium">Live on Base</span>
            </div>
            
            {/* Subtitle - Centered */}
            <p className="text-sm text-white/70 leading-relaxed text-center">
              Build on-chain habits, earn sustainable rewards on Base Network
            </p>
          </div>
          
          {/* Share Button */}
          <div className="ml-3">
            <ShareButton variant="icon" />
          </div>
        </div>
      </div>
    </header>
  );
}