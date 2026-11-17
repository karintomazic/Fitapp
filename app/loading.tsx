export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <span role="status" className="sr-only">
        Loading
      </span>
      <div aria-hidden className="flex animate-pulse flex-col gap-5 motion-reduce:animate-none">
        <div className="h-8 w-40 rounded-full bg-track" />
        <div className="glass h-44 rounded-3xl" />
        <div className="glass h-28 rounded-3xl" />
        <div className="glass h-28 rounded-3xl" />
      </div>
    </div>
  );
}
