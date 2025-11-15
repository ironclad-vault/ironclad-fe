"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useMarketplace } from "@/hooks/ironclad/useMarketplace";
import { useVaults } from "@/hooks/ironclad/useVaults";
import InfoBox from "@/app/vault/_components/InfoBox";
import { TrendingUp, ShoppingCart, Tag } from "lucide-react";

export default function MarketplaceMain() {
  const { isConnected, principal } = useWallet();
  const {
    listings,
    myListings,
    loading,
    error,
    createListing,
    cancelListing,
    buyListing,
  } = useMarketplace();

  // Ensure we use 'listings' to fix unused warning
  const { vaults, loading: vaultsLoading } = useVaults();

  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my-listings">(
    "browse"
  );
  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [priceBTC, setPriceBTC] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateListing = async () => {
    if (!selectedVaultId || !priceBTC) {
      return;
    }

    setCreating(true);
    setSuccessMessage(null);
    try {
      // Convert BTC to satoshis (1 BTC = 100,000,000 satoshis)
      const priceSats = BigInt(Math.floor(parseFloat(priceBTC) * 100_000_000));
      const success = await createListing(BigInt(selectedVaultId), priceSats);
      if (success) {
        setSuccessMessage("Listing created successfully!");
        setSelectedVaultId("");
        setPriceBTC("");
        setActiveTab("my-listings");
      }
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

    try {
      await cancelListing(listingId);
      setSuccessMessage("Listing cancelled successfully!");
    } catch (err) {
      console.error("Cancel listing failed:", err);
    }
  };

  const handleBuyListing = async (listingId: bigint, priceSats: bigint) => {
    const priceBTC = Number(priceSats) / 100_000_000;
    if (
      !confirm(
        `Are you sure you want to purchase this vault for ${priceBTC.toFixed(8)} BTC?`
      )
    ) {
      return;
    }

    try {
      const success = await buyListing(listingId);
      if (success) {
        setSuccessMessage("Vault purchased successfully!");
        setActiveTab("browse");
      }
    } catch (err) {
      console.error("Buy listing failed:", err);
    }
  };

  const handleTabChange = (tab: "browse" | "create" | "my-listings") => {
    setActiveTab(tab);
    setSuccessMessage(null);
  };

  if (!isConnected) {
    return (
      <div className="card-brutal p-8 text-center max-w-2xl mx-auto">
        <h2 className="heading-brutal text-2xl mb-4">CONNECT YOUR WALLET</h2>
        <p className="body-brutal text-lg text-gray-600">
          Please connect your wallet to access the marketplace.
        </p>
      </div>
    );
  }

  if (loading || vaultsLoading) {
    return (
      <div className="card-brutal p-8 text-center max-w-2xl mx-auto">
        <p className="body-brutal text-lg text-gray-600">Loading marketplace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-brutal p-8 bg-red-50 border-red-300 max-w-2xl mx-auto">
        <h2 className="heading-brutal text-lg text-red-900 mb-2">ERROR</h2>
        <p className="body-brutal text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="card-brutal p-4 bg-green-50 border-green-300">
          <p className="body-brutal font-bold text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="card-brutal">
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => handleTabChange("browse")}
            className={`flex-1 px-6 py-4 font-bold heading-brutal border-r-2 border-black transition-colors ${
              activeTab === "browse"
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <ShoppingCart className="inline mr-2" size={18} />
            BROWSE ({listings.length})
          </button>
          <button
            onClick={() => handleTabChange("create")}
            className={`flex-1 px-6 py-4 font-bold heading-brutal border-r-2 border-black transition-colors ${
              activeTab === "create"
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <Tag className="inline mr-2" size={18} />
            CREATE
          </button>
          <button
            onClick={() => handleTabChange("my-listings")}
            className={`flex-1 px-6 py-4 font-bold heading-brutal transition-colors ${
              activeTab === "my-listings"
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="inline mr-2" size={18} />
            MY LISTINGS ({myListings.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Browse Listings Tab */}
          {activeTab === "browse" && (
            <div className="space-y-6">
              <h1 className="heading-brutal text-3xl">MARKETPLACE</h1>

              {listings.length === 0 ? (
                <div className="card-brutal p-8 text-center">
                  <p className="body-brutal text-lg text-gray-600">
                    No active listings available.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => {
                    const isOwnListing =
                      listing.seller.toString() === principal?.toString();
                    const vaultDetails = vaults.find(
                      (v) => v.id === listing.vault_id
                    );

                    return (
                      <div
                        key={listing.id.toString()}
                        className="card-brutal p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Listing ID
                            </p>
                            <p className="mono-brutal text-sm">
                              {listing.id.toString()}
                            </p>
                          </div>

                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Vault ID
                            </p>
                            <p className="mono-brutal text-sm">
                              {listing.vault_id.toString()}
                            </p>
                          </div>

                          {vaultDetails && (
                            <div>
                              <p className="body-brutal text-xs text-gray-500 uppercase">
                                Vault Balance
                              </p>
                              <p className="heading-brutal text-lg">
                                {(Number(vaultDetails.balance) / 100_000_000).toFixed(
                                  8
                                )}{" "}
                                BTC
                              </p>
                            </div>
                          )}

                          <div className="border-t-2 border-black pt-3">
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Price
                            </p>
                            <p className="heading-brutal text-2xl">
                              {(Number(listing.price_sats) / 100_000_000).toFixed(8)} BTC
                            </p>
                          </div>

                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Seller
                            </p>
                            <p className="mono-brutal text-xs truncate">
                              {listing.seller.toString().slice(0, 20)}...
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleBuyListing(listing.id, listing.price_sats)
                          }
                          disabled={isOwnListing}
                          className={`w-full button-brutal py-3 font-bold ${
                            isOwnListing
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {isOwnListing ? "YOUR LISTING" : "BUY NOW"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Create Listing Tab */}
          {activeTab === "create" && (
            <div className="space-y-6 max-w-2xl">
              <h1 className="heading-brutal text-3xl">CREATE LISTING</h1>

              <div className="card-brutal p-8 space-y-4">
                <div>
                  <label className="body-brutal text-sm font-bold mb-2 block">
                    SELECT VAULT
                  </label>
                  <select
                    value={selectedVaultId}
                    onChange={(e) => setSelectedVaultId(e.target.value)}
                    className="input-brutal w-full"
                  >
                    <option value="">-- Select a vault --</option>
                    {vaults.map((vault) => (
                      <option key={vault.id.toString()} value={vault.id.toString()}>
                        Vault {vault.id.toString().slice(0, 8)} -{" "}
                        {(Number(vault.balance) / 100_000_000).toFixed(8)} BTC
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="body-brutal text-sm font-bold mb-2 block">
                    PRICE (BTC)
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={priceBTC}
                    onChange={(e) => setPriceBTC(e.target.value)}
                    placeholder="0.00000000"
                    className="input-brutal w-full"
                  />
                  <p className="body-brutal text-xs text-gray-600 mt-2">
                    Enter price in BTC (will be converted to satoshis)
                  </p>
                </div>

                <button
                  onClick={handleCreateListing}
                  disabled={!selectedVaultId || !priceBTC || creating}
                  className="button-brutal accent w-full py-3 font-bold"
                >
                  {creating ? "CREATING..." : "CREATE LISTING"}
                </button>
              </div>

              <InfoBox title="MARKETPLACE INFO">
                <p className="body-brutal mb-3">
                  List your vault for sale on the marketplace. Other users can
                  browse and purchase your vault. Once sold, ownership transfers
                  to the buyer.
                </p>
                <p className="body-brutal text-sm text-gray-600">
                  Note: Auto-reinvest configurations are automatically disabled
                  when a vault is sold.
                </p>
              </InfoBox>
            </div>
          )}

          {/* My Listings Tab */}
          {activeTab === "my-listings" && (
            <div className="space-y-6">
              <h1 className="heading-brutal text-3xl">MY LISTINGS</h1>

              {myListings.length === 0 ? (
                <div className="card-brutal p-8 text-center">
                  <p className="body-brutal text-lg text-gray-600">
                    You don&apos;t have any active listings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => {
                    const vaultDetails = vaults.find(
                      (v) => v.id === listing.vault_id
                    );

                    return (
                      <div
                        key={listing.id.toString()}
                        className="card-brutal p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Listing ID
                            </p>
                            <p className="mono-brutal text-sm">
                              {listing.id.toString()}
                            </p>
                          </div>

                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Vault ID
                            </p>
                            <p className="mono-brutal text-sm">
                              {listing.vault_id.toString()}
                            </p>
                          </div>

                          {vaultDetails && (
                            <div>
                              <p className="body-brutal text-xs text-gray-500 uppercase">
                                Vault Balance
                              </p>
                              <p className="heading-brutal text-lg">
                                {(Number(vaultDetails.balance) / 100_000_000).toFixed(
                                  8
                                )}{" "}
                                BTC
                              </p>
                            </div>
                          )}

                          <div className="border-t-2 border-black pt-3">
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Price
                            </p>
                            <p className="heading-brutal text-2xl">
                              {(Number(listing.price_sats) / 100_000_000).toFixed(8)} BTC
                            </p>
                          </div>

                          <div>
                            <p className="body-brutal text-xs text-gray-500 uppercase">
                              Status
                            </p>
                            <span
                              className={`px-3 py-1 text-xs font-bold border-2 border-black inline-block ${
                                "Active" in listing.status
                                  ? "bg-green-200 text-green-900"
                                  : "Filled" in listing.status
                                    ? "bg-blue-200 text-blue-900"
                                    : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              {"Active" in listing.status
                                ? "ACTIVE"
                                : "Filled" in listing.status
                                  ? "SOLD"
                                  : "CANCELLED"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={!("Active" in listing.status)}
                          className={`w-full button-brutal py-3 font-bold ${
                            !("Active" in listing.status)
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {!("Active" in listing.status) ? "LISTING CLOSED" : "CANCEL LISTING"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
