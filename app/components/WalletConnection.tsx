"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';
import { coinbaseWallet } from 'wagmi/connectors';

export default function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Auto-connect with Coinbase Smart Wallet on component mount
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      const coinbaseConnector = connectors.find(
        connector => connector.id === 'coinbaseWalletSDK'
      );
      
      if (coinbaseConnector) {
        connect({ connector: coinbaseConnector });
      }
    }
  }, [isConnected, isConnecting, connect, connectors]);

  const handleConnect = () => {
    const coinbaseConnector = connectors.find(
      connector => connector.id === 'coinbaseWalletSDK'
    );
    
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnecting) {
    return (
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-3">
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
          <button
            onClick={handleDisconnect}
            className="py-2 px-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium text-xs transition-all duration-300 hover:bg-red-500/30"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs">💳</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Connect Wallet</p>
            <p className="text-white/60 text-xs">Connect to Base network</p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-xs transition-all duration-300 hover:shadow-lg"
        >
          Connect
        </button>
      </div>
    </div>
  );
}