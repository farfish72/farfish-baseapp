export default function Footer() {
  return (
    <footer className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-60">
      <div className="glass-card rounded-2xl p-2 shadow-soft border border-white/10 group">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-60"></div>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
        
        <div className="text-center relative z-10">
          <p className="text-[10px] font-medium text-white/80 tracking-wide">
            FarFISH © 2026 • Built on{" "}
            <span className="gradient-text font-semibold">Base</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
