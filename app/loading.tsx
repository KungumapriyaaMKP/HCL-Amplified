import { PencilLoader } from "@/components/ui/loader-1";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAFBFD]">
      <PencilLoader size={140} label="Crafting your personalized learning path…" />
    </div>
  );
}
