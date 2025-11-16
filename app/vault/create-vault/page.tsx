import CreateVaultForm from "./_components/CreateVaultForm";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import TransitionWrapper from "@/app/transition-wrapper";

export default function CreateVaultPage() {
  return (
    <TransitionWrapper>
      <VaultHeader />
      <main className="min-h-screen bg-white">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto">
              <CreateVaultForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </TransitionWrapper>
  );
}
