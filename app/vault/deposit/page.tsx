import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import DepositForm from "./_components/DepositForm";
import DepositInfoPanel from "./_components/DepositInfoPanel";
import TransitionWrapper from "../../transition-wrapper";

export default function DepositPage() {
  const principalId = "2vxsx-paeaaa-caaaa-aaaaa-q"; // mock principal id

  return (
    <div className="min-h-screen flex flex-col bg-(--color-bg-primary)">
      <TransitionWrapper>
        <VaultHeader currentPath="/vault/deposit" principalId={principalId} />

        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1">
            <div className="container mx-auto px-6 flex flex-col gap-8">
              <h1 className="heading-brutal text-4xl mb-12 text-center">
                INITIATE NEW VAULT
              </h1>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <DepositForm />
                </div>

                <div>
                  <DepositInfoPanel />
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
