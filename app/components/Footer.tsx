export default function Footer() {
  return (
    <footer 
      style={{
        position: 'fixed',
        bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 1.5rem)',
        maxWidth: 'calc(28rem - 1.5rem)',
        zIndex: 45,
        pointerEvents: 'none'
      }}
    >
      <div 
        style={{
          background: 'var(--color-surface)',
          backdropFilter: 'blur(12px)',
          padding: '0.375rem 0.5rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--color-surface-raised)',
          textAlign: 'center',
          pointerEvents: 'auto',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <p style={{ 
          fontSize: '10px', 
          color: 'var(--color-muted)', 
          fontWeight: 500,
          margin: 0
        }}>
          FarFISH 2026 | Built on Base
        </p>
      </div>
    </footer>
  );
}
