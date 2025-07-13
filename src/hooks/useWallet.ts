import { useState, useEffect, useCallback } from "react";
import { User, WalletError } from "../types";
import { walletService } from "../utils/wallet";

export const useWallet = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet was previously connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Clear any previous errors
        setError(null);

        const hasProvider = await walletService.detectProvider();
        if (!hasProvider) {
          // Don't show error on initial load if not previously connected
          return;
        }

        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.length > 0) {
            // Auto-reconnect if previously connected
            await connectWallet();
          }
        }
      } catch (error) {
        console.log("No previous connection found");
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (user && accounts[0] !== user.address) {
          // Account changed, reconnect
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [user]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const userData = await walletService.connectWallet();
      setUser(userData);

      // Store connection state
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_address", userData.address);
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    walletService.disconnect();
    setUser(null);
    setError(null);

    // Clear stored connection state
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_address");
  }, []);

  const refreshBalance = useCallback(async () => {
    if (user) {
      try {
        const newBalance = await walletService.getBalance(user.address);
        setUser((prev) =>
          prev ? { ...prev, balance: parseFloat(newBalance).toFixed(4) } : null
        );
      } catch (error) {
        console.error("Failed to refresh balance:", error);
      }
    }
  }, [user]);

  return {
    user,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
};
