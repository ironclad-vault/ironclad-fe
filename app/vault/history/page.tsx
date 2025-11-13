"use client";

import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import InfoBox from "@/app/vault/_components/InfoBox";
import TransitionWrapper from "../../transition-wrapper";

// Mock Transaction Data
const transactionData = [
  {
    id: "tx-001",
    date: "2023-11-13",
    type: "DEPOSIT",
    amountBTC: "0.75000000",
    status: "CONFIRMED",
    txId: "3f9b0e8c7d2a5f1e4c6b8a9d0f2e5a1b",
  },
  {
    id: "tx-002",
    date: "2023-10-28",
    type: "DEPOSIT",
    amountBTC: "0.50000000",
    status: "CONFIRMED",
    txId: "8d2c1a7e9f3b4e8d6a5c9b7f2e1d0a8c",
  },
  {
    id: "tx-003",
    date: "2023-09-15",
    type: "WITHDRAWAL",
    amountBTC: "0.25000000",
    status: "CONFIRMED",
    txId: "9b7c5e2a1d8f3a9e6c0b4d7f2e8a1c5d",
  },
  {
    id: "tx-004",
    date: "2023-11-12",
    type: "DEPOSIT",
    amountBTC: "0.10000000",
    status: "PENDING",
    txId: "4f8a2e1c9d6b5e3a7f0c2b8d5e9a1f7c",
  },
  {
    id: "tx-005",
    date: "2023-11-11",
    type: "WITHDRAWAL",
    amountBTC: "0.30000000",
    status: "SIGNED",
    txId: "5d9b3e2f0a7c6d4b8e1f9c2a7d5b8e1a",
  },
];

// TransactionTable Component
function TransactionTable() {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-200 text-black";
      case "PENDING":
        return "bg-orange-200 text-black";
      case "SIGNED":
        return "bg-yellow-200 text-black";
      default:
        return "bg-white text-black";
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-4 border-black">
          <thead>
            <tr className="brutal-border-b border-2">
              <th className="text-left p-4 font-bold text-sm">DATE</th>
              <th className="text-left p-4 font-bold text-sm">TYPE</th>
              <th className="text-left p-4 font-bold text-sm">AMOUNT (BTC)</th>
              <th className="text-left p-4 font-bold text-sm">STATUS</th>
              <th className="text-left p-4 font-bold text-sm">TX ID</th>
            </tr>
          </thead>
          <tbody>
            {transactionData.map((transaction) => (
              <tr key={transaction.id} className="brutal-border-b border-2">
                <td className="p-4 text-sm">{transaction.date}</td>
                <td className="p-4 text-sm font-bold">{transaction.type}</td>
                <td className="p-4 text-sm mono-brutal">
                  {transaction.amountBTC}
                </td>
                <td
                  className={`p-4 text-sm font-bold ${getStatusStyle(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </td>
                <td className="p-4 text-xs mono-brutal break-all">
                  {transaction.txId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {transactionData.map((transaction) => (
          <div key={transaction.id} className="card-brutal">
            {/* Transaction Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="heading-brutal text-sm font-bold mb-1">
                  {transaction.type}
                </div>
                <div className="body-brutal text-xs">{transaction.date}</div>
              </div>
              <div
                className={`p-2 text-xs font-bold ${getStatusStyle(
                  transaction.status
                )}`}
              >
                {transaction.status}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <div className="body-brutal text-xs text-gray-600 mb-1">
                AMOUNT
              </div>
              <div className="mono-brutal text-lg font-bold">
                {transaction.amountBTC} BTC
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <div className="body-brutal text-xs text-gray-600 mb-1">
                TX ID
              </div>
              <div className="mono-brutal text-xs bg-(--color-bg-white) border-2 border-black p-3">
                {transaction.txId}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function HistoryPage() {
  const principalId = "2vxsx-paeaaa-caaaa-aaaaa-q"; // mock principal id

  return (
    <div className="min-h-screen flex flex-col bg-(--color-bg-primary)">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault/history" principalId={principalId} />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <div className="container mx-auto px-6 flex flex-col gap-8">
              <h1 className="heading-brutal text-4xl text-center">
                TRANSACTION HISTORY
              </h1>

              <div>
                <InfoBox
                  title="TRANSACTION LOG"
                  value={`${transactionData.length} PAST TRANSACTIONS`}
                />
              </div>

              <div>
                <TransactionTable />
              </div>
            </div>
          </main>

          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
