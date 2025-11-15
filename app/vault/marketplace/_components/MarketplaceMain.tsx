"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useMarketplace } from "@/hooks/ironclad/useMarketplace";
import { useVaults } from "@/hooks/ironclad/useVaults";
import type { MarketListing } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";

export default function MarketplaceMain() {
  const { isConnected, principal } = useWallet();
  const { listings, myListings, loading, error, createListing, cancelListing, buyListing } = useMarketplace();
  const { vaults } = useVaults();

  const [activeTab, setActiveTab] = useState<"browse" | "my-listings">("browse");
  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [priceSats, setPriceSats] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const handleCreateListing = async () => {
    if (!selectedVaultId || !priceSats) {
      alert("Please select a vault and enter a price");
      return;
    }

    setCreating(true);
    try {
      await createListing(BigInt(selectedVaultId), BigInt(priceSats));
      alert("Listing created successfully!");
      setSelectedVaultId("");
      setPriceSats("");
    } catch (err) {
      console.error("Create listing failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelListing = async (listingId: bigint) => {
    if (!confirm("Are you sure you want to cancel this listing?")) {
      return;
    }

    await cancelListing(listingId);
  };

  const handleBuyListing = async (listingId: bigint, priceSats: bigint) => {
    if (!confirm(`Are you sure you want to buy this vault for ${Number(priceSats) / 100_000_000} BTC?`)) {
      return;
    }

    await buyListing(listingId);
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access the marketplace.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Create Listing */}
      <div className="border-2 border-black p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Create Marketplace Listing</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Select Vault</label>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full border-2 border-black px-4 py-2 bg-white"
            >
              <option value="">-- Select a vault --</option>
              {vaults.map((vault) => (
                <option key={vault.id.toString()} value={vault.id.toString()}>
                  Vault {vault.id.toString().slice(0, 8)} - {Number(vault.balance) / 100_000_000} BTC
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Price (BTC)</label>
            <input
              type="number"
              step="0.00000001"
              value={priceSats}
              onChange={(e) => setPriceSats(e.target.value)}
              placeholder="0.00000000"
              className="w-full border-2 border-black px-4 py-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              Enter price in BTC (will be converted to satoshis)
            </p>
          </div>

          <button
            onClick={handleCreateListing}
            disabled={!selectedVaultId || !priceSats || creating}
            className="w-full bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-2 border-black bg-white">
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 px-6 py-3 font-bold border-r-2 border-black ${
              activeTab === "browse" ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            Browse Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("my-listings")}
            className={`flex-1 px-6 py-3 font-bold ${
              activeTab === "my-listings" ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            My Listings ({myListings.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === "browse" ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Browse Active Listings</h2>
              {listings.length === 0 ? (
                <p className="text-gray-600">No active listings available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <div key={listing.id.toString()} className="border-2 border-black p-4 bg-gray-50">
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Listing ID</p>
                        <p className="font-mono text-sm">{listing.id.toString()}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Vault ID</p>
                        <p className="font-mono text-sm">{listing.vault_id.toString()}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="text-2xl font-bold">
                          {Number(listing.price_sats) / 100_000_000} BTC
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Seller</p>
                        <p className="font-mono text-xs truncate">
                          {listing.seller.toString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyListing(listing.id, listing.price_sats)}
                        disabled={listing.seller.toString() === principal?.toString()}
                        className="w-full bg-green-600 text-white px-4 py-2 font-bold border-2 border-black hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {listing.seller.toString() === principal?.toString() ? "Your Listing" : "Buy Now"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Listings</h2>
              {myListings.length === 0 ? (
                <p className="text-gray-600">You don&apos;t have any active listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myListings.map((listing) => (
                    <div key={listing.id.toString()} className="border-2 border-black p-4 bg-gray-50">
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Listing ID</p>
                        <p className="font-mono text-sm">{listing.id.toString()}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Vault ID</p>
                        <p className="font-mono text-sm">{listing.vault_id.toString()}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="text-2xl font-bold">
                          {Number(listing.price_sats) / 100_000_000} BTC
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelListing(listing.id)}
                        className="w-full bg-red-600 text-white px-4 py-2 font-bold border-2 border-black hover:bg-red-700"
                      >
                        Cancel Listing
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
