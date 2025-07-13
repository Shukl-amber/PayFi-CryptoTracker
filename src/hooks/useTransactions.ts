import { useState, useEffect, useCallback } from "react";
import { Transaction } from "../types";
import { walletService } from "../utils/wallet";

export const useTransactions = (userAddress: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userAddress) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHistory = await walletService.getTransactionHistory(
        userAddress,
        100
      );
      setTransactions(txHistory);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      setError("Failed to load transaction history");
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Load transactions when user address changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "transactions" && userAddress) {
        fetchTransactions();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchTransactions, userAddress]);

  const updateTransactionNote = useCallback((hash: string, note: string) => {
    walletService.updateTransactionNote(hash, note);
    // Update local state
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, note } : tx))
    );
  }, []);

  const updateTransactionCategory = useCallback(
    (hash: string, category: string) => {
      walletService.updateTransactionCategory(hash, category);
      // Update local state
      setTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, category } : tx))
      );
    },
    []
  );

  const sendTransaction = useCallback(
    async (to: string, amount: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const txHash = await walletService.sendTransaction(to, amount);

        // Refresh transactions immediately after sending
        await fetchTransactions();

        return txHash;
      } catch (error: any) {
        setError(error.message || "Transaction failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTransactions]
  );

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    updateTransactionNote,
    updateTransactionCategory,
    sendTransaction,
  };
};
