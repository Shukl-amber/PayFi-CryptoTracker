import React, { useState } from 'react';
import { WalletConnection } from './components/WalletConnection';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import Analytics from './components/Analytics';
import { useWallet } from './hooks/useWallet';
import { useTransactions } from './hooks/useTransactions';
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

function App() {
  const { user, isConnecting, error, connectWallet, disconnectWallet, refreshBalance } = useWallet();
  const { 
    transactions, 
    isLoading, 
    error: transactionError, 
    fetchTransactions, 
    updateTransactionNote, 
    updateTransactionCategory 
  } = useTransactions(user?.address || null);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  // If wallet not connected, show connection screen
  if (!user) {
    return (
      <WalletConnection 
        onConnect={connectWallet} 
        isConnecting={isConnecting} 
        error={error}
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            isLoading={isLoading}
            onRefresh={fetchTransactions}
          />
        );
      case 'history':
        return (
          <TransactionHistory 
            transactions={transactions}
            onUpdateNote={updateTransactionNote}
            onUpdateCategory={updateTransactionCategory}
          />
        );
      case 'analytics':
        return <Analytics transactions={transactions} />;
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            isLoading={isLoading}
            onRefresh={fetchTransactions}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <Header 
        user={user} 
        onDisconnect={disconnectWallet}
        onRefreshBalance={refreshBalance}
      />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      <main>
        {transactionError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400">{transactionError}</p>
            </div>
          </div>
        )}
        {renderActiveTab()}
      </main>
      <VercelAnalytics />
    </div>
  );
}

export default App;