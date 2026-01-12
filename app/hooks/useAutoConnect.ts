"use client";

import { useAccount, useConnect } from 'wagmi';
import { useEffect } from 'react';

export function useAutoConnect() {
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Only auto-connect if not already connected or connecting
    if (!isConnected && !isConnecting) {
      // Find Coinbase Smart Wallet connector (preferred for Base)
      const coinbaseConnector = connectors.find(
        connector => connector.id === 'coinbaseWalletSDK'
      );
      
      if (coinbaseConnector) {
        // Auto-connect with Coinbase Smart Wallet
        connect({ connector: coinbaseConnector });
      }
    }
  }, [isConnected, isConnecting, connect, connectors]);

  return {
    isConnected,
    isConnecting,
  };
}