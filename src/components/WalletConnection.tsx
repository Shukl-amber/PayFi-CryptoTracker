import React from "react";
import { Wallet, Shield, Zap, AlertCircle, ExternalLink } from "lucide-react";

interface WalletConnectionProps {
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  isConnecting,
  error,
}) => {
  const installMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CryptoTracker</h1>
          <p className="text-slate-300">
            Real Crypto Expense Management for Shardeum
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Connect Your Wallet
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Connection Failed</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-slate-300">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Real blockchain transaction tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>Live wallet balance updates</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <Wallet className="h-5 w-5 text-blue-400" />
              <span>Shardeum network support</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl 
                       transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Connect MetaMask</span>
                </div>
              )}
            </button>

            <button
              onClick={installMetaMask}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg 
                       transition-colors border border-white/20 flex items-center justify-center space-x-2"
            >
              <span>Don't have MetaMask?</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> This app will automatically switch to the
              Shardeum Testnet. Make sure you have some SHM tokens for gas fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
