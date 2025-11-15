/**
 * Vault Debug Page
 * Smoke test for ICP connection and actor creation
 * Temporary page for testing - can be deleted after verification
 */

'use client';

import React from 'react';
import { useMyVaults } from '@/hooks/useMyVaults';

export default function VaultDebugPage() {
  const { data, loading, error, refetch } = useMyVaults();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-lg font-medium">Loading vaults from ICP...</p>
          <p className="text-sm text-gray-600 mt-2">Connecting to canister...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="border-4 border-red-600 bg-white p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Connection Error</h1>
            <div className="bg-red-100 border-2 border-red-600 p-4 mb-4">
              <p className="font-mono text-sm text-red-900">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 border-2 border-black transition-colors"
            >
              Retry Connection
            </button>
            <div className="mt-6 text-sm space-y-2 text-gray-700">
              <p className="font-bold">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check if dfx replica is running: <code className="bg-gray-200 px-2 py-1">dfx start --background</code></li>
                <li>Verify backend canister is deployed: <code className="bg-gray-200 px-2 py-1">dfx deploy ironclad_vault_backend</code></li>
                <li>Check environment variables in <code className="bg-gray-200 px-2 py-1">.env.local</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-black bg-white p-8 mb-6">
          <h1 className="text-4xl font-bold mb-2">🧪 ICP Connection Test</h1>
          <p className="text-gray-600">
            Successfully connected to Ironclad Vault Backend canister
          </p>
        </div>

        <div className="border-4 border-black bg-green-50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✅</span>
            <div>
              <h2 className="text-xl font-bold text-green-900">Connection Successful</h2>
              <p className="text-sm text-green-700">Actor created and canister is responsive</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-gray-700">Vaults Found:</p>
              <p className="text-2xl font-bold text-green-900">{data?.length ?? 0}</p>
            </div>
            <div>
              <p className="font-bold text-gray-700">Status:</p>
              <p className="text-lg font-bold text-green-900">CONNECTED</p>
            </div>
          </div>
        </div>

        <div className="border-4 border-black bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Vault Data</h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 border-2 border-black transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {Array.from(data).map((vault, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-300 bg-gray-50 p-4"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-bold">ID:</span> {vault.id.toString()}
                    </div>
                    <div>
                      <span className="font-bold">Balance:</span> {vault.balance.toString()} sats
                    </div>
                    <div>
                      <span className="font-bold">Status:</span>{' '}
                      {Object.keys(vault.status)[0]}
                    </div>
                    <div>
                      <span className="font-bold">Owner:</span>{' '}
                      {vault.owner.toString().slice(0, 10)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No vaults found</p>
              <p className="text-sm">Create your first vault to see data here</p>
            </div>
          )}

          <pre className="mt-6 border-2 border-black p-4 text-xs overflow-auto bg-gray-900 text-green-400 font-mono max-h-96">
            {JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)}
          </pre>
        </div>

        <div className="mt-6 border-4 border-yellow-600 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-900">
            <span className="font-bold">Note:</span> This is a debug page for testing ICP connectivity.
            Delete <code className="bg-yellow-200 px-2 py-1">/app/vault-debug/page.tsx</code> after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
