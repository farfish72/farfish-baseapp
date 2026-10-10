export default function Footer() {
  return (
    <footer 
      style={{
        width: '100%',
        marginTop: '0',
        marginBottom: '0',
        pointerEvents: 'none',
      }}
    >
      <div 
        style={{
          background: 'var(--color-surface)',
          backdropFilter: 'blur(12px)',
          padding: '0.5rem', // Keep minimal padding
          borderRadius: '0.75rem',
          border: '1px solid var(--color-surface-raised)',
          textAlign: 'center',
          pointerEvents: 'auto',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
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
