export default function Footer() {
  return (
    <footer className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
      <div className="glass-card rounded-xl border border-white/10 group">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-60"></div>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
        
        <div className="text-center relative z-10 py-1.5 px-3">
          <p className="text-[9px] font-medium text-white/70 tracking-wide leading-tight">
            FarFISH © 2026 • Built on{" "}
            <span className="gradient-text font-semibold">Base</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
