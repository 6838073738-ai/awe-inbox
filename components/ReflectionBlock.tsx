export function ReflectionBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`prose-reflection ${className}`}>{children}</div>
  );
}
