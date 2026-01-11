"use client";

import { useBaseAuth } from "@/app/contexts/BaseAuthContext";
import BaseAuthGuard from "@/app/components/BaseAuthGuard";

function SimpleHomePageContent() {
  const { user, isAuthenticated } = useBaseAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: 'var(--spacing-xl)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
        FarFISH - Simple Test
      </h1>
      
      {isAuthenticated && user ? (
        <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p>✅ Base App Connected!</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: 'var(--spacing-sm)' }}>
            {user.displayName || user.username || 'Base User'}
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: 'var(--spacing-xs)' }}>
            FID: {user.fid}
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p>🔐 Base App Authentication Required</p>
        </div>
      )}
      
      <div style={{ textAlign: 'center', opacity: 0.7 }}>
        <p>If you see this page, the Base App authentication is working!</p>
        <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
          Authentication happens automatically via Base App.
        </p>
      </div>
    </div>
  );
}

export default function SimpleHomePage() {
  return (
    <BaseAuthGuard>
      <SimpleHomePageContent />
    </BaseAuthGuard>
  );
}