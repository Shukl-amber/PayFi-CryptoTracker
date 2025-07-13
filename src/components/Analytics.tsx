import React, { useMemo } from "react";
import { Transaction } from "../types";
import { formatEther } from "ethers";

interface Props {
  transactions: Transaction[];
  userAddress: string | null;
}

export const Analytics: React.FC<Props> = ({ transactions, userAddress }) => {
  const stats = useMemo(() => {
    let totalSentValue = 0n;
    let totalTxCount = 0;

    transactions.forEach((tx) => {
      if (tx.from.toLowerCase() === userAddress?.toLowerCase()) {
        totalSentValue += BigInt(tx.value);
      }
      totalTxCount++;
    });

    const categories = transactions.reduce((acc, tx) => {
      if (tx.category) {
        acc[tx.category] = (acc[tx.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSentSHM: formatEther(totalSentValue),
      totalTransactions: totalTxCount,
      categories,
    };
  }, [transactions, userAddress]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Transaction Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Sent</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.totalSentSHM} SHM
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.totalTransactions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
