import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "../transition-wrapper";

export default function VaultPage() {
  const principalId = "2vxsx-paeaaa-caaaa-aaaaa-q"; // mock principal id

  return (
    <div className="min-h-screen flex flex-col bg-(--color-bg-primary)">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault" principalId={principalId} />

        {/* Main Content */}
        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <div className="container mx-auto px-6">
              <div className="card-brutal">
                <h1 className="heading-brutal text-3xl mb-6">YOUR VAULTS</h1>
                <p className="body-brutal text-xl mb-8">
                  View and manage your Bitcoin vaults
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-brutal">
                    <h2 className="heading-brutal text-lg mb-2">STATUS</h2>
                    <p className="body-brutal text-sm text-gray-600">
                      Monitor your vault balances and lock timers
                    </p>
                  </div>

                  <div className="card-brutal">
                    <h2 className="heading-brutal text-lg mb-2">DEPOSIT</h2>
                    <p className="body-brutal text-sm text-gray-600">
                      Create a new vault by depositing Bitcoin
                    </p>
                  </div>

                  <div className="card-brutal">
                    <h2 className="heading-brutal text-lg mb-2">WITHDRAW</h2>
                    <p className="body-brutal text-sm text-gray-600">
                      Release funds when lock timers expire
                    </p>
                  </div>

                  <div className="card-brutal">
                    <h2 className="heading-brutal text-lg mb-2">HISTORY</h2>
                    <p className="body-brutal text-sm text-gray-600">
                      View your transaction history
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
