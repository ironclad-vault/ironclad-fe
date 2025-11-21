"use client";

import React, { useState, useEffect } from "react";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { BitcoinTxProof } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";

interface TransactionProofCardProps {
  vaultId: bigint;
  proofType: "deposit" | "withdraw";
  className?: string;
}

/**
 * TransactionProofCard
 * Displays Bitcoin transaction proof details (txid, confirmations, status)
 * Fetches proof data from backend and renders it with copy functionality
 */
export function TransactionProofCard({
  vaultId,
  proofType,
  className = "",
}: TransactionProofCardProps) {
  const [proof, setProof] = useState<BitcoinTxProof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProof();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId, proofType]);

  const fetchProof = async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        proofType === "deposit"
          ? await ironcladClient.bitcoinProofs.getDepositProof(vaultId)
          : await ironcladClient.bitcoinProofs.getWithdrawProof(vaultId);

      if ("Ok" in result) {
        setProof(result.Ok);
      } else {
        setError(result.Err);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(`[TransactionProofCard] Failed to fetch ${proofType} proof:`, err);
    } finally {
      setLoading(false);
    }
  };

  const copyTxid = () => {
    if (proof?.txid) {
      navigator.clipboard.writeText(proof.txid);
      toast.success("Transaction ID copied!");
    }
  };

  const proofTypeLabel = proofType === "deposit" ? "DEPOSIT" : "WITHDRAWAL";

  if (loading) {
    return (
      <div className={`card-pro p-6 bg-gray-50 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-body text-sm text-gray-600">
            Loading {proofType} proof...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-pro p-6 bg-gray-50 border-gray-300 ${className}`}>
        <div className="flex justify-between items-start mb-2!">
          <h4 className="text-heading text-sm font-bold text-gray-700">
            {proofTypeLabel} PROOF
          </h4>
          <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">
            NOT AVAILABLE
          </span>
        </div>
        <p className="text-body text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className={`card-pro p-6 bg-gray-50 border-gray-300 ${className}`}>
        <div className="flex justify-between items-start mb-2!">
          <h4 className="text-heading text-sm font-bold text-gray-700">
            {proofTypeLabel} PROOF
          </h4>
          <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">
            NO PROOF
          </span>
        </div>
        <p className="text-body text-xs text-gray-500">
          No {proofType} transaction proof available for this vault.
        </p>
      </div>
    );
  }

  const statusColor = proof.confirmed
    ? "bg-green-100 text-green-900 border-green-300"
    : "bg-yellow-100 text-yellow-900 border-yellow-300";

  const statusLabel = proof.confirmed ? "CONFIRMED" : "PENDING";

  return (
    <div className={`card-pro p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4!">
        <h4 className="text-heading text-sm font-bold">
          {proofTypeLabel} PROOF
        </h4>
        <span
          className={`px-2 py-1 text-xs font-bold border-2 rounded ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        {/* Transaction ID */}
        <div>
          <p className="text-body text-xs text-gray-600 font-bold mb-1!">
            Transaction ID
          </p>
          <div className="flex items-center gap-2">
            <code className="text-body font-mono text-xs bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
              {proof.txid}
            </code>
            <button
              onClick={copyTxid}
              className="btn-pro py-1 px-2 text-xs whitespace-nowrap"
              title="Copy transaction ID"
            >
              COPY
            </button>
          </div>
        </div>

        {/* Confirmations */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-body text-xs text-gray-600 font-bold mb-1!">
              Confirmations
            </p>
            <p className="text-heading text-lg">
              {proof.confirmations.toString()}
            </p>
          </div>
          <div>
            <p className="text-body text-xs text-gray-600 font-bold mb-1!">
              Status
            </p>
            <p className="text-heading text-lg">{statusLabel}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="border-t-2 border-gray-200 pt-3">
          <p className="text-body text-xs text-gray-500">
            {proof.confirmed
              ? `This transaction has been confirmed with ${proof.confirmations} confirmations on the Bitcoin network.`
              : `This transaction is pending confirmation. Current confirmations: ${proof.confirmations}`}
          </p>
        </div>
      </div>
    </div>
  );
}
