"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from './ui/Button';

export default function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const coinbaseConnector = connectors.find(
      connector => connector.id === 'coinbaseWalletSDK' || connector.id === 'coinbaseWallet'
    ) || connectors[0];
    
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  const handleDisconnect = () => {
    // Disconnect wallet
    // Note: In Base App, user authentication persists
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
          <Button
            variant="danger"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect Your Wallet
          </Button>
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
            <p className="text-white font-medium text-sm">Connect to Base Network</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
        >
          Connect Your Wallet
        </Button>
      </div>
    </div>
  );
}