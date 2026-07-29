import { Search, X } from "lucide-react";
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
    <Card className="p-2 transition-shadow duration-300">
      <div className="group relative">
        {/* Animated gradient glow ring on focus */}
        <div
          className="
            pointer-events-none
            absolute
            -inset-0.5
            rounded-xl
            bg-gradient-to-r
            from-indigo-500
            via-purple-500
            to-indigo-500
            opacity-0
            blur-md
            transition-opacity
            duration-500
            group-focus-within:opacity-30
          "
        />

        <div className="relative">
          <Search
            size={20}
            strokeWidth={2.25}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-400
              transition-all
              duration-300
              group-focus-within:scale-110
              group-focus-within:text-indigo-500
              group-focus-within:rotate-6
            "
          />

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              py-3
              pl-12
              pr-12
              text-sm
              text-zinc-900
              placeholder:text-zinc-400
              outline-none
              transition-all
              duration-300
              ease-out
              hover:border-zinc-300
              hover:shadow-sm
              focus:border-indigo-500
              focus:bg-white
              focus:shadow-lg
              focus:shadow-indigo-500/10
              focus:ring-4
              focus:ring-indigo-500/10
              dark:border-zinc-700
              dark:bg-zinc-900
              dark:text-white
              dark:hover:border-zinc-600
              dark:focus:border-indigo-500
              dark:focus:bg-zinc-950
              dark:focus:shadow-indigo-500/20
            "
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                animate-[fadeIn_0.15s_ease-out]
                items-center
                justify-center
                rounded-full
                text-zinc-400
                transition-all
                duration-200
                hover:rotate-90
                hover:bg-zinc-200
                hover:text-zinc-700
                active:scale-90
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }
      `}</style>
    </Card>
  );
}
