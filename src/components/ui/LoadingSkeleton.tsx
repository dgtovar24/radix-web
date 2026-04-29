interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 5, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="w-10 h-10 rounded-lg bg-[var(--border)] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-3 w-32 rounded bg-[var(--border)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="h-4 w-32 rounded bg-[var(--border)] animate-pulse mb-4" />
      <div className="h-8 w-24 rounded bg-[var(--border)] animate-pulse" />
    </div>
  );
}