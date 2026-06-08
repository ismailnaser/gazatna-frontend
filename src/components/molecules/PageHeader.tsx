export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-p-green sm:text-3xl">{title}</h1>
      <div className="mt-2 h-1 w-16 rounded-full bg-p-red" />
      {description && (
        <p className="mt-3 text-p-black/60">{description}</p>
      )}
    </div>
  );
}
