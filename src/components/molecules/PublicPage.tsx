import { AlAqsaCircuit } from "@/components/decor/AlAqsaCircuit";
import { PageHeader } from "./PageHeader";

export function PublicPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-white">
      <AlAqsaCircuit className="pointer-events-none absolute -end-8 bottom-0 hidden w-48 opacity-20 lg:block" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader title={title} description={description} />
        {children}
      </div>
    </div>
  );
}
