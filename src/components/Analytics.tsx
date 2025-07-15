import React, { useMemo } from "react";
import { Transaction } from "../types";
import { TransactionCharts } from "./charts/TransactionCharts";
import { formatEther } from "ethers";

interface Props {
  transactions: Transaction[];
  userAddress: string | null;
}

interface AnalyticStats {
  totalSent: bigint;
  totalReceived: bigint;
  totalGasFees: bigint;
  txCount: number;
  categoryBreakdown: Record<
    string,
    {
      count: number;
      value: bigint;
      gasFees: bigint;
    }
  >;
}

const Analytics: React.FC<Props> = ({ transactions, userAddress }) => {
  const stats = useMemo<AnalyticStats>(() => {
    const initialStats: AnalyticStats = {
      totalSent: 0n,
      totalReceived: 0n,
      totalGasFees: 0n,
      txCount: 0,
      categoryBreakdown: {},
    };

    // Always calculate stats even if no wallet is connected
    if (!transactions.length) return initialStats;

    return transactions.reduce((acc, tx) => {
      const value = BigInt(tx.value);
      // Calculate gas fees in wei (gasPrice is in wei per gas unit)
      const gasFees =
        tx.gasUsed && tx.gasPrice
          ? BigInt(tx.gasUsed) * (BigInt(tx.gasPrice) / 1000000000n) // Convert gasPrice from Gwei to wei
          : 0n;

      const category = tx.category || "Uncategorized";

      if (!acc.categoryBreakdown[category]) {
        acc.categoryBreakdown[category] = {
          count: 0,
          value: 0n,
          gasFees: 0n,
        };
      }

      if (
        typeof tx.from === "string" &&
        typeof userAddress === "string" &&
        tx.from.toLowerCase() === userAddress.toLowerCase()
      ) {
        acc.totalSent += value;
        acc.totalGasFees += gasFees;
        acc.categoryBreakdown[category].value += value;
        acc.categoryBreakdown[category].gasFees += gasFees;
      } else {
        acc.totalReceived += value;
      }

      acc.categoryBreakdown[category].count++;
      acc.txCount++;

      return acc;
    }, initialStats);
  }, [transactions, userAddress]);

  if (!userAddress) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">
          Please connect your wallet to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Sent</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {Number(formatEther(stats.totalSent)).toFixed(1)} SHM
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Total Received (Not Active)
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {Number(formatEther(stats.totalReceived)).toFixed(1)} SHM
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Transactions</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.txCount}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">
            No transactions yet. Start making transactions to see analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <TransactionCharts
            transactions={transactions}
            userAddress={userAddress}
            gasStats={{
              totalGasFees: stats.totalGasFees,
              categoryGasFees: Object.fromEntries(
                Object.entries(stats.categoryBreakdown).map(([k, v]) => [
                  k,
                  v.gasFees,
                ])
              ),
            }}
          />

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Category Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.categoryBreakdown).map(
                ([category, data]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {category}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transactions:</span>
                        <span className="text-gray-900">{data.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="text-gray-900">
                          {Number(formatEther(data.value)).toFixed(1)} SHM
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
