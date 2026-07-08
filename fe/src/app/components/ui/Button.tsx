const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",

  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white",

  outline:
    "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950",
};
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
