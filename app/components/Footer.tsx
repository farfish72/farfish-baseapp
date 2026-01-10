export default function Footer() {
  return (
    <div 
      style={{ 
        position: 'fixed',
        bottom: '80px', // Adjusted for better spacing above bottom nav
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 998, // Below toasts but above content
        width: '90%',
        maxWidth: '400px'
      }}
    >
      <div 
        className="glass-card rounded-xl p-4 shadow-medium"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-center">
          <p className="text-xs text-white/80 font-medium">
            FarFISH © 2026 • Built on Base
          </p>
        </div>
      </div>
    </div>
  );
}
