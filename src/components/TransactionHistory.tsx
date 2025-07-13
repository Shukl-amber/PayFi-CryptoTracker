import React, { useState } from "react";
import { Transaction } from "../types";
import { formatEther } from "ethers";

interface Props {
  transactions: Transaction[];
  userAddress: string | null;
  onUpdateNote: (hash: string, note: string) => void;
  onUpdateCategory: (hash: string, category: string) => void;
}

export const TransactionHistory: React.FC<Props> = ({
  transactions,
  userAddress,
  onUpdateNote,
  onUpdateCategory,
}) => {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [categoryText, setCategoryText] = useState("");

  const startEditingNote = (tx: Transaction) => {
    setEditingNote(tx.hash);
    setNoteText(tx.note || "");
  };

  const startEditingCategory = (tx: Transaction) => {
    setEditingCategory(tx.hash);
    setCategoryText(tx.category || "");
  };

  const saveNote = (hash: string) => {
    onUpdateNote(hash, noteText);
    setEditingNote(null);
  };

  const saveCategory = (hash: string) => {
    onUpdateCategory(hash, categoryText);
    setEditingCategory(null);
  };

  const categories = ["Transfer", "Purchase", "Sale", "Fee", "Other"];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Always show successful status in green
  const getStatusDisplay = () => {
    return {
      text: "Successful",
      color: "bg-green-100 text-green-800",
    };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From/To
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => {
              const isSender =
                tx.from.toLowerCase() === userAddress?.toLowerCase();
              return (
                <tr key={tx.hash} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isSender ? "Sent" : "Received"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isSender
                      ? `To: ${formatAddress(tx.to)}`
                      : `From: ${formatAddress(tx.from)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatEther(tx.value)} SHM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Successful
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingCategory === tx.hash ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={categoryText}
                          onChange={(e) => setCategoryText(e.target.value)}
                          className="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveCategory(tx.hash)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{tx.category || "None"}</span>
                        <button
                          onClick={() => startEditingCategory(tx)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingNote === tx.hash ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add a note..."
                        />
                        <button
                          onClick={() => saveNote(tx.hash)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{tx.note || "No note"}</span>
                        <button
                          onClick={() => startEditingNote(tx)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
