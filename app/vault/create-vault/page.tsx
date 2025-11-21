import CreateVaultForm from "./_components/CreateVaultForm";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "@/app/transition-wrapper";

export default function CreateVaultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TransitionWrapper>
        <VaultHeader />
        <section className="flex flex-col items-stretch min-h-screen">
          <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
            <div className="container mx-auto px-6">
              <div className="mx-auto">
                <CreateVaultForm />
              </div>
            </div>
          </main>
          <Footer />
        </section>
      </TransitionWrapper>
    </div>
  );
}
