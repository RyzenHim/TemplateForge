const variants = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 active:bg-indigo-800 focus-visible:ring-indigo-500/40",

  secondary:
    "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300 hover:shadow-md active:bg-gray-400/60 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:active:bg-zinc-600 focus-visible:ring-gray-400/40 dark:focus-visible:ring-zinc-500/40",

  outline:
    "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:shadow-sm active:bg-indigo-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950 dark:active:bg-indigo-900 focus-visible:ring-indigo-500/40",

  delete:
    "inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-500 active:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300 dark:active:text-red-500 focus-visible:ring-red-500/40",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "delete";
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const isDelete = variant === "delete";

  return (
    <button
      className={`
        ${isDelete ? "" : "rounded-lg px-4 py-2 active:scale-[0.97]"}
        font-medium
        cursor-pointer
        transition-all
        duration-200
        ease-out
        outline-none
        focus-visible:ring-4
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:shadow-none
        disabled:active:scale-100
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
