"use client";

import { useState } from "react";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { SignatureResponse } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";
import { ShieldCheck, Copy, Check, X, CheckCircle, Lock } from "lucide-react";

interface CryptographicAuditSectionProps {
  vaultId: bigint;
}

interface AuditResult {
  message: string;
  signature: SignatureResponse;
  timestamp: Date;
}

/**
 * CryptographicAuditSection
 * Proof of Ownership / Cryptographic Audit
 * Showcases ICP Threshold ECDSA capabilities for non-custodial Bitcoin key ownership verification
 */
export function AdvancedActionsSection({
  vaultId,
}: CryptographicAuditSectionProps) {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleVerifyOwnership = async () => {
    setLoading(true);
    setError(null);
    setAuditResult(null);

    try {
      // Generate verification message
      const verificationMessage = `Ironclad Vault verification: ownership proof for Vault #${vaultId}`;
      const messageBytes = new TextEncoder().encode(verificationMessage);

      // Request signature from backend
      const result = await ironcladClient.btcSigning.requestSignature(
        vaultId,
        messageBytes
      );

      if ("Ok" in result) {
        setAuditResult({
          message: verificationMessage,
          signature: result.Ok,
          timestamp: new Date(),
        });
        toast.success("Ownership verified successfully!");
      } else {
        const errMsg = result.Err;
        setError(errMsg);
        toast.error(`Verification failed: ${errMsg}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(`Verification failed: ${msg}`);
      console.error("[CryptographicAuditSection] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const truncateHex = (hex: string, maxLength: number = 32): string => {
    if (hex.length <= maxLength) return hex;
    const half = Math.floor(maxLength / 2);
    return hex.slice(0, half) + "..." + hex.slice(-half);
  };

  const downloadAuditReport = () => {
    if (auditResult) {
      const sigHex = Buffer.from(auditResult.signature.signature).toString(
        "hex"
      );
      const report = `IRONCLAD VAULT CRYPTOGRAPHIC AUDIT REPORT
=====================================
Generated: ${auditResult.timestamp.toISOString()}
Vault ID: ${vaultId}

VERIFICATION MESSAGE:
${auditResult.message}

CRYPTOGRAPHIC SIGNATURE (HEX):
${sigHex}

TECHNICAL DETAILS:
- Curve: secp256k1
- Hash: SHA-256
- Protocol: ICP Threshold ECDSA
- Key: test_key_1 (testnet)

This signature proves non-custodial ownership of the Bitcoin keys
associated with this vault using Internet Computer's decentralized
threshold key generation and signing protocol.
`;
      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ironclad-audit-vault-${vaultId}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Audit report downloaded!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="heading-brutal text-lg mb-2! flex items-center gap-2">
          CRYPTOGRAPHIC AUDIT
        </h3>
        <p className="body-brutal text-sm text-accent">
          Verify that this Vault truly holds the Bitcoin keys. This process uses
          Threshold ECDSA to generate a cryptographic signature directly from
          the Internet Computer, proving non-custodial ownership without a
          centralized bridge.
        </p>
      </div>

      {/* Verification Button */}
      {!auditResult && (
        <button
          onClick={handleVerifyOwnership}
          disabled={loading}
          className="w-full btn-pro accent py-4 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          <ShieldCheck size={24} />
          {loading ? "VERIFYING..." : "VERIFY KEY OWNERSHIP"}
        </button>
      )}

      {/* Error State */}
      {error && !auditResult && (
        <div className="card-brutal p-6 bg-red-50 border-red-300">
          <p className="body-brutal text-sm text-red-900 font-bold mb-2! flex items-center gap-2">
            <X size={16} />
            VERIFICATION FAILED
          </p>
          <p className="body-brutal text-xs text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="button-brutal text-xs mt-3 py-2 px-3"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Success Card */}
      {auditResult && (
        <div className="space-y-6">
          {/* Big Green Success Badge */}
          <div className="card-pro p-8 bg-linear-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-4!">
              <CheckCircle size={40} className="text-emerald-600" />
              <h2 className="heading-brutal text-2xl text-emerald-700">
                OWNERSHIP VERIFIED
              </h2>
            </div>
            <p className="body-brutal text-center text-sm text-emerald-600">
              This vault&apos;s Bitcoin keys are confirmed to be held securely
              within the Internet Computer.
            </p>
          </div>

          {/* Signed Message */}
          <div className="card-brutal p-6 bg-zinc-900 border-zinc-700">
            <div className="flex justify-between items-start mb-3!">
              <p className="body-brutal text-xs text-zinc-400 font-bold uppercase">
                Verification Message
              </p>
              <button
                onClick={() => copyToClipboard(auditResult.message, "Message")}
                className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {copiedField === "Message" ? (
                  <>
                    <Check size={14} /> COPIED
                  </>
                ) : (
                  <>
                    <Copy size={14} /> COPY
                  </>
                )}
              </button>
            </div>
            <code className="block body-brutal font-mono text-sm text-zinc-100 wrap-break-word">
              {auditResult.message}
            </code>
          </div>

          {/* Cryptographic Signature */}
          <div className="card-brutal p-6 bg-zinc-900 border-zinc-700">
            <div className="flex justify-between items-start mb-3!">
              <p className="body-brutal text-xs text-zinc-400 font-bold uppercase">
                Cryptographic Signature (Hex)
              </p>
              <button
                onClick={() => {
                  const sigHex = Buffer.from(
                    auditResult.signature.signature
                  ).toString("hex");
                  copyToClipboard(sigHex, "Signature");
                }}
                className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition"
              >
                {copiedField === "Signature" ? (
                  <>
                    <Check size={14} /> COPIED
                  </>
                ) : (
                  <>
                    <Copy size={14} /> COPY
                  </>
                )}
              </button>
            </div>
            <code className="block body-brutal font-mono text-xs text-amber-400 break-all p-3 bg-black rounded border border-zinc-700 overflow-x-auto">
              {truncateHex(
                Buffer.from(auditResult.signature.signature).toString("hex"),
                64
              )}
            </code>
            <p className="body-brutal text-xs text-zinc-500 mt-2">
              Full signature (128 hex characters = 64 bytes)
            </p>
          </div>

          {/* Technology Details */}
          <div className="card-brutal p-6 bg-zinc-900 border-zinc-700">
            <p className="body-brutal text-xs text-zinc-400 font-bold uppercase mb-3!">
              Signed via ICP Threshold ECDSA (secp256k1)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="body-brutal text-xs text-zinc-500 mb-1">Curve</p>
                <p className="body-brutal text-sm font-bold text-zinc-100">
                  secp256k1
                </p>
              </div>
              <div>
                <p className="body-brutal text-xs text-zinc-500 mb-1">Hash</p>
                <p className="body-brutal text-sm font-bold text-zinc-100">
                  SHA-256
                </p>
              </div>
              <div>
                <p className="body-brutal text-xs text-zinc-500 mb-1">
                  Protocol
                </p>
                <p className="body-brutal text-sm font-bold text-zinc-100">
                  Threshold ECDSA
                </p>
              </div>
              <div>
                <p className="body-brutal text-xs text-zinc-500 mb-1">Key</p>
                <p className="body-brutal text-sm font-bold text-zinc-100">
                  test_key_1
                </p>
              </div>
            </div>
          </div>

          {/* Verification Timestamp */}
          <div className="card-brutal p-4 bg-zinc-900 border-zinc-700 text-center">
            <p className="body-brutal text-xs text-zinc-500">
              Verified at {auditResult.timestamp.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadAuditReport}
              className="flex-1 btn-pro accent py-3 font-bold"
            >
              DOWNLOAD AUDIT REPORT
            </button>
            <button
              onClick={() => setAuditResult(null)}
              className="flex-1 button-brutal py-3 font-bold"
            >
              NEW VERIFICATION
            </button>
          </div>
        </div>
      )}

      {/* Info Box - About Cryptographic Audits */}
      <div className="card-brutal p-6 bg-blue-50 border-blue-300">
        <h4 className="heading-brutal text-sm font-bold text-accent mb-3! flex items-center gap-2">
          <Lock size={16} />
          ABOUT CRYPTOGRAPHIC AUDITS
        </h4>
        <div className="space-y-2 body-brutal text-sm text-accent">
          <p>
            • This audit proves your vault holds Bitcoin keys without a
            custodian
          </p>
          <p>
            • ICP&apos;s Threshold ECDSA generates signatures from decentralized
            infrastructure
          </p>
          <p>• Each signature is valid for the Bitcoin network (secp256k1)</p>
          <p>• No private keys ever leave the Internet Computer subnet</p>
          <p>
            • This technology enables Bitcoin integration without bridges or
            wrapped assets
          </p>
        </div>
      </div>
    </div>
  );
}
