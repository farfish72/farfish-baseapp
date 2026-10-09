"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import Button from './ui/Button';

export default function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = (connectorId?: string) => {
    let selectedConnector;
    
    if (connectorId) {
      // User selected a specific wallet
      selectedConnector = connectors.find(c => c.id === connectorId);
    } else {
      // Auto-select Coinbase Wallet (for backwards compatibility)
      selectedConnector = connectors.find(
        connector => connector.id === 'coinbaseWalletSDK' || connector.id === 'coinbaseWallet'
      );
    }
    
    // Fallback to first available connector
    if (!selectedConnector && connectors.length > 0) {
      selectedConnector = connectors[0];
    }
    
    if (selectedConnector) {
      connect({ connector: selectedConnector });
      setShowWalletOptions(false);
    }
  };

  const handleDisconnect = () => {
    // Disconnect wallet
    // Note: In Base App, user authentication persists
    disconnect();
  };

  // Get user-friendly connector names
  const getConnectorName = (id: string) => {
    const names: Record<string, string> = {
      'coinbaseWalletSDK': 'Coinbase Wallet',
      'coinbaseWallet': 'Coinbase Wallet',
      'walletConnect': 'WalletConnect',
      'metaMask': 'MetaMask',
      'injected': 'Browser Wallet',
    };
    return names[id] || id;
  };

  // Prevent hydration mismatch - show loading during SSR
  if (!mounted) {
    return (
      <div className="p-6 rounded-2xl bg-black/40 border border-white/20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/70 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/70 text-sm">Connecting wallet...</span>
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Wallet Connected</p>
              <p className="text-white/60 text-xs">Base Network</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/20">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-6">
        <h4 className="text-white font-semibold text-base mb-2">
          Wallet Connection Required
        </h4>
        <p className="text-white/60 text-sm">
          Connect your non-custodial wallet on Base network to unlock Mint Premium Pass, daily chests, and rewards.
        </p>
      </div>

      {/* Connect Button */}
      {!showWalletOptions ? (
        <button
          onClick={() => setShowWalletOptions(true)}
          className="w-full py-3 rounded-xl text-white font-semibold text-base border-2 border-teal bg-transparent hover:bg-teal/10 transition-all duration-200"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              className="w-full p-4 rounded-xl text-left transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-white text-sm font-medium flex-1 truncate">
                  {getConnectorName(connector.id)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}