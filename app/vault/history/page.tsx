import { Suspense } from "react";
import HistoryMain from "./_components/HistoryMain";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><div className="border-2 border-black p-8 bg-white"><p className="text-gray-600">Loading...</p></div></div>}>
      <HistoryMain />
    </Suspense>
  );
}
