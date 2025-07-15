import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveSankey } from "@nivo/sankey";
import { Transaction } from "../../types";
import { formatEther } from "ethers";

interface Props {
  transactions: Transaction[];
  userAddress: string;
  gasStats: {
    totalGasFees: bigint;
    categoryGasFees: Record<string, bigint>;
  };
}

interface Node {
  id: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface ChartData {
  categoryData: {
    id: string;
    label: string;
    value: number;
  }[];
  sankeyData: {
    nodes: Node[];
    links: Link[];
  };
  totalSpent: number;
  gasSpent: number;
}

const prepareChartData = (
  transactions: Transaction[],
  userAddress: string,
  gasStats: Props["gasStats"]
): ChartData => {
  const categories = new Map<string, bigint>();
  const categoryGasUsage = new Map<string, bigint>();

  // Process transactions
  transactions.forEach((tx) => {
    if (tx.from.toLowerCase() === userAddress.toLowerCase()) {
      const category = tx.category || "Uncategorized";
      const value = BigInt(tx.value);

      // Add transaction value to category total
      categories.set(category, (categories.get(category) || 0n) + value);

      // Calculate and track gas fees for this transaction
      if (tx.gasUsed && tx.gasPrice) {
        const gasFees = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
        categoryGasUsage.set(
          category,
          (categoryGasUsage.get(category) || 0n) + gasFees
        );
      }
    }
  });

  // Calculate total spent and gas spent
  const totalSpent = Array.from(categories.values()).reduce(
    (acc, val) => acc + Number(formatEther(val)),
    0
  );
  const gasSpent = Number(formatEther(gasStats.totalGasFees));

  // Prepare pie chart data
  const categoryData = Array.from(categories.entries()).map(
    ([category, value]) => ({
      id: category,
      label: category,
      value: Number(formatEther(value)),
    })
  );

  // Add gas fees to pie chart if there are any
  if (gasStats.totalGasFees > 0n) {
    categoryData.push({
      id: "Gas Fees",
      label: "Gas Fees",
      value: gasSpent,
    });
  }

  // Prepare Sankey diagram data
  const nodes: Node[] = [
    { id: "Wallet" },
    ...Array.from(categories.keys()).map((category) => ({ id: category })),
    { id: "Gas Fees" },
  ];

  const links: Link[] = [
    // Category flows from wallet
    ...Array.from(categories.entries()).map(([category, value]) => ({
      source: "Wallet",
      target: category,
      value: Number(formatEther(value)),
    })),
    // Gas fee flows from categories
    ...Array.from(categoryGasUsage.entries())
      .filter(([_, value]) => value > 0n)
      .map(([category, gasFees]) => ({
        source: category,
        target: "Gas Fees",
        value: Number(formatEther(gasFees)),
      })),
  ];

  return {
    categoryData,
    sankeyData: { nodes, links: links.filter((link) => link.value > 0) },
    totalSpent,
    gasSpent,
  };
};

export const TransactionCharts: React.FC<Props> = ({
  transactions,
  userAddress,
  gasStats,
}) => {
  const chartData = prepareChartData(transactions, userAddress, gasStats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Expense Categories Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Expense Categories (Total: {chartData.totalSpent.toFixed(1)} SHM)
        </h3>
        <div className="h-80">
          <ResponsivePie
            data={chartData.categoryData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            arcLabel={function (d: { value: number }) {
              return `${d.value.toFixed(1)} SHM`;
            }}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
              },
            ]}
          />
        </div>
      </div>

      {/* Transaction Flow Sankey Diagram */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transaction Flow (Gas Fees: {chartData.gasSpent.toFixed(1)} SHM)
        </h3>
        <div className="h-80">
          <ResponsiveSankey
            data={chartData.sankeyData}
            margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
            align="justify"
            colors={{ scheme: "category10" }}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{
              from: "color",
              modifiers: [["darker", 0.8]],
            }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            enableLinkGradient={true}
            label={function (node: { id: string; value?: number }) {
              return `${node.id} (${node.value?.toFixed(1) ?? "0.0000"} SHM)`;
            }}
          />
        </div>
      </div>
    </div>
  );
};
