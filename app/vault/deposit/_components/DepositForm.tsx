"use client";

import { useState } from "react";

export default function DepositForm() {
  const [lockDuration, setLockDuration] = useState<string>("6 MONTHS");
  const [generatedAddress, setGeneratedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateAddress = async () => {
    setIsLoading(true);

    // Mock async call to generate address
    setTimeout(() => {
      const mockAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
      setGeneratedAddress(mockAddress);
      setIsLoading(false);
    }, 1000);
  };

  const handleCopyAddress = () => {
    if (generatedAddress) {
      navigator.clipboard.writeText(generatedAddress);
      // In a real app, you might show a toast notification here
    }
  };

  return (
    <div className="card-brutal flex flex-col gap-8">
      <h3 className="heading-brutal text-xl">INITIATE NEW VAULT</h3>

      {!generatedAddress ? (
        <>
          <div className="mb-6">
            <label className="body-brutal text-sm font-bold mb-2 block">
              LOCK DURATION
            </label>
            <select
              className="input-brutal"
              value={lockDuration}
              onChange={(e) => setLockDuration(e.target.value)}
            >
              <option value="6 MONTHS">6 MONTHS</option>
              <option value="1 YEAR">1 YEAR</option>
              <option value="5 YEARS">5 YEARS</option>
            </select>
          </div>

          <button
            className="button-brutal accent w-full"
            onClick={handleGenerateAddress}
            disabled={isLoading}
          >
            {isLoading ? "GENERATING..." : "GENERATE ADDRESS"}
          </button>
        </>
      ) : (
        <div className="mt-6">
          <div className="mb-4">
            <label className="body-brutal text-sm font-bold mb-2 block">
              DEPOSIT ADDRESS
            </label>
            <div className="mono-brutal bg-(--color-bg-white) border-2 border-black p-4 text-lg break-all">
              {generatedAddress}
            </div>
          </div>

          <button
            className="button-brutal w-full mb-4"
            onClick={handleCopyAddress}
          >
            COPY ADDRESS
          </button>

          <div className="bg-red-100 border-2 border-red-500 p-4">
            <p className="body-brutal font-bold text-red-800">
              WARNING: SEND BTC ONLY. DO NOT SEND CKBTC OR OTHER ASSETS TO THIS
              ADDRESS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
