import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  error?: string;
}

export const TransactionFailurePopup: React.FC<Props> = ({
  isOpen,
  onClose,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Popup Content */}
      <div className="relative bg-white rounded-lg px-6 py-4 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Transaction Failed
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {error ||
                  "Your transaction could not be completed. Please try again."}
              </p>
            </div>
          </div>
          <button className="flex-shrink-0 ml-4" onClick={onClose}>
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
