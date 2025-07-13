import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { User, WalletError, SHARDEUM_NETWORK, Transaction } from "../types";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  private updateLocalStorage(transactions: Transaction[]): void {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
      // Dispatch storage event for cross-tab updates
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "transactions",
          newValue: JSON.stringify(transactions),
        })
      );
    } catch (error) {
      console.error("Error updating localStorage:", error);
      throw new Error("Failed to update transaction storage");
    }
  }

  private getStoredTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem("transactions");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  async detectProvider(): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider({
        mustBeMetaMask: true,
        timeout: 3000,
      });

      if (provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.provider.getNetwork();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error detecting provider:", error);
      return false;
    }
  }

  async connectWallet(): Promise<User> {
    try {
      if (!this.provider) {
        const hasProvider = await this.detectProvider();
        if (!hasProvider) {
          if (typeof window.ethereum === "undefined") {
            throw new Error("MetaMask not detected. Please install MetaMask.");
          } else if (!window.ethereum.isMetaMask) {
            throw new Error("Please use MetaMask as your wallet provider.");
          } else {
            throw new Error(
              "Unable to connect to MetaMask. Please refresh the page and try again."
            );
          }
        }
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      this.signer = await this.provider!.getSigner();
      const address = await this.signer.getAddress();

      await this.switchToShardeum();
      const balance = await this.getBalance(address);
      const network = await this.provider!.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;

      return {
        address,
        balance,
        connected: true,
        chainId,
        network: network.name || "Unknown",
      };
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      throw this.handleWalletError(error);
    }
  }

  async switchToShardeum(): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SHARDEUM_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SHARDEUM_NETWORK],
          });
        } catch (addError) {
          console.error("Failed to add Shardeum network:", addError);
          throw addError;
        }
      } else {
        console.error("Failed to switch to Shardeum network:", switchError);
        throw switchError;
      }
    }
  }

  async getTransactionHistory(
    address: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    try {
      const transactions = this.getStoredTransactions();
      const addressTransactions = transactions.filter(
        (tx) =>
          tx.from.toLowerCase() === address.toLowerCase() ||
          tx.to.toLowerCase() === address.toLowerCase()
      );

      return addressTransactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error("Wallet not connected");
      }

      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      const from = await this.signer.getAddress();

      const newTransaction: Transaction = {
        hash: tx.hash,
        from: from,
        to: to,
        value: ethers.parseEther(amount).toString(),
        timestamp: Math.floor(Date.now() / 1000),
        status: "Sent",
        note: "",
        category: "",
      };

      const transactions = this.getStoredTransactions();
      transactions.unshift(newTransaction);
      this.updateLocalStorage(transactions);

      tx.wait()
        .then((receipt) => {
          if (!receipt) return;

          const transactions = this.getStoredTransactions();
          const txIndex = transactions.findIndex((t) => t.hash === tx.hash);

          if (txIndex !== -1) {
            transactions[txIndex] = {
              ...transactions[txIndex],
              status: "confirmed", // Update status to confirmed
            };

            this.updateLocalStorage(transactions);
          }
        })
        .catch((error) => {
          console.error("Error updating transaction receipt:", error);

          const transactions = this.getStoredTransactions();
          const txIndex = transactions.findIndex((t) => t.hash === tx.hash);
        });

      return tx.hash;
    } catch (error: any) {
      console.error("Transaction error:", error);
      throw this.handleWalletError(error);
    }
  }

  updateTransactionNote(hash: string, note: string): void {
    try {
      const transactions = this.getStoredTransactions();
      const txIndex = transactions.findIndex((tx) => tx.hash === hash);

      if (txIndex !== -1) {
        transactions[txIndex].note = note;
        this.updateLocalStorage(transactions);
      }
    } catch (error) {
      console.error("Error updating transaction note:", error);
      throw new Error("Failed to update transaction note");
    }
  }

  updateTransactionCategory(hash: string, category: string): void {
    try {
      const transactions = this.getStoredTransactions();
      const txIndex = transactions.findIndex((tx) => tx.hash === hash);

      if (txIndex !== -1) {
        transactions[txIndex].category = category;
        this.updateLocalStorage(transactions);
      }
    } catch (error) {
      console.error("Error updating transaction category:", error);
      throw new Error("Failed to update transaction category");
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        const hasProvider = await this.detectProvider();
        if (!hasProvider) {
          throw new Error("Provider not initialized");
        }
      }

      const balance = await this.provider!.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      return parseFloat(formattedBalance).toFixed(4);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  }

  async estimateGas(
    to: string,
    amount: string
  ): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }> {
    try {
      if (!this.signer) {
        throw new Error("Wallet not connected");
      }

      const tx = {
        to,
        value: ethers.parseEther(amount),
      };

      const gasLimit = await this.signer.estimateGas(tx);
      const gasPrice = await this.provider!.getFeeData();
      const gasPriceInWei = gasPrice.gasPrice || 0n;
      const estimatedCost = gasPriceInWei * gasLimit;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPriceInWei, "gwei"),
        estimatedCost: ethers.formatEther(estimatedCost),
      };
    } catch (error: any) {
      console.error("Gas estimation error:", error);
      throw this.handleWalletError(error);
    }
  }

  private handleWalletError(error: any): WalletError {
    if (error.code === 4001) {
      return {
        code: 4001,
        message: "User rejected the request",
      };
    } else if (error.code === -32002) {
      return {
        code: -32002,
        message: "Request already pending. Please check MetaMask.",
      };
    } else if (error.code === -32603) {
      return {
        code: -32603,
        message: "Internal error. Please try again.",
      };
    } else {
      return {
        code: -1,
        message: error.message || "An unknown error occurred",
      };
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }
}

export const walletService = new WalletService();
