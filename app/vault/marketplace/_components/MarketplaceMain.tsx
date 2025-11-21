"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/useWallet";
import { useMarketplace } from "@/hooks/ironclad/useMarketplace";
import { useVaults } from "@/hooks/ironclad/useVaults";
import InfoBox from "@/app/vault/_components/InfoBox";
import { TrendingUp, ShoppingCart, Tag } from "lucide-react";
import { getVaultStatus } from "@/lib/vaultUtils";
import BTCAmount from "@/components/ui/BTCAmount";

export default function MarketplaceMain() {
  const { isConnected, principal } = useWallet();
  const {
    listings,
    myListings,
    loading,
    createListing,
    cancelListing,
    buyListing,
  } = useMarketplace();

  const { vaults, loading: vaultsLoading } = useVaults();

  const [activeTab, setActiveTab] = useState<
    "browse" | "create" | "my-listings"
  >("browse");
  const [selectedVaultId, setSelectedVaultId] = useState<string>("");
  const [priceBTC, setPriceBTC] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const handleCreateListing = async () => {
    if (!selectedVaultId || !priceBTC) {
      return;
    }

    setCreating(true);
    try {
      const priceSats = BigInt(Math.floor(parseFloat(priceBTC) * 100_000_000));
      const success = await createListing(BigInt(selectedVaultId), priceSats);
      if (success) {
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
    } catch (err) {
      console.error("Cancel listing failed:", err);
    }
  };

  const handleBuyListing = async (listingId: bigint, priceSats: bigint) => {
    const priceBTC = Number(priceSats) / 100_000_000;
    if (
      !confirm(
        `Are you sure you want to purchase this vault for ${priceBTC.toFixed(
          8
        )} BTC?`
      )
    ) {
      return;
    }

    try {
      const success = await buyListing(listingId);
      if (success) {
        setActiveTab("browse");
      }
    } catch (err) {
      console.error("Buy listing failed:", err);
    }
  };

  const handleTabChange = (tab: "browse" | "create" | "my-listings") => {
    setActiveTab(tab);
  };

  if (!isConnected) {
    return (
      <div className="card-brutal brutal-border border-2 p-8 text-center mx-auto">
        <h2 className="heading-brutal text-3xl mb-4">CONNECT YOUR WALLET</h2>
        <p className="body-brutal text-lg text-gray-700">
          Please connect your wallet to access the marketplace.
        </p>
      </div>
    );
  }

  if (loading || vaultsLoading) {
    return (
      <div className="card-brutal brutal-border border-2 p-8 text-center mx-auto">
        <p className="body-brutal text-lg text-gray-700">
          Loading marketplace...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto">
      {/* Tabs Navigation */}
      <div className="card-brutal brutal-border border-2">
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => handleTabChange("browse")}
            className={`flex-1 px-6 py-5 font-bold heading-brutal border-r-2 border-black transition-all hover-lift ${
              activeTab === "browse"
                ? "bg-accent text-black"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <ShoppingCart className="inline mr-2" size={18} />
            BROWSE ({listings.length})
          </button>
          <button
            onClick={() => handleTabChange("create")}
            className={`flex-1 px-6 py-5 font-bold heading-brutal border-r-2 border-black transition-all hover-lift ${
              activeTab === "create"
                ? "bg-accent text-black"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <Tag className="inline mr-2" size={18} />
            CREATE
          </button>
          <button
            onClick={() => handleTabChange("my-listings")}
            className={`flex-1 px-6 py-5 font-bold heading-brutal transition-all hover-lift ${
              activeTab === "my-listings"
                ? "bg-accent text-black"
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
              <h1 className="heading-brutal text-4xl mb-6">MARKETPLACE</h1>

              {listings.length === 0 ? (
                <div className="card-brutal brutal-border border-2 p-8 text-center">
                  <p className="body-brutal text-lg text-gray-700">
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

                    let yieldPercent = 0;
                    let discountPercent = 0;
                    if (vaultDetails) {
                      const vaultBalance = Number(vaultDetails.balance);
                      const priceSats = Number(listing.price_sats);
                      yieldPercent = ((vaultBalance - priceSats) / priceSats) * 100;
                      discountPercent = ((vaultBalance - priceSats) / vaultBalance) * 100;
                    }

                    return (
                      <div
                        key={listing.id.toString()}
                        className="card-pro p-6"
                      >
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-label mb-1">LISTING ID</p>
                              <p className="mono-brutal text-sm">
                                {listing.id.toString().slice(0, 16)}...
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-label mb-1">VAULT ID</p>
                              <p className="mono-brutal text-sm">
                                #{listing.vault_id.toString()}
                              </p>
                            </div>
                          </div>

                          {yieldPercent > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                              🚀 +{yieldPercent.toFixed(1)}% YIELD
                            </div>
                          )}

                          {vaultDetails && (
                            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                              <p className="text-label mb-2">VAULT BALANCE</p>
                              <p className="heading-brutal text-lg">
                                <BTCAmount sats={vaultDetails.balance} showLabel={true} />
                              </p>
                            </div>
                          )}

                          <div className="border-t border-zinc-200 pt-4">
                            <p className="text-label mb-2">ASKING PRICE</p>
                            <div className="flex items-center">
                              <p className="heading-brutal text-3xl text-emerald-600">
                                <BTCAmount sats={listing.price_sats} showLabel={true} />
                              </p>
                              {discountPercent > 0 && (
                                <span className="text-xs text-zinc-500 font-medium ml-2">
                                  ({discountPercent.toFixed(1)}% DISCOUNT)
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-label mb-1">SELLER</p>
                            <p className="mono-brutal text-xs text-zinc-600 truncate">
                              {listing.seller.toString().slice(0, 20)}...
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleBuyListing(listing.id, listing.price_sats)
                          }
                          disabled={isOwnListing}
                          className={`w-full py-3 font-semibold rounded-lg transition-all ${
                            isOwnListing
                              ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                              : "btn-pro accent hover:shadow-lg"
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
            <div className="space-y-6 ">
              <h1 className="heading-brutal text-3xl mb-3!">CREATE LISTING</h1>

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
                    {vaults
                      .filter((vault) => getVaultStatus(vault) !== "Withdrawn")
                      .map((vault) => (
                        <option
                          key={vault.id.toString()}
                          value={vault.id.toString()}
                        >
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
              <h1 className="heading-brutal text-3xl mb-3!">MY LISTINGS</h1>

              {myListings.length === 0 ? (
                <div className="card-pro p-8 text-center">
                  <p className="text-body text-lg text-zinc-600">
                    You don&apos;t have any active listings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => {
                    const vaultDetails = vaults.find(
                      (v) => v.id === listing.vault_id
                    );

                    let yieldPercent = 0;
                    let discountPercent = 0;
                    if (vaultDetails) {
                      const vaultBalance = Number(vaultDetails.balance);
                      const priceSats = Number(listing.price_sats);
                      yieldPercent = ((vaultBalance - priceSats) / priceSats) * 100;
                      discountPercent = ((vaultBalance - priceSats) / vaultBalance) * 100;
                    }

                    return (
                      <div
                        key={listing.id.toString()}
                        className="card-pro p-6"
                      >
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-label mb-1">LISTING ID</p>
                              <p className="mono-brutal text-sm">
                                {listing.id.toString().slice(0, 16)}...
                              </p>
                            </div>
                            <div>
                              <p className="text-label mb-1">STATUS</p>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                                  "Active" in listing.status
                                    ? "bg-green-50 text-green-700"
                                    : "Filled" in listing.status
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-zinc-100 text-zinc-700"
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

                          {yieldPercent > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                              🚀 +{yieldPercent.toFixed(1)}% YIELD
                            </div>
                          )}

                          <div className="flex justify-between">
                            <div>
                              <p className="text-label mb-1">VAULT ID</p>
                              <p className="mono-brutal text-sm">
                                #{listing.vault_id.toString()}
                              </p>
                            </div>
                            {vaultDetails && (
                              <div className="text-right">
                                <p className="text-label mb-1">VAULT BALANCE</p>
                                <p className="heading-brutal text-lg">
                                  <BTCAmount sats={vaultDetails.balance} showLabel={true} />
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-zinc-200 pt-4">
                            <p className="text-label mb-2">ASKING PRICE</p>
                            <div className="flex items-center">
                              <p className="heading-brutal text-3xl text-emerald-600">
                                <BTCAmount sats={listing.price_sats} showLabel={true} />
                              </p>
                              {discountPercent > 0 && (
                                <span className="text-xs text-zinc-500 font-medium ml-2">
                                  ({discountPercent.toFixed(1)}% DISCOUNT)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={!("Active" in listing.status)}
                          className={`w-full py-3 font-semibold rounded-lg transition-all ${
                            !("Active" in listing.status)
                              ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg"
                          }`}
                        >
                          {!("Active" in listing.status)
                            ? "LISTING CLOSED"
                            : "CANCEL LISTING"}
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
