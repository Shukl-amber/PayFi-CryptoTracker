import React, { useState, useEffect } from "react";
import { walletService } from "../utils/wallet";
import { TransactionFailurePopup } from "./TransactionFailurePopup";

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (
    to: string,
    amount: string,
    category: string,
    note: string
  ) => Promise<void>;
}

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
}

export const SendTokenModal: React.FC<SendTokenModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFailurePopup, setShowFailurePopup] = useState(false);

  const categories = ["Transfer", "Purchase", "Sale", "Fee", "Other"];

  const updateGasEstimate = async () => {
    if (!recipient || !amount) {
      setGasEstimate(null);
      return;
    }

    try {
      setEstimateError(null);
      const estimate = await walletService.estimateGas(recipient, amount);
      setGasEstimate(estimate);
    } catch (error: any) {
      setEstimateError(error.message || "Failed to estimate gas");
      setGasEstimate(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(updateGasEstimate, 500);
    return () => clearTimeout(timer);
  }, [recipient, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSend(recipient, amount, category, note);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
      setErrorMessage(message);
      setShowFailurePopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setShowFailurePopup(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Send Tokens
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="to"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recipient Address
                </label>
                <input
                  type="text"
                  id="to"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount (SHM)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.0"
                  step="0.000000000000000001"
                  min="0"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700"
                >
                  Note
                </label>
                <input
                  type="text"
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a note..."
                />
              </div>

              {/* Gas Estimate Section */}
              {(gasEstimate || estimateError) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Transaction Details
                  </h4>
                  {gasEstimate ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gas Limit:</span>
                        <span className="text-gray-900">
                          {gasEstimate.gasLimit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gas Price:</span>
                        <span className="text-gray-900">
                          {gasEstimate.gasPrice} Gwei
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-600">
                          Estimated Gas Fee:
                        </span>
                        <span className="text-gray-900">
                          {gasEstimate.estimatedCost} SHM
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">{estimateError}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !recipient || !amount || !gasEstimate
                  }
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <TransactionFailurePopup
        isOpen={showFailurePopup}
        onClose={() => setShowFailurePopup(false)}
        error={errorMessage || "Transaction could not be completed"}
      />
    </>
  );
};
