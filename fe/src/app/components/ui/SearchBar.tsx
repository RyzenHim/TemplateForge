import { Search } from "lucide-react";

import Card from "@/app/components/ui/Card";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <Card>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          placeholder={placeholder}
        />
      </div>
    </Card>
  );
}
