"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cashStart: number) => Promise<void>;
};

export default function OpenShiftModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [cashStart, setCashStart] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const value = Number(cashStart);

    if (!value || value <= 0) {
      alert("Please enter a valid cash start amount");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(value);
      setCashStart("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to open shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-2">Open Shift</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter starting cash amount
        </p>

        <input
          type="number"
          placeholder="e.g. 550000"
          value={cashStart}
          onChange={(e) => setCashStart(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            {loading ? "Opening..." : "Start Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}