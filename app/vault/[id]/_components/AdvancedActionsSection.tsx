"use client";

import React, { useState } from "react";
import { ironcladClient } from "@/lib/ic/ironcladClient";
import type { SignatureResponse } from "@/lib/ic/ironcladActor";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/toastUtils";
import { Info } from "lucide-react";

interface AdvancedActionsSectionProps {
  vaultId: bigint;
}

/**
 * AdvancedActionsSection
 * Advanced Bitcoin operations: threshold ECDSA signature requests
 * For signing withdrawal transactions or proving vault ownership
 */
export function AdvancedActionsSection({
  vaultId,
}: AdvancedActionsSectionProps) {
  const [message, setMessage] = useState("");
  const [signatureResponse, setSignatureResponse] =
    useState<SignatureResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSignature = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message to sign");
      return;
    }

    setLoading(true);
    setError(null);
    setSignatureResponse(null);

    try {
      // Encode message as bytes (Uint8Array)
      const messageBytes = new TextEncoder().encode(message);

      // Request signature from backend
      const result = await ironcladClient.btcSigning.requestSignature(
        vaultId,
        messageBytes
      );

      if ("Ok" in result) {
        setSignatureResponse(result.Ok);
        toast.success("Signature generated successfully!");
      } else {
        const errMsg = result.Err;
        setError(errMsg);
        toast.error(`Signature failed: ${errMsg}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(`Signature request failed: ${msg}`);
      console.error("[AdvancedActionsSection] Signature error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    setSignatureResponse(null);
    setError(null);
    setMessage("");
  };

  const copySignatureHex = () => {
    if (signatureResponse) {
      const sigHex = Buffer.from(signatureResponse.signature).toString("hex");
      navigator.clipboard.writeText(sigHex);
      toast.success("Signature (hex) copied!");
    }
  };

  const copySignatureBase64 = () => {
    if (signatureResponse) {
      const sigBase64 = Buffer.from(signatureResponse.signature).toString(
        "base64"
      );
      navigator.clipboard.writeText(sigBase64);
      toast.success("Signature (base64) copied!");
    }
  };

  const downloadSignature = () => {
    if (signatureResponse) {
      const sigHex = Buffer.from(signatureResponse.signature).toString("hex");
      const blob = new Blob([sigHex], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vault-${vaultId}-signature.sig`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Signature file downloaded!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="heading-brutal text-lg mb-2">
          BITCOIN THRESHOLD SIGNING
        </h3>
        <p className="body-brutal text-sm text-gray-300">
          Request a threshold ECDSA signature (secp256k1) for this vault using
          ICP&apos;s Bitcoin integration. Use this to sign withdrawal
          transactions or prove vault ownership.
        </p>
      </div>

      {/* Signature Request Form */}
      <div className="card-brutal p-6">
        <h4 className="heading-brutal text-sm font-bold mb-4">
          REQUEST SIGNATURE
        </h4>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="signatureMessage"
              className="body-brutal text-sm font-bold mb-2 block"
            >
              Message to Sign
            </label>
            <textarea
              id="signatureMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message to sign (will be SHA-256 hashed)"
              rows={4}
              className="w-full font-mono text-sm p-3 border-2 border-black rounded focus:outline-none focus:border-blue-600"
              disabled={loading}
            />
            <p className="body-brutal text-xs text-gray-400 mt-1">
              The message will be encoded as UTF-8 bytes and signed using the
              vault&apos;s threshold ECDSA key (test_key_1 on testnet).
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRequestSignature}
              disabled={loading || !message.trim()}
              className="button-brutal accent px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "GENERATING SIGNATURE..." : "REQUEST SIGNATURE"}
            </button>

            {signatureResponse && (
              <button
                onClick={clearSignature}
                className="button-brutal px-6 py-3 font-bold"
              >
                CLEAR
              </button>
            )}
          </div>

          {error && !signatureResponse && (
            <div className="card-brutal p-4 bg-red-50 border-red-300">
              <p className="body-brutal text-sm text-red-900 font-bold mb-1">
                ❌ SIGNATURE FAILED
              </p>
              <p className="body-brutal text-xs text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature Response Display */}
      {signatureResponse && (
        <div className="card-brutal p-6 bg-green-50 border-green-300">
          <div className="flex justify-between items-start mb-4">
            <h4 className="heading-brutal text-sm font-bold text-green-900">
              ✓ SIGNATURE GENERATED
            </h4>
            <span className="px-2 py-1 text-xs font-bold bg-green-200 text-green-900 rounded">
              64 BYTES
            </span>
          </div>

          <div className="space-y-4">
            {/* Signature (Hex) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="body-brutal text-xs text-gray-300 uppercase font-bold">
                  Signature (Hex)
                </p>
                <button
                  onClick={copySignatureHex}
                  className="button-brutal py-1 px-3 text-xs"
                  title="Copy hex signature"
                >
                  COPY HEX
                </button>
              </div>
              <code className="block body-brutal font-mono text-xs bg-white p-3 rounded border-2 border-green-300 overflow-x-auto">
                {Buffer.from(signatureResponse.signature).toString("hex")}
              </code>
            </div>

            {/* Signature (Base64) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="body-brutal text-xs text-gray-300 uppercase font-bold">
                  Signature (Base64)
                </p>
                <button
                  onClick={copySignatureBase64}
                  className="button-brutal py-1 px-3 text-xs"
                  title="Copy base64 signature"
                >
                  COPY BASE64
                </button>
              </div>
              <code className="block body-brutal font-mono text-xs bg-white p-3 rounded border-2 border-green-300 overflow-x-auto">
                {Buffer.from(signatureResponse.signature).toString("base64")}
              </code>
            </div>

            {/* Message (Original) */}
            <div>
              <p className="body-brutal text-xs text-gray-300 uppercase font-bold mb-2">
                Original Message
              </p>
              <code className="block body-brutal font-mono text-xs bg-white p-3 rounded border-2 border-green-300 overflow-x-auto">
                {new TextDecoder().decode(
                  new Uint8Array(signatureResponse.message)
                )}
              </code>
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t-2 border-green-300 pt-4">
              <div>
                <p className="body-brutal text-xs text-gray-400 uppercase mb-1">
                  Curve
                </p>
                <p className="body-brutal font-bold text-sm">secp256k1</p>
              </div>
              <div>
                <p className="body-brutal text-xs text-gray-400 uppercase mb-1">
                  Hash
                </p>
                <p className="body-brutal font-bold text-sm">SHA-256</p>
              </div>
              <div>
                <p className="body-brutal text-xs text-gray-400 uppercase mb-1">
                  Key
                </p>
                <p className="body-brutal font-bold text-sm">test_key_1</p>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadSignature}
              className="button-brutal w-full py-3 font-bold"
            >
              DOWNLOAD SIGNATURE FILE (.sig)
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card-brutal p-6 bg-blue-50 border-blue-300">
        <h4 className="heading-brutal text-sm font-bold text-blue-900 mb-2! flex flex-row items-center gap-2">
          <Info className="inline-block w-4 h-4 mr-2" />
          ABOUT THRESHOLD SIGNATURES
        </h4>
        <div className="space-y-2 body-brutal text-sm text-blue-900">
          <p>
            • Threshold ECDSA signatures are generated using ICP&apos;s
            decentralized key generation protocol
          </p>
          <p>
            • The signature is valid for the Bitcoin network (secp256k1 curve)
          </p>
          <p>
            • Testnet uses{" "}
            <code className="font-mono bg-blue-100 px-1">test_key_1</code>,
            production will use{" "}
            <code className="font-mono bg-blue-100 px-1">key_1</code>
          </p>
          <p>
            • Signature generation costs ~30 billion cycles (automatically
            included)
          </p>
          <p>
            • Use this for Bitcoin withdrawal transactions or external
            verification
          </p>
        </div>
      </div>
    </div>
  );
}
