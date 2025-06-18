import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string; // Optional for custom sizing/positioning
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-white border border-gray-300 shadow-lg p-6 w-full max-w-lg mx-auto ${className}`}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
