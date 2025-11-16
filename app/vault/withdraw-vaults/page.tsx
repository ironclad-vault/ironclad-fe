import WithdrawVaultsMain from "./_components/WithdrawVaultsMain";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "@/app/transition-wrapper";

export default function WithdrawVaultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader />
        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <WithdrawVaultsMain />
          </main>
          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
