export default function Footer() {
  return (
    <div 
      style={{ 
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        width: '90%',
        maxWidth: '512px' // max-w-lg equivalent
      }}
    >
      <div 
        className="glass-card rounded-xl p-3 shadow-medium"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="text-center">
          <p className="text-xs text-white/70 font-medium">
            FarFISH © 2026 • Built on Base
          </p>
        </div>
      </div>
    </div>
  );
}
