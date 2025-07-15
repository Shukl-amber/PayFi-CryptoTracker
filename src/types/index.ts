export interface User {
  address: string;
  balance: string;
  connected: boolean;
  chainId: string;
  network: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  note?: string;
  category?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export type TransactionUpdate = {
  hash: string;
  note?: string;
  category?: string;
};

export interface WalletError {
  code: number;
  message: string;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const SHARDEUM_NETWORK: NetworkConfig = {
  chainId: "0x1F93", // 8083 in hex
  chainName: "Shardeum Testnet",
  nativeCurrency: {
    name: "Shardeum",
    symbol: "SHM",
    decimals: 18,
  },
  rpcUrls: ["https://api-testnet.shardeum.org"],
  blockExplorerUrls: ["https://explorer-testnet.shardeum.org/"],
};

export const EXPENSE_CATEGORIES = [
  "P2P Transfer",
  "DeFi Trading",
  "NFT Purchases",
  "Gaming",
  "Utilities",
  "Transfer",
  "Exchange",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
