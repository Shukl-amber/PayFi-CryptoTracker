import React, { useState, useEffect } from "react";
import { walletService } from "../utils/wallet";
import { Info } from "lucide-react";

interface SendTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendTokensModal: React.FC<SendTokensModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  } | null>(null);

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setNote("");
    setError(null);
    setGasEstimate(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Estimate gas when recipient and amount are valid
  useEffect(() => {
    const estimateGas = async () => {
      if (!recipient || !amount || parseFloat(amount) <= 0) {
        setGasEstimate(null);
        return;
      }

      try {
        const estimate = await walletService.estimateGas(recipient, amount);
        setGasEstimate(estimate);
      } catch (err) {
        console.warn("Gas estimation failed:", err);
        setGasEstimate(null);
      }
    };

    estimateGas();
  }, [recipient, amount]);

  const validateForm = () => {
    if (!recipient) {
      setError("Please enter a recipient address");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const txHash = await walletService.sendTransaction(recipient, amount);

      // Save note if provided
      if (note.trim()) {
        const notes = JSON.parse(
          localStorage.getItem("transaction_notes") || "{}"
        );
        notes[txHash] = note.trim();
        localStorage.setItem("transaction_notes", JSON.stringify(notes));
      }

      console.log("Transaction sent:", txHash);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send transaction");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Send Tokens</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0x..."
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Amount (SHM)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.0001"
              min="0"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
            />
          </div>

          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Note (Optional)
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this for?"
            />
          </div>

          {gasEstimate && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
              <div className="flex items-center text-blue-400 mb-2">
                <Info className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Estimated Transaction Costs
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Gas Price:</span>
                  <span className="text-white ml-2">
                    {gasEstimate.gasPrice} Gwei
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Gas Limit:</span>
                  <span className="text-white ml-2">
                    {gasEstimate.gasLimit}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Estimated Cost:</span>
                  <span className="text-white ml-2">
                    {gasEstimate.estimatedCost} SHM
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg 
                     transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                     text-white rounded-lg transition-colors duration-200 relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
