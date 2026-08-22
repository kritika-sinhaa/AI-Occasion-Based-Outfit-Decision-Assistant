export function LoadingLooks() {
  return (
    <div className="animate-in">
      <p className="mb-5 text-center text-sm text-ink/50">Styling your looks…</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-square w-full" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton mt-2 h-9 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
