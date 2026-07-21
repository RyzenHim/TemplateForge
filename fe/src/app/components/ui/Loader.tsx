"use client";

interface LoaderProps {
  text?: string;
}

export default function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm dark:bg-zinc-950/80">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-indigo-600" />

        <p className="text-sm font-medium text-zinc-500">{text}</p>
      </div>
    </div>
  );
}
  