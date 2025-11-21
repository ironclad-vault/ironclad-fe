import { Suspense } from "react";
import VaultHeader from "@/components/layout/VaultHeader";
import Footer from "@/components/layout/Footer";
import VaultDetailMain from "./_components/VaultDetailSection";

export const generateStaticParams = () => [];

async function VaultDetailContent({ vaultId }: { vaultId: string }) {
  return <VaultDetailMain vaultId={vaultId} />;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <VaultHeader />
      <section className="flex flex-col items-stretch min-h-screen">
        <main className="pt-24 pb-16 flex-1 flex flex-col gap-8">
          <Suspense
            fallback={
              <div className="container mx-auto px-6">
                <div className="card-brutal p-8 text-center">
                  <p className="body-brutal text-lg text-zinc-400">
                    Loading vault details...
                  </p>
                </div>
              </div>
            }
          >
            <VaultDetailContent vaultId={id} />
          </Suspense>
        </main>
        <Footer />
      </section>
    </div>
  );
}
