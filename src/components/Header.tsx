import React from 'react';
import { Wallet, LogOut, RefreshCw, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onDisconnect, onRefreshBalance }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInExplorer = () => {
    window.open(`https://explorer-testnet.shardeum.org/address/${user.address}`, '_blank');
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CryptoTracker</h1>
              <p className="text-xs text-slate-400">Shardeum Testnet</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-300">Balance</p>
                  <button
                    onClick={onRefreshBalance}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Refresh balance"
                  >
                    <RefreshCw className="h-3 w-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <p className="text-lg font-semibold text-white">{user.balance} SHM</p>
              </div>
              <div className="h-8 border-l border-slate-600"></div>
              <div className="text-right">
                <p className="text-sm text-slate-300">Address</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-white">{formatAddress(user.address)}</p>
                  <button
                    onClick={openInExplorer}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="View in explorer"
                  >
                    <ExternalLink className="h-3 w-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={onDisconnect}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 
                       text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};