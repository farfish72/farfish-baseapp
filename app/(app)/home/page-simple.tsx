"use client";

import { useAccount } from "wagmi";
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export default function SimpleHomePage() {
  const { address, isConnected } = useAccount();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        FarFISH - Simple Test
      </h1>
      
      {!isConnected ? (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectWallet>
            <div style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(to right, #00d4c4, #3be6c1)',
              color: 'black',
              borderRadius: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Connect Wallet
            </div>
          </ConnectWallet>
        </div>
      ) : (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p>✅ Wallet Connected!</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </p>
        </div>
      )}
      
      <div style={{ textAlign: 'center', opacity: 0.7 }}>
        <p>If you see this page, the wallet connection is working!</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Try connecting your wallet above.
        </p>
      </div>
    </div>
  );
}