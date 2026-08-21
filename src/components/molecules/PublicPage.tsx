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
    <div className="bg-transparent pt-[var(--nav-height)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {title ? <PageHeader title={title} description={description} /> : null}
        {children}
      </div>
    </div>
  );
}
