export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-steel-200 border-t-signal-500"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
