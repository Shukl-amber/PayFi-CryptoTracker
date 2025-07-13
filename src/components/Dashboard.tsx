import React, { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useTransactions } from "../hooks/useTransactions";
import { WalletConnection } from "./WalletConnection";
import { TransactionHistory } from "./TransactionHistory";
import { Analytics } from "./Analytics";
import { SendTokenModal } from "./SendTokenModal";

export const Dashboard: React.FC = () => {
  const { user, isConnecting, error: walletError, connectWallet } = useWallet();
  const {
    transactions,
    isLoading,
    error: txError,
    sendTransaction,
    updateTransactionNote,
    updateTransactionCategory,
  } = useTransactions(user?.address ?? null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sendTxError, setSendTxError] = useState<string | null>(null);

  const handleSendTransaction = async (
    to: string,
    amount: string,
    category: string,
    note: string
  ) => {
    try {
      setSendTxError(null);
      const txHash = await sendTransaction(to, amount);
      if (category) {
        updateTransactionCategory(txHash, category);
      }
      if (note) {
        updateTransactionNote(txHash, note);
      }
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error("Failed to send transaction:", error);
      setSendTxError(error.message || "Failed to send transaction");
    }
  };

  if (!user?.address) {
    return (
      <WalletConnection
        onConnect={connectWallet}
        isConnecting={isConnecting}
        error={walletError}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send Tokens
        </button>
      </div>

      {sendTxError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{sendTxError}</p>
        </div>
      )}

      <Analytics transactions={transactions} userAddress={user.address} />

      {isLoading ? (
        <div className="text-center py-4">Loading transactions...</div>
      ) : txError ? (
        <div className="text-red-600 text-center py-4">{txError}</div>
      ) : (
        <TransactionHistory
          transactions={transactions}
          userAddress={user.address}
          onUpdateNote={updateTransactionNote}
          onUpdateCategory={updateTransactionCategory}
        />
      )}

      <SendTokenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSend={handleSendTransaction}
      />
    </div>
  );
};
