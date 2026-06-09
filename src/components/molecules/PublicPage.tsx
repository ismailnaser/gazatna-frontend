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
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader title={title} description={description} />
        {children}
      </div>
    </div>
  );
}
